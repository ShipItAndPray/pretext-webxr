# @shipitandpray/pretext-webxr

Render properly-wrapped multi-line text in WebXR / Three.js scenes using [Pretext](https://github.com/chenglou/pretext) for layout.

The first library to solve text in VR/AR properly.

## The Problem

Text in WebXR is terrible. Your options today:

| Approach | Wrapping | Quality | Depth | Performance |
|----------|----------|---------|-------|-------------|
| `THREE.TextGeometry` | None | 3D extruded | Yes | Huge geometry |
| `troika-three-text` | Basic | SDF artifacts | Yes | Decent |
| HTML overlay | CSS | Good | No immersion | N/A |
| **pretext-webxr** | **Pretext** | **Native canvas** | **Yes** | **< 5ms create** |

> "Trust me you'll have to lay out text in XR and when that day comes, you'll wish you weren't stuck."
> -- Cheng Lou

## How It Works

```
Text -> Pretext (measure + line break) -> Canvas 2D (render) -> THREE.CanvasTexture -> PlaneGeometry mesh
```

1. **Measure** text with Pretext's `prepare()` + `layoutWithLines()` for exact dimensions
2. **Create Canvas** at measured dimensions (with padding, background, border radius)
3. **Render** text to Canvas via `ctx.fillText()` per line
4. **Upload** Canvas as `THREE.CanvasTexture`
5. **Create mesh** with `THREE.PlaneGeometry` and the texture as material
6. **Scale** mesh so `worldWidth` matches the requested physical size in meters

## Install

```bash
npm install @shipitandpray/pretext-webxr three @chenglou/pretext
```

## Usage

```typescript
import { TextPanel, TextBillboard, TextLabel } from '@shipitandpray/pretext-webxr'
import * as THREE from 'three'

// 1. Text panel -- a flat plane with multi-line text
const panel = new TextPanel({
  text: 'Hello from WebXR!\nThis text wraps properly.',
  font: '24px Inter',
  maxWidth: 400,
  lineHeight: 32,
  color: '#ffffff',
  backgroundColor: 'rgba(0,0,0,0.8)',
  padding: 20,
  borderRadius: 12,
  worldWidth: 2,  // meters in 3D space
  position: new THREE.Vector3(0, 1.5, -2),
})
scene.add(panel.mesh)

// Update text dynamically (e.g. streaming AI response)
panel.updateText('New text content here')

// 2. Billboard -- always faces camera
const billboard = new TextBillboard({
  text: 'Score: 100',
  font: '18px Inter',
  position: new THREE.Vector3(1, 2, 0),
})
scene.add(billboard.mesh)

// In your render loop:
billboard.update(camera)

// 3. Label -- attached to another object
const label = new TextLabel({
  text: 'Click me',
  font: '14px Inter',
  target: someObject3D,
  offset: new THREE.Vector3(0, 0.5, 0),
})
scene.add(label.mesh)

// In your render loop:
label.update(camera)
```

### WorldUI -- multiple text entries on one panel

```typescript
import { WorldUI } from '@shipitandpray/pretext-webxr'

const ui = new WorldUI({
  width: 600,
  height: 400,
  worldWidth: 3,
  position: new THREE.Vector3(0, 2, -3),
})
scene.add(ui.mesh)

ui.addText({ text: 'Health: 100', font: '20px monospace', color: '#ff4444', x: 20, y: 20 })
ui.addText({ text: 'Mana: 80', font: '20px monospace', color: '#4488ff', x: 20, y: 60 })
```

### VR Interaction -- raycast click detection

```typescript
import { RaycastText } from '@shipitandpray/pretext-webxr'

const raycast = new RaycastText()
const hits = raycast.castFromMouse(mouseNDC, camera, [panel.mesh])

if (hits.length > 0) {
  const textHit = raycast.resolveHit(
    hits[0], panel.canvas.width, panel.canvas.height,
    panelLines, 20, 32
  )
  if (textHit) {
    console.log(`Clicked line ${textHit.line}: "${textHit.lineText}"`)
  }
}
```

### Gaze selection (headsets without controllers)

```typescript
import { GazeSelect } from '@shipitandpray/pretext-webxr'

const gaze = new GazeSelect(1500) // 1.5s dwell time

// In render loop:
const selected = gaze.update(camera, [panel.mesh, billboard.mesh])
if (selected) {
  console.log('User selected:', selected)
}
console.log('Dwell progress:', gaze.dwellProgress) // 0-1
```

## VR Headset Notes

- Text panels render as standard Three.js meshes, so they work in any WebXR session
- Billboard text auto-faces the camera, which works for both eye in stereo rendering
- Canvas textures are resolution-independent: increase `maxWidth` for sharper text on high-DPI headsets
- For Quest/Pico/Vision Pro: set `worldWidth` in meters for comfortable reading distance (1-3m)
- Gaze selection provides controller-free interaction for standalone headsets

## Comparison with troika-three-text

| Feature | pretext-webxr | troika-three-text |
|---------|--------------|-------------------|
| Line breaking | Pretext (Knuth-Plass quality) | Built-in (basic) |
| Rendering | Canvas texture (pixel-perfect) | SDF (can blur at edges) |
| Font support | Any CSS font | Needs font URL/buffer |
| Bundle size | Tiny (Pretext + thin wrapper) | ~45KB |
| Dynamic updates | Re-render canvas (~2ms) | Re-generate SDF |
| VR interaction | Built-in raycast + gaze | Manual |
| Background/border | Built-in | Manual |
| Multi-entry UI | WorldUI component | Not included |

## Why Pretext for XR

Pretext gives you:
- **Proper line breaking** with Knuth-Plass algorithm quality
- **Exact text measurement** before rendering (no layout shift)
- **Canvas rendering** that looks identical on every device
- **No font loading issues** -- uses whatever CSS fonts are available

## Performance

| Metric | Target |
|--------|--------|
| Panel creation | < 5ms |
| Text update (re-render) | < 2ms |
| Render impact (10 panels) | < 1ms per frame |
| Texture memory (10 panels) | < 10MB |

## Development

```bash
npm install
npm test
npm run build
npx serve .       # open index.html demo
```

## License

MIT
