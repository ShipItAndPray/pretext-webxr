import * as THREE from "three";
import { textToCanvas } from "./layout/textToCanvas.js";
import { canvasToTexture } from "./layout/canvasToTexture.js";
import type { TextLabelOptions } from "./types.js";

/**
 * A small text label that follows a target Object3D.
 *
 * Call `label.update(camera)` each frame. The label billboards toward the camera
 * and stays at `target.position + offset`.
 */
export class TextLabel {
  public mesh: THREE.Mesh;
  public canvas: HTMLCanvasElement;
  public texture: THREE.CanvasTexture;

  private target: THREE.Object3D;
  private offset: THREE.Vector3;

  constructor(options: TextLabelOptions) {
    const opts = {
      font: "14px sans-serif",
      maxWidth: 200,
      lineHeight: 20,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: 8,
      borderRadius: 6,
      worldWidth: 0.5,
      ...options,
    };

    this.target = options.target;
    this.offset = options.offset ?? new THREE.Vector3(0, 0.5, 0);

    const { canvas, textWidth, textHeight } = textToCanvas(opts);
    this.canvas = canvas;
    this.texture = canvasToTexture(canvas);

    const aspect = textWidth / textHeight;
    const worldHeight = opts.worldWidth / aspect;

    const geometry = new THREE.PlaneGeometry(opts.worldWidth, worldHeight);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
  }

  /** Call every frame. Follows target and faces camera. */
  update(camera: THREE.Camera): void {
    this.mesh.position.copy(this.target.position).add(this.offset);
    this.mesh.lookAt(camera.position);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    this.texture.dispose();
  }
}
