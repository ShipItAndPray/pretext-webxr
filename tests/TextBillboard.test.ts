import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @chenglou/pretext
vi.mock("@chenglou/pretext", () => ({
  prepareWithSegments: vi.fn(() => ({ prepared: true })),
  layoutWithLines: vi.fn(() => ({
    lineCount: 1,
    height: 24,
    lines: [
      { text: "Score: 100", width: 120 },
    ],
  })),
}));

// Mock THREE
const mockLookAt = vi.fn();
const mockPositionCopy = vi.fn().mockReturnThis();
const mockRotationCopy = vi.fn();
const mockDispose = vi.fn();

vi.mock("three", () => {
  const Vector3 = vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    copy: mockPositionCopy,
    add: vi.fn().mockReturnThis(),
  }));

  const Euler = vi.fn().mockImplementation(() => ({
    copy: mockRotationCopy,
  }));

  return {
    CanvasTexture: vi.fn().mockImplementation(() => ({
      needsUpdate: false,
      colorSpace: "",
      minFilter: 0,
      magFilter: 0,
      dispose: mockDispose,
      image: null,
    })),
    PlaneGeometry: vi.fn().mockImplementation(() => ({
      dispose: mockDispose,
    })),
    MeshBasicMaterial: vi.fn().mockImplementation(() => ({
      dispose: mockDispose,
    })),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { copy: mockPositionCopy, x: 0, y: 0, z: 0 },
      rotation: { copy: mockRotationCopy },
      lookAt: mockLookAt,
      geometry: { dispose: mockDispose },
      material: { dispose: mockDispose },
    })),
    Vector3,
    Euler,
    DoubleSide: 2,
    SRGBColorSpace: "srgb",
    LinearFilter: 1006,
  };
});

// Mock DOM canvas
vi.stubGlobal("document", {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      fillText: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      font: "",
      fillStyle: "",
      textBaseline: "",
    }),
  }),
});

import * as THREE from "three";
import { TextBillboard } from "../src/TextBillboard.js";

describe("TextBillboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a mesh", () => {
    const billboard = new TextBillboard({
      text: "Score: 100",
    });
    expect(billboard.mesh).toBeDefined();
  });

  it("calls lookAt(camera.position) on update to always face camera", () => {
    const billboard = new TextBillboard({
      text: "Score: 100",
    });

    const cameraPos = new THREE.Vector3(5, 3, 10);
    const mockCamera = { position: cameraPos } as THREE.Camera;

    billboard.update(mockCamera);

    expect(mockLookAt).toHaveBeenCalledWith(cameraPos);
  });

  it("rotates to face camera from different positions", () => {
    const billboard = new TextBillboard({
      text: "Test",
    });

    const pos1 = new THREE.Vector3(1, 0, 0);
    billboard.update({ position: pos1 } as THREE.Camera);
    expect(mockLookAt).toHaveBeenCalledWith(pos1);

    const pos2 = new THREE.Vector3(-1, 5, -3);
    billboard.update({ position: pos2 } as THREE.Camera);
    expect(mockLookAt).toHaveBeenCalledWith(pos2);
  });
});
