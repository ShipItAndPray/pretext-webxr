import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import type { CanvasRenderResult, LayoutLine } from "../types.js";

/**
 * Measure text with Pretext, render to an offscreen Canvas.
 *
 * Pipeline: Text -> Pretext (measure + line break) -> Canvas 2D (render)
 */
export function textToCanvas(options: {
  text: string;
  font?: string;
  maxWidth?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}): CanvasRenderResult {
  const {
    text,
    font = "24px sans-serif",
    maxWidth = 400,
    lineHeight = 32,
    color = "#ffffff",
    backgroundColor,
    padding = 20,
    borderRadius = 0,
  } = options;

  // 1. Measure with Pretext
  const prepared = prepareWithSegments(text, font);
  const innerWidth = Math.max(maxWidth - padding * 2, 1);
  const laid = layoutWithLines(prepared, innerWidth, lineHeight);

  const lines: LayoutLine[] = laid.lines.map((l) => ({
    text: l.text,
    width: l.width,
  }));

  const contentWidth = lines.length > 0
    ? Math.ceil(Math.max(...lines.map((l) => l.width)))
    : 0;
  const textWidth = contentWidth + padding * 2;
  const textHeight = lines.length * lineHeight + padding * 2;

  // 2. Create Canvas at measured dimensions
  const canvas = document.createElement("canvas");
  canvas.width = textWidth;
  canvas.height = textHeight;
  const ctx = canvas.getContext("2d")!;

  // 3. Background (with optional rounded corners)
  if (backgroundColor) {
    ctx.beginPath();
    if (borderRadius > 0) {
      roundRect(ctx, 0, 0, textWidth, textHeight, borderRadius);
    } else {
      ctx.rect(0, 0, textWidth, textHeight);
    }
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  // 4. Render each line
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  lines.forEach((line, i) => {
    ctx.fillText(line.text, padding, padding + i * lineHeight);
  });

  return { canvas, lines, textWidth, textHeight };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
