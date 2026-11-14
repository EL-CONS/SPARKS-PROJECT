import { describe, it, expect } from 'vitest';
import { createPlayerState, playerReducer } from '../src/core/player';

describe('player state machine', () => {
  it('starts paused when prefers-reduced-motion is enabled', () => {
    const s = createPlayerState({ totalFrames: 3, reducedMotion: true });
    expect(s.playing).toBe(false);
    expect(s.frame).toBe(0);
  });

  it('steps forward/backward and wraps when loop is true', () => {
    let s = createPlayerState({ totalFrames: 3, reducedMotion: false });
    s = playerReducer(s, { type: 'NEXT' });
    expect(s.frame).toBe(1);
    expect(s.playing).toBe(false);
    s = playerReducer(s, { type: 'PREV' });
    expect(s.frame).toBe(0);
    s = playerReducer(s, { type: 'PREV' });
    expect(s.frame).toBe(2);
  });

  it('advances on TICK when playing and clamps speed', () => {
    let s = createPlayerState({ totalFrames: 2, reducedMotion: false });
    s = playerReducer(s, { type: 'SET_SPEED', fps: 20 });
    expect(s.fps).toBe(12);
    s = playerReducer(s, { type: 'TICK' });
    expect(s.frame).toBe(1);
    s = playerReducer(s, { type: 'TICK' });
    expect(s.frame).toBe(0);
  });
});
