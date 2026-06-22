"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="border-sky-200 text-sky-700 hover:bg-sky-50"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm" className="border-sky-200 text-sky-700 hover:bg-sky-50">
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </Button>
      </a>
    </div>
  );
}
