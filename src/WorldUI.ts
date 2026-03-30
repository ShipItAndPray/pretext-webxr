import * as THREE from "three";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { canvasToTexture } from "./layout/canvasToTexture.js";
import type { WorldUIOptions, WorldUIEntry } from "./types.js";

/**
 * A full UI panel rendered in 3D space.
 *
 * Unlike TextPanel (single text block), WorldUI lets you place multiple text
 * entries at arbitrary positions on a single canvas/texture.
 */
export class WorldUI {
  public mesh: THREE.Mesh;
  public canvas: HTMLCanvasElement;
  public texture: THREE.CanvasTexture;

  private opts: Required<Pick<WorldUIOptions, "width" | "height" | "worldWidth" | "backgroundColor" | "borderRadius">> & WorldUIOptions;

  constructor(options: WorldUIOptions) {
    this.opts = {
      worldWidth: 2,
      backgroundColor: "rgba(20,20,30,0.9)",
      borderRadius: 12,
      ...options,
    };

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.opts.width;
    this.canvas.height = this.opts.height;

    this.drawBackground();

    this.texture = canvasToTexture(this.canvas);

    const aspect = this.opts.width / this.opts.height;
    const worldHeight = this.opts.worldWidth / aspect;
    const geometry = new THREE.PlaneGeometry(this.opts.worldWidth, worldHeight);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    if (options.position) this.mesh.position.copy(options.position);
    if (options.rotation) this.mesh.rotation.copy(options.rotation);
  }

  /** Add a text entry at a specific (x, y) on the canvas. */
  addText(entry: WorldUIEntry): void {
    const {
      text,
      font = "20px sans-serif",
      color = "#ffffff",
      x,
      y,
      maxWidth = this.opts.width - x,
      lineHeight = 26,
    } = entry;

    const ctx = this.canvas.getContext("2d")!;
    const prepared = prepareWithSegments(text, font);
    const result = layoutWithLines(prepared, maxWidth, lineHeight);

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    result.lines.forEach((line, i) => {
      ctx.fillText(line.text, x, y + i * lineHeight);
    });

    this.texture.needsUpdate = true;
  }

  /** Clear the canvas and redraw the background. */
  clear(): void {
    const ctx = this.canvas.getContext("2d")!;
    ctx.clearRect(0, 0, this.opts.width, this.opts.height);
    this.drawBackground();
    this.texture.needsUpdate = true;
  }

  private drawBackground(): void {
    const ctx = this.canvas.getContext("2d")!;
    const { width, height, backgroundColor, borderRadius } = this.opts;
    ctx.beginPath();
    if (borderRadius > 0) {
      ctx.moveTo(borderRadius, 0);
      ctx.arcTo(width, 0, width, height, borderRadius);
      ctx.arcTo(width, height, 0, height, borderRadius);
      ctx.arcTo(0, height, 0, 0, borderRadius);
      ctx.arcTo(0, 0, width, 0, borderRadius);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, width, height);
    }
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    this.texture.dispose();
  }
}
