import * as THREE from "three";
import { textToCanvas } from "./layout/textToCanvas.js";
import { canvasToTexture } from "./layout/canvasToTexture.js";
import type { TextPanelOptions } from "./types.js";

/**
 * A flat 3D plane mesh with multi-line Pretext-laid-out text.
 *
 * Pipeline: Text -> Pretext -> Canvas 2D -> THREE.CanvasTexture -> PlaneGeometry mesh
 */
export class TextPanel {
  public mesh: THREE.Mesh;
  public canvas: HTMLCanvasElement;
  public texture: THREE.CanvasTexture;

  private options: Required<
    Pick<TextPanelOptions, "font" | "maxWidth" | "lineHeight" | "color" | "padding" | "borderRadius" | "worldWidth">
  > & TextPanelOptions;

  constructor(options: TextPanelOptions) {
    this.options = {
      font: "24px sans-serif",
      maxWidth: 400,
      lineHeight: 32,
      color: "#ffffff",
      padding: 20,
      borderRadius: 0,
      worldWidth: 2,
      ...options,
    };

    const { canvas, textWidth, textHeight } = textToCanvas(this.options);
    this.canvas = canvas;
    this.texture = canvasToTexture(canvas);

    const aspect = textWidth / textHeight;
    const worldHeight = this.options.worldWidth / aspect;

    const geometry = new THREE.PlaneGeometry(this.options.worldWidth, worldHeight);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    if (options.position) this.mesh.position.copy(options.position);
    if (options.rotation) this.mesh.rotation.copy(options.rotation);
  }

  /** Re-render with new text. Updates the texture in-place. */
  updateText(newText: string): void {
    this.options.text = newText;
    const { canvas, textWidth, textHeight } = textToCanvas(this.options);
    this.canvas = canvas;

    // Update texture source
    this.texture.image = canvas;
    this.texture.needsUpdate = true;

    // Update geometry to match new aspect ratio
    const aspect = textWidth / textHeight;
    const worldHeight = this.options.worldWidth / aspect;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(this.options.worldWidth, worldHeight);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    this.texture.dispose();
  }
}
