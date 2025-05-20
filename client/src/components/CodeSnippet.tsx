import { useState, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippetProps {
  code: string;
  language: string;
}

export default function CodeSnippet({ code, language }: CodeSnippetProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
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
  
  const prismLanguage = languageMap[language.toLowerCase()] || language;
  
  return (
    <div className="code-snippet rounded-lg overflow-hidden bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-400 text-sm">
        <span>{language}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="copy-btn bg-gray-800 text-white hover:bg-gray-700 p-1 h-auto"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code ref={codeRef} className={`language-${prismLanguage}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
