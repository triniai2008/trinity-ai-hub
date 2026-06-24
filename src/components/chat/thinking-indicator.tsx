// Shimmer-style "Thinking…" indicator for in-flight assistant messages.
export function ThinkingIndicator({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2 text-sm">
      <span className="relative inline-block">
        <span className="bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2s_linear_infinite]">
          {label}…
        </span>
      </span>
    </div>
  );
}
