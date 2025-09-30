"use client";
import React from "react";
import EnhancedLoader from "../ui/EnhancedLoader";

type Props = {
  onComplete: () => void;
  minDurationMs?: number;
};

export default function LoadingOverlay({ onComplete, minDurationMs = 1200 }: Props) {
  return (
    <EnhancedLoader
      fullscreen
      type="branded"
      onComplete={onComplete}
      minDuration={minDurationMs}
    />
  );
}
