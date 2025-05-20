import { useState } from "react";
import { Check, Copy, Terminal, Code as CodeIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface CodeSnippetProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  fileName?: string;
}

export default function CodeSnippet({ 
  code = "", 
  language = "plaintext", 
  showLineNumbers = true, 
  maxHeight = "400px",
  fileName
}: CodeSnippetProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  // Map to display names for languages
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    py: "Python",
    python: "Python",
    rb: "Ruby",
    ruby: "Ruby",
    cs: "C#",
    csharp: "C#",
    cpp: "C++",
    php: "PHP",
    go: "Go",
    rs: "Rust",
    rust: "Rust",
    java: "Java",
    kt: "Kotlin",
    kotlin: "Kotlin",
    swift: "Swift",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    sh: "Bash",
    bash: "Bash",
    json: "JSON",
    yml: "YAML",
    yaml: "YAML",
    md: "Markdown",
    markdown: "Markdown",
    plaintext: "Plain Text",
  };
  
  const displayLanguage = languageMap[language?.toLowerCase()] || language || "Plain Text";
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: t('code.copied') || "Copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('code.copyFailed') || "Failed to copy",
        description: t('code.tryAgain') || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `code-snippet.${language?.toLowerCase() || 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t('code.downloaded') || "File downloaded",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: t('code.downloadFailed') || "Download failed", 
        description: t('code.tryAgain') || "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const getLanguageIcon = (lang: string) => {
    switch (lang?.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
      case 'tsx':
        return <CodeIcon className="h-4 w-4 mr-1" />;
      case 'bash':
      case 'sh':
      case 'shell':
      case 'cmd':
        return <Terminal className="h-4 w-4 mr-1" />;
      default:
        return <CodeIcon className="h-4 w-4 mr-1" />;
    }
  };

  // Format code for display
  const formatLines = () => {
    if (!code) return [];
    return code.split('\n');
  };

  const codeLines = formatLines();
  
  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-700 shadow-md" style={{ position: 'relative' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
        <div className="flex items-center">
          {getLanguageIcon(language)}
          <span className="font-mono">{fileName || displayLanguage}</span>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-transparent text-gray-300 hover:bg-gray-700 p-1 h-auto"
            onClick={handleDownload}
            title={t('code.download') || "Download"}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-transparent text-gray-300 hover:bg-gray-700 p-1 h-auto"
            onClick={handleCopy}
            title={copied ? (t('code.copied') || "Copied") : (t('code.copy') || "Copy")}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <div className="p-4">
          {showLineNumbers ? (
            <div className="flex">
              <div className="pr-4 text-right text-gray-500 select-none min-w-[32px]">
                {codeLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 m-0 overflow-visible">
                <code className="text-gray-200 font-mono text-sm whitespace-pre">
                  {codeLines.map((line, i) => (
                    <div key={i}>{line || " "}</div>
                  ))}
                </code>
              </pre>
            </div>
          ) : (
            <pre className="m-0 overflow-visible">
              <code className="text-gray-200 font-mono text-sm whitespace-pre">
                {code}
              </code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
