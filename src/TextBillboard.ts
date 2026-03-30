import * as THREE from "three";
import { textToCanvas } from "./layout/textToCanvas.js";
import { canvasToTexture } from "./layout/canvasToTexture.js";
import type { TextBillboardOptions } from "./types.js";

/**
 * Text that always faces the camera (billboard behavior).
 *
 * Call `billboard.update(camera)` each frame in your render loop.
 */
export class TextBillboard {
  public mesh: THREE.Mesh;
  public canvas: HTMLCanvasElement;
  public texture: THREE.CanvasTexture;

  private opts: Required<
    Pick<TextBillboardOptions, "font" | "maxWidth" | "lineHeight" | "color" | "padding" | "borderRadius" | "worldWidth">
  > & TextBillboardOptions;

  constructor(options: TextBillboardOptions) {
    this.opts = {
      font: "18px sans-serif",
      maxWidth: 300,
      lineHeight: 24,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 12,
      borderRadius: 8,
      worldWidth: 1,
      ...options,
    };

    const { canvas, textWidth, textHeight } = textToCanvas(this.opts);
    this.canvas = canvas;
    this.texture = canvasToTexture(canvas);

    const aspect = textWidth / textHeight;
    const worldHeight = this.opts.worldWidth / aspect;

    const geometry = new THREE.PlaneGeometry(this.opts.worldWidth, worldHeight);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    if (options.position) this.mesh.position.copy(options.position);
  }

  /** Call every frame to face the camera. */
  update(camera: THREE.Camera): void {
    this.mesh.lookAt(camera.position);
  }

  updateText(newText: string): void {
    this.opts.text = newText;
    const { canvas, textWidth, textHeight } = textToCanvas(this.opts);
    this.canvas = canvas;
    this.texture.image = canvas;
    this.texture.needsUpdate = true;

    const aspect = textWidth / textHeight;
    const worldHeight = this.opts.worldWidth / aspect;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(this.opts.worldWidth, worldHeight);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    this.texture.dispose();
  }
}
