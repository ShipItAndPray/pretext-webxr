import type * as THREE from "three";

export interface TextPanelOptions {
  text: string;
  font?: string;
  maxWidth?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  /** Width in 3D world units (meters). Height is auto-calculated from aspect ratio. */
  worldWidth?: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

export interface TextBillboardOptions {
  text: string;
  font?: string;
  maxWidth?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  worldWidth?: number;
  position?: THREE.Vector3;
}

export interface TextLabelOptions {
  text: string;
  font?: string;
  maxWidth?: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  worldWidth?: number;
  /** The 3D object this label follows. */
  target: THREE.Object3D;
  /** Offset from the target object's position. */
  offset?: THREE.Vector3;
}

export interface WorldUIOptions {
  width: number;
  height: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  worldWidth?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export interface WorldUIEntry {
  text: string;
  font?: string;
  color?: string;
  x: number;
  y: number;
  maxWidth?: number;
  lineHeight?: number;
}

export interface TextHit {
  /** The line index that was hit. */
  line: number;
  /** The character index within the line. */
  charIndex: number;
  /** The full line text. */
  lineText: string;
  /** Canvas x coordinate of the hit. */
  canvasX: number;
  /** Canvas y coordinate of the hit. */
  canvasY: number;
}

export interface LayoutLine {
  text: string;
  width: number;
}

export interface CanvasRenderResult {
  canvas: HTMLCanvasElement;
  lines: LayoutLine[];
  textWidth: number;
  textHeight: number;
}
