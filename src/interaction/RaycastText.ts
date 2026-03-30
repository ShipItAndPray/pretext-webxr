import * as THREE from "three";
import type { TextHit, LayoutLine } from "../types.js";

/**
 * Detects clicks/hovers on TextPanel meshes in VR or desktop.
 *
 * Uses Three.js Raycaster to hit-test, then converts UV coordinates
 * back to canvas pixel coordinates and finally to line/character position.
 */
export class RaycastText {
  private raycaster: THREE.Raycaster;

  constructor() {
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Test a ray against text panel meshes.
   *
   * @param origin - Ray origin (e.g. controller position or camera)
   * @param direction - Ray direction
   * @param meshes - Array of text panel meshes to test
   */
  castRay(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    meshes: THREE.Mesh[],
  ): THREE.Intersection[] {
    this.raycaster.set(origin, direction.normalize());
    return this.raycaster.intersectObjects(meshes);
  }

  /**
   * From a mouse event, cast into the scene and find text hits.
   */
  castFromMouse(
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    meshes: THREE.Mesh[],
  ): THREE.Intersection[] {
    this.raycaster.setFromCamera(mouse, camera);
    return this.raycaster.intersectObjects(meshes);
  }

  /**
   * Given an intersection with a text panel, determine which line/char was hit.
   *
   * @param intersect - The Three.js intersection result (must have uv)
   * @param canvasWidth - The canvas width of the text panel
   * @param canvasHeight - The canvas height of the text panel
   * @param lines - The layout lines from textToCanvas
   * @param padding - The padding used when rendering
   * @param lineHeight - The line height used when rendering
   */
  resolveHit(
    intersect: THREE.Intersection,
    canvasWidth: number,
    canvasHeight: number,
    lines: LayoutLine[],
    padding: number,
    lineHeight: number,
  ): TextHit | null {
    if (!intersect.uv) return null;

    const canvasX = intersect.uv.x * canvasWidth;
    const canvasY = (1 - intersect.uv.y) * canvasHeight;

    // Determine line
    const textY = canvasY - padding;
    if (textY < 0) return null;

    const lineIndex = Math.floor(textY / lineHeight);
    if (lineIndex < 0 || lineIndex >= lines.length) return null;

    const line = lines[lineIndex];

    // Approximate character index based on even spacing
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
}
