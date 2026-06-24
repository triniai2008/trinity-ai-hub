// Inline actions rendered under each assistant message.
import { Copy, RefreshCw, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MessageActions({
  text,
  onRegenerate,
  model,
}: {
  text: string;
  onRegenerate?: () => void;
  model?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text });
      } catch {
        /* user dismissed */
      }
    } else {
      await copy();
      toast.success("Copied to share");
    }
  };

  return (
    <div className="mt-2 flex items-center gap-1 text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={copy}
        aria-label="Copy message"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        Copy
      </Button>
      {onRegenerate ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={onRegenerate}
          aria-label="Regenerate"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={share}
        aria-label="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      {model ? (
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          {model}
        </span>
      ) : null}
    </div>
  );
}
