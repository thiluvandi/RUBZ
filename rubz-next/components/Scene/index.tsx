'use client';

import { useEffect } from 'react';

/** Fixed canvas, nav, sound/drop buttons. The WebGL engine loads after hydration and binds to this markup. */
export default function Scene() {
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import('./engine')
      .then((m) => {
        if (!cancelled) dispose = m.startRubz();
      })
      .catch(() => document.documentElement.classList.add('no-gl'));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <>
      <canvas id="gl" aria-hidden="true" />
      <div className="veil" aria-hidden="true" />
      <header className="nav">
        <button className="mark" type="button" data-go="s0" aria-label="Back to top">
          RUB<b>Z</b>
        </button>
        <nav className="links" aria-label="Sections">
          <button type="button" data-go="s1">Decks</button>
          <button type="button" data-go="s2">Campus</button>
          <button type="button" data-go="s3">Stages</button>
          <button type="button" data-go="s4">Abroad</button>
          <button type="button" data-go="s5">Book</button>
        </nav>
        <button className="pill" id="soundBtn" type="button" aria-pressed="false">Sound off</button>
      </header>
      <button className="drop" id="dropBtn" type="button">Drop</button>
      <div className="tip" id="tip" hidden />
    </>
  );
}
