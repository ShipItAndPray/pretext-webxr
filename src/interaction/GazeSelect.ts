import * as THREE from "three";

/**
 * Gaze-based selection for VR headsets without controllers.
 *
 * Casts a ray from the camera center and detects when the user dwells
 * on a text panel long enough to trigger a selection.
 */
export class GazeSelect {
  private raycaster: THREE.Raycaster;
  private dwellTime: number;
  private currentTarget: THREE.Object3D | null = null;
  private dwellStart = 0;

  /**
   * @param dwellTime - Milliseconds the user must gaze at a target to select it (default 1500ms)
   */
  constructor(dwellTime = 1500) {
    this.raycaster = new THREE.Raycaster();
    this.dwellTime = dwellTime;
  }

  /**
   * Call each frame. Returns the selected mesh if dwell time was reached, otherwise null.
   */
  update(camera: THREE.Camera, meshes: THREE.Mesh[]): THREE.Mesh | null {
    // Cast from camera center (gaze direction)
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    this.raycaster.set(camera.position, dir);

    const hits = this.raycaster.intersectObjects(meshes);
    const now = performance.now();

    if (hits.length > 0) {
      const hitObj = hits[0].object;
      if (hitObj === this.currentTarget) {
        // Still gazing at same target
        if (now - this.dwellStart >= this.dwellTime) {
          this.currentTarget = null;
          this.dwellStart = 0;
          return hitObj as THREE.Mesh;
        }
      } else {
        // New target
        this.currentTarget = hitObj;
        this.dwellStart = now;
      }
    } else {
      this.currentTarget = null;
      this.dwellStart = 0;
    }

    return null;
  }

  /** The object currently being gazed at (or null). */
  get gazeTarget(): THREE.Object3D | null {
    return this.currentTarget;
  }

  /** Progress toward dwell selection (0-1). */
  get dwellProgress(): number {
    if (!this.currentTarget) return 0;
    return Math.min((performance.now() - this.dwellStart) / this.dwellTime, 1);
  }
}
