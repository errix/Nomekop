import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  REST_POSE,
  cardTiltVars,
  pointerNorm,
  poseFromPointer,
  type CardTiltPose,
} from '../lib/cardTilt';

type TiltHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
};

export function useCardTilt(): {
  pose: CardTiltPose;
  dragging: boolean;
  vars: Record<string, string>;
  handlers: TiltHandlers;
} {
  const [pose, setPose] = useState<CardTiltPose>(REST_POSE);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);

  const applyEvent = useCallback((event: ReactPointerEvent<HTMLElement>, isDragging: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { px, py } = pointerNorm(event.clientX, event.clientY, rect);
    setPose(poseFromPointer(px, py, isDragging));
  }, []);

  const endDrag = useCallback((event?: ReactPointerEvent<HTMLElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setDragging(false);
    setPose(REST_POSE);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
      applyEvent(event, true);
    },
    [applyEvent],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      applyEvent(event, draggingRef.current);
    },
    [applyEvent],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      endDrag(event);
    },
    [endDrag],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      endDrag(event);
    },
    [endDrag],
  );

  const onPointerLeave = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (draggingRef.current) return;
    // Hover exit: park the glare at rest. Tilt is already flat.
    if (event.pointerType === 'mouse') setPose(REST_POSE);
  }, []);

  return {
    pose,
    dragging,
    vars: cardTiltVars(pose),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
  };
}
