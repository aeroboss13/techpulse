import { useState, useEffect, useRef } from "react";
import { Check, Copy, Terminal, Code as CodeIcon, Download, ExternalLink } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/show-language/prism-show-language";
import "prismjs/plugins/toolbar/prism-toolbar.css";
import "prismjs/plugins/toolbar/prism-toolbar";
import "prismjs/plugins/match-braces/prism-match-braces";
import "prismjs/plugins/match-braces/prism-match-braces.css";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface CodeSnippetProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  fileName?: string;
}

export default function CodeSnippet({ 
  code, 
  language, 
  showLineNumbers = true, 
  maxHeight = "400px",
  fileName
}: CodeSnippetProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (codeRef.current && code) {
      try {
        // Добавляем небольшую задержку, чтобы DOM успел обновиться
        const timer = setTimeout(() => {
          Prism.highlightElement(codeRef.current);
        }, 0);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Failed to highlight code:", err);
      }
    }
  }, [code, language]);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: t('code.copied'),
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('code.copyFailed'),
        description: t('code.tryAgain'),
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
      a.download = fileName || `code-snippet.${language.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t('code.downloaded'),
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: t('code.downloadFailed'),
        description: t('code.tryAgain'),
        variant: "destructive",
      });
    }
  };
  
  // Map to standard Prism language names
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    cs: "csharp",
    cpp: "cpp",
    php: "php",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    html: "html",
    css: "css",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
  };
  
  const prismLanguage = languageMap[language?.toLowerCase()] || language || "plaintext";
  
  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
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

  // Prepare class names based on options
  const containerClasses = `code-snippet rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-700 shadow-md ${showLineNumbers ? 'line-numbers' : ''}`;
  const preClasses = `${showLineNumbers ? 'line-numbers' : ''} match-braces`;
  
  return (
    <div className={containerClasses} style={{ position: 'relative' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
        <div className="flex items-center">
          {getLanguageIcon(prismLanguage)}
          <span className="font-mono">{fileName || language}</span>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-transparent text-gray-300 hover:bg-gray-700 p-1 h-auto"
            onClick={handleDownload}
            title={t('code.download')}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-transparent text-gray-300 hover:bg-gray-700 p-1 h-auto"
            onClick={handleCopy}
            title={copied ? t('code.copied') : t('code.copy')}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className={preClasses} style={{ margin: 0, borderRadius: 0 }}>
          <code ref={codeRef} className={`language-${prismLanguage}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
