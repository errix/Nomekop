import { describe, expect, it } from 'vitest';
import {
  REST_POSE,
  TILT_MAX_RX,
  TILT_MAX_RY,
  cardTiltVars,
  clamp01,
  glareFromPointer,
  pointerNorm,
  poseFromPointer,
  tiltFromPointer,
} from './cardTilt';

describe('fullscreen card tilt + glare', () => {
  it('rest pose is flat with a soft hotspot above center', () => {
    expect(REST_POSE).toEqual({ rx: 0, ry: 0, gx: 50, gy: 35 });
  });

  it('maps pointer to rotateX/Y like the drag mock', () => {
    expect(tiltFromPointer(0, 0.5)).toEqual({ rx: 0, ry: -TILT_MAX_RY / 2 });
    expect(tiltFromPointer(1, 0.5)).toEqual({ rx: 0, ry: TILT_MAX_RY / 2 });
    expect(tiltFromPointer(0.5, 0)).toEqual({ rx: TILT_MAX_RX / 2, ry: 0 });
    expect(tiltFromPointer(0.5, 1)).toEqual({ rx: -TILT_MAX_RX / 2, ry: 0 });
    expect(tiltFromPointer(0.5, 0.5)).toEqual({ rx: 0, ry: 0 });
  });

  it('left drag is negative rotateY; right drag is positive', () => {
    const left = tiltFromPointer(0.22, 0.38);
    const right = tiltFromPointer(0.78, 0.42);
    expect(left.ry).toBeLessThan(0);
    expect(right.ry).toBeGreaterThan(0);
  });

  it('glare tracks the same pointer without a rainbow channel', () => {
    expect(glareFromPointer(0.22, 0.38)).toEqual({ gx: 22, gy: 38 });
    expect(glareFromPointer(0.78, 0.42)).toEqual({ gx: 78, gy: 42 });
    const vars = cardTiltVars(poseFromPointer(0.7, 0.3, true));
    expect(vars['--gx']).toBe('70%');
    expect(vars['--gy']).toBe('30%');
    expect(Object.keys(vars).sort()).toEqual(['--gx', '--gy', '--rx', '--ry']);
  });

  it('idle hover updates glare only — no tilt until drag', () => {
    const hover = poseFromPointer(0.8, 0.2, false);
    expect(hover).toEqual({ rx: 0, ry: 0, gx: 80, gy: 20 });

    const drag = poseFromPointer(0.8, 0.2, true);
    expect(drag.gx).toBe(80);
    expect(drag.gy).toBe(20);
    expect(drag.ry).toBeGreaterThan(0);
    expect(drag.rx).toBeGreaterThan(0);
  });

  it('clamps out-of-bounds pointers so tilt cannot blow past the mock range', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(tiltFromPointer(-4, 9)).toEqual({ rx: -TILT_MAX_RX / 2, ry: -TILT_MAX_RY / 2 });
    expect(glareFromPointer(1.4, -0.2)).toEqual({ gx: 100, gy: 0 });
  });

  it('normalizes client coords against the card rect', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 };
    expect(pointerNorm(200, 100, rect)).toEqual({ px: 0.5, py: 0.5 });
    expect(pointerNorm(100, 50, rect)).toEqual({ px: 0, py: 0 });
    expect(pointerNorm(0, 0, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
      px: 0.5,
      py: 0.5,
    });
  });
});
