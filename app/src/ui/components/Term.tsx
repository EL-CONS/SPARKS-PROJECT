// Living glossary: any technical word opens a short explanation on tap,
// click, or keyboard. Escape or a click outside closes it.
import { useEffect, useId, useRef, useState } from 'react';
import type { TermId, UiDict } from '../../i18n/ui';

interface Props {
  id: TermId;
  t: UiDict;
  children?: React.ReactNode;
}

export function Term({ id, t, children }: Props) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const tipId = useId();
  const term = t.terms[id];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      setAbove(window.innerHeight - r.bottom < 200);
    }
    setOpen(o => !o);
  };

  return (
    <span className="term" ref={wrap}>
      <button
        ref={btn}
        type="button"
        className="term__word"
        aria-expanded={open}
        aria-controls={tipId}
        onClick={toggle}
      >
        {children ?? term.label}
      </button>
      <span
        id={tipId}
        role="note"
        className={`term__tip${above ? ' term__tip--above' : ''}`}
        hidden={!open}
      >
        <strong className="term__name">{term.label}</strong>
        {term.short}
      </span>
    </span>
  );
}
