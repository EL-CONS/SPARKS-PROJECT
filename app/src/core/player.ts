import { useEffect, useReducer } from 'react';

export interface PlayerState {
  frame: number;
  totalFrames: number;
  playing: boolean;
  fps: number;
  loop: boolean;
}

export type PlayerAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'TICK' }
  | { type: 'SET_FRAME'; frame: number }
  | { type: 'SET_SPEED'; fps: number }
  | { type: 'SET_LOOP'; loop: boolean };

export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createPlayerState(opts: {
  totalFrames: number;
  initialFps?: number;
  loop?: boolean;
  reducedMotion?: boolean;
}): PlayerState {
  const totalFrames = Math.max(1, Math.floor(opts.totalFrames));
  const reduced = opts.reducedMotion ?? detectReducedMotion();
  return {
    frame: 0,
    totalFrames,
    playing: !reduced,
    fps: Math.max(1, Math.min(12, opts.initialFps ?? 2)),
    loop: opts.loop ?? true,
  };
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  const max = Math.max(1, state.totalFrames);
  switch (action.type) {
    case 'PLAY':
      return { ...state, playing: true };
    case 'PAUSE':
      return { ...state, playing: false };
    case 'TOGGLE':
      return { ...state, playing: !state.playing };
    case 'NEXT':
      return {
        ...state,
        playing: false,
        frame: state.frame + 1 < max ? state.frame + 1 : state.loop ? 0 : max - 1,
      };
    case 'PREV':
      return {
        ...state,
        playing: false,
        frame: state.frame - 1 >= 0 ? state.frame - 1 : state.loop ? max - 1 : 0,
      };
    case 'TICK': {
      if (!state.playing) return state;
      if (state.frame + 1 < max) {
        return { ...state, frame: state.frame + 1 };
      }
      return state.loop ? { ...state, frame: 0 } : { ...state, playing: false };
    }
    case 'SET_FRAME': {
      const clamped = Math.max(0, Math.min(max - 1, Math.floor(action.frame)));
      return { ...state, playing: false, frame: clamped };
    }
    case 'SET_SPEED':
      return { ...state, fps: Math.max(1, Math.min(12, action.fps)) };
    case 'SET_LOOP':
      return { ...state, loop: action.loop };
  }
}

export function usePlayer(opts: { totalFrames: number; initialFps?: number; loop?: boolean }) {
  const [state, dispatch] = useReducer(playerReducer, opts, createPlayerState);

  useEffect(() => {
    if (!state.playing) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000 / state.fps);
    return () => clearInterval(id);
  }, [state.playing, state.fps]);

  return {
    ...state,
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    toggle: () => dispatch({ type: 'TOGGLE' }),
    next: () => dispatch({ type: 'NEXT' }),
    prev: () => dispatch({ type: 'PREV' }),
    setFrame: (frame: number) => dispatch({ type: 'SET_FRAME', frame }),
    setSpeed: (fps: number) => dispatch({ type: 'SET_SPEED', fps }),
    setLoop: (loop: boolean) => dispatch({ type: 'SET_LOOP', loop }),
  };
}
