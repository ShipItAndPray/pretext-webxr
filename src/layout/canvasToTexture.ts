import * as THREE from "three";

/**
 * Upload an HTMLCanvasElement as a THREE.CanvasTexture.
 *
 * Sets sensible defaults for text readability (linear filtering, sRGB).
 */
export function canvasToTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
