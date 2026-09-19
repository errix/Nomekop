/**
 * Fullscreen inspect tilt + soft white glare.
 *
 * Pointer math only — no foil / rainbow / holo. Used by CardFullscreen.
 * Grid tiles and the density modal do not consume this.
 *
 * Drag: rotateX/Y from pointer; glare tracks the same point.
 * Idle hover: glare tracks; rotation stays at rest (flat).
 * Release: caller springs back to REST_POSE.
 */

export type CardTiltPose = {
  /** rotateX degrees. Positive = tilt top toward viewer. */
  rx: number;
  /** rotateY degrees. Positive = tilt right toward viewer. */
  ry: number;
  /** Glare hotspot X, 0–100. */
  gx: number;
  /** Glare hotspot Y, 0–100. */
  gy: number;
};

export const TILT_MAX_RY = 36;
export const TILT_MAX_RX = 28;

/** Resting hotspot — slightly above center, matching the flat mock. */
export const REST_GLARE_X = 50;
export const REST_GLARE_Y = 35;

export const REST_POSE: CardTiltPose = {
  rx: 0,
  ry: 0,
  gx: REST_GLARE_X,
  gy: REST_GLARE_Y,
};

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

export function pointerNorm(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { px: number; py: number } {
  if (rect.width <= 0 || rect.height <= 0) return { px: 0.5, py: 0.5 };
  return {
    px: (clientX - rect.left) / rect.width,
    py: (clientY - rect.top) / rect.height,
  };
}

export function glareFromPointer(px: number, py: number): Pick<CardTiltPose, 'gx' | 'gy'> {
  return {
    gx: clamp01(px) * 100,
    gy: clamp01(py) * 100,
  };
}

export function tiltFromPointer(px: number, py: number): Pick<CardTiltPose, 'rx' | 'ry'> {
  const cx = clamp01(px);
  const cy = clamp01(py);
  return {
    ry: (cx - 0.5) * TILT_MAX_RY,
    rx: (0.5 - cy) * TILT_MAX_RX,
  };
}

/** Idle hover updates glare only. Drag updates tilt + glare. */
export function poseFromPointer(px: number, py: number, dragging: boolean): CardTiltPose {
  const glare = glareFromPointer(px, py);
  if (!dragging) {
    return { rx: 0, ry: 0, ...glare };
  }
  return { ...tiltFromPointer(px, py), ...glare };
}

export function cardTiltVars(pose: CardTiltPose): Record<string, string> {
  return {
    '--rx': String(pose.rx),
    '--ry': String(pose.ry),
    '--gx': `${pose.gx}%`,
    '--gy': `${pose.gy}%`,
  };
}
