export { cn } from "@agent-native/core/client";

export function isMacPlatform(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
  );
}

export function shortcutModifierLabel(): string {
  return isMacPlatform() ? "\u2318" : "Ctrl";
}

export function formatCompactCurrency(
  value: number | null | undefined,
): string {
  if (value == null || isNaN(Number(value))) return "$0";
  const n = Number(value);
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || isNaN(Number(value))) return "0";
  const n = Number(value);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n.toFixed(0)}`;
}
