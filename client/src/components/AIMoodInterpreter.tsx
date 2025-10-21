import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AIMoodInterpreterProps {
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
}

export function AIMoodInterpreter({ onSubmit, isProcessing = false }: AIMoodInterpreterProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-primary/20 rounded-xl p-6 transition-all duration-300",
        isProcessing && "animate-pulse"
      )}
      data-testid="panel-ai-interpreter"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Mood Interpreter</h3>
      </div>
      
      <Textarea
        data-testid="input-mood-text"
        placeholder="Describe how you're feeling... (e.g., 'Had a long day, want something light and comforting')"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[120px] mb-4 bg-background rounded-lg focus:ring-2 ring-primary"
        disabled={isProcessing}
      />
      
      <Button
        data-testid="button-interpret-mood"
        onClick={handleSubmit}
        disabled={!text.trim() || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Interpreting your mood...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Find Movies for My Mood
          </>
        )}
      </Button>
    </div>
  );
}
