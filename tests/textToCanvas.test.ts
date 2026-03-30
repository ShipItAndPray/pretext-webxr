import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @chenglou/pretext
vi.mock("@chenglou/pretext", () => ({
  prepareWithSegments: vi.fn((_text: string, _font: string) => ({ prepared: true })),
  layoutWithLines: vi.fn((_prepared: unknown, maxWidth: number, _lineHeight: number) => ({
    lineCount: 2,
    height: 64,
    lines: [
      { text: "Hello from WebXR!", width: Math.min(180, maxWidth) },
      { text: "This text wraps properly.", width: Math.min(220, maxWidth) },
    ],
  })),
}));

// Mock DOM canvas
const mockFillText = vi.fn();
const mockFill = vi.fn();
const mockBeginPath = vi.fn();
const mockRect = vi.fn();
const mockClosePath = vi.fn();
const mockMoveTo = vi.fn();
const mockArcTo = vi.fn();

const mockCtx = {
  fillText: mockFillText,
  fill: mockFill,
  beginPath: mockBeginPath,
  rect: mockRect,
  closePath: mockClosePath,
  moveTo: mockMoveTo,
  arcTo: mockArcTo,
  font: "",
  fillStyle: "",
  textBaseline: "",
};

let capturedWidth = 0;
let capturedHeight = 0;

vi.stubGlobal("document", {
  createElement: (tag: string) => {
    if (tag === "canvas") {
      return {
        get width() { return capturedWidth; },
        set width(v: number) { capturedWidth = v; },
        get height() { return capturedHeight; },
        set height(v: number) { capturedHeight = v; },
        getContext: () => mockCtx,
      };
    }
    return {};
  },
});

import { textToCanvas } from "../src/layout/textToCanvas.js";

describe("textToCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedWidth = 0;
    capturedHeight = 0;
  });

  it("creates canvas with dimensions matching Pretext measurement", () => {
    const result = textToCanvas({
      text: "Hello from WebXR!\nThis text wraps properly.",
      font: "24px sans-serif",
      maxWidth: 400,
      lineHeight: 32,
      padding: 20,
    });

    // Content width = max(180, 220) = 220, plus padding*2 = 260
    expect(result.textWidth).toBe(220 + 20 * 2);
    // 2 lines * 32 lineHeight + padding*2 = 104
    expect(result.textHeight).toBe(2 * 32 + 20 * 2);

    // Canvas dimensions should match
    expect(result.canvas.width).toBe(result.textWidth);
    expect(result.canvas.height).toBe(result.textHeight);
  });

  it("returns layout lines from Pretext", () => {
    const result = textToCanvas({
      text: "Hello from WebXR!\nThis text wraps properly.",
      maxWidth: 400,
      lineHeight: 32,
      padding: 20,
    });

    expect(result.lines).toHaveLength(2);
    expect(result.lines[0].text).toBe("Hello from WebXR!");
    expect(result.lines[1].text).toBe("This text wraps properly.");
  });

  it("renders background when backgroundColor is set", () => {
    textToCanvas({
      text: "Hello",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: 10,
    });

    expect(mockBeginPath).toHaveBeenCalled();
    expect(mockFill).toHaveBeenCalled();
  });

  it("calls fillText for each line", () => {
    textToCanvas({
      text: "Hello\nWorld",
      lineHeight: 30,
      padding: 15,
    });

    expect(mockFillText).toHaveBeenCalledTimes(2);
    expect(mockFillText).toHaveBeenCalledWith("Hello from WebXR!", 15, 15);
    expect(mockFillText).toHaveBeenCalledWith("This text wraps properly.", 15, 45);
  });
});
