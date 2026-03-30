import { describe, it, expect } from "vitest";
import type { LayoutLine } from "../src/types.js";

// Test resolveHit logic directly without Three.js mocking
describe("RaycastText hit resolution", () => {
  const lines: LayoutLine[] = [
    { text: "Hello World", width: 120 },
    { text: "Second line here", width: 160 },
    { text: "Third", width: 50 },
  ];
  const padding = 20;
  const lineHeight = 30;
  const canvasWidth = 200;
  const canvasHeight = lines.length * lineHeight + padding * 2;

  function resolveHit(uvX: number, uvY: number) {
    const canvasX = uvX * canvasWidth;
    const canvasY = (1 - uvY) * canvasHeight;
    const textY = canvasY - padding;
    if (textY < 0) return null;
    const lineIndex = Math.floor(textY / lineHeight);
    if (lineIndex < 0 || lineIndex >= lines.length) return null;
    const line = lines[lineIndex];
    const textX = canvasX - padding;
    const avgCharWidth = line.text.length > 0 ? line.width / line.text.length : 0;
    const charIndex = avgCharWidth > 0
      ? Math.min(Math.floor(textX / avgCharWidth), line.text.length - 1)
      : 0;
    return {
      line: lineIndex,
      charIndex: Math.max(0, charIndex),
      lineText: line.text,
      canvasX,
      canvasY,
    };
  }

  it("returns correct line index for first line", () => {
    // canvasHeight=130, padding=20, lineHeight=30
    // Line 0 starts at canvasY=20. Mid of line 0 = canvasY=35.
    // uvY = 1 - 35/130 = 0.731
    const hit = resolveHit(0.5, 0.731);
    expect(hit).not.toBeNull();
    expect(hit!.line).toBe(0);
    expect(hit!.lineText).toBe("Hello World");
  });

  it("returns correct line index for second line", () => {
    // padding=20, lineHeight=30, so line 1 starts at y=50
    // canvasHeight=130, so UV y for canvasY=55: uvY = 1 - 55/130 = 0.577
    const hit = resolveHit(0.5, 0.577);
    expect(hit).not.toBeNull();
    expect(hit!.line).toBe(1);
  });

  it("returns null for clicks in padding area", () => {
    // UV y near 1.0 -> canvasY near 0 -> in top padding
    const hit = resolveHit(0.5, 0.95);
    expect(hit).toBeNull();
  });

  it("returns null for clicks below text area", () => {
    // UV y near 0 -> canvasY near bottom -> below text
    const hit = resolveHit(0.5, 0.05);
    expect(hit).toBeNull();
  });

  it("returns correct character index", () => {
    // "Hello World" width=120, 11 chars, avgCharWidth ~10.9
    // Click at canvasX = 20+33 = 53 -> textX=33 -> charIndex = floor(33/10.9) = 3
    // Use uvY=0.731 (mid of line 0)
    const canvasXTarget = 53;
    const uvX = canvasXTarget / canvasWidth;
    const hit = resolveHit(uvX, 0.731);
    expect(hit).not.toBeNull();
    expect(hit!.charIndex).toBe(3);
  });
});
