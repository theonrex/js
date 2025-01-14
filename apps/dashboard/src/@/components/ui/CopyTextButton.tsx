"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { ToolTipLabel } from "./tooltip";

export function CopyTextButton(props: {
  textToShow: string;
  textToCopy: string;
  tooltip: string;
  className?: string;
  iconClassName?: string;
  variant?:
    | "primary"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  copyIconPosition: "left" | "right";
}) {
  const [isCopied, setIsCopied] = useState(false);
  const copyButton = isCopied ? (
    <CheckIcon
      className={cn("size-3 text-green-500 shrink-0", props.iconClassName)}
    />
  ) : (
    <CopyIcon
      className={cn(
        "size-3 text-muted-foreground shrink-0",
        props.iconClassName,
      )}
    />
  );

  return (
    <ToolTipLabel label={props.tooltip}>
      <Button
        variant={props.variant || "outline"}
        aria-label={props.tooltip}
        className={cn(
          "h-auto w-auto px-2.5 py-1.5 flex gap-2 rounded-lg text-foreground font-normal",
          props.className,
        )}
        onClick={() => {
          navigator.clipboard.writeText(props.textToCopy);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1000);
        }}
      >
        {props.copyIconPosition === "right" ? (
          <>
            <span className="truncate min-w-0"> {props.textToShow} </span>
            {copyButton}
          </>
        ) : (
          <>
            {copyButton}
            <span className="truncate min-w-0"> {props.textToShow} </span>
          </>
        )}
      </Button>
    </ToolTipLabel>
  );
}
