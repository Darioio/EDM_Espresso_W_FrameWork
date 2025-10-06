import { useEffect, useRef } from 'react';

type GetEl = () => HTMLElement | null;

export type LiveEditableOptions = {
  debounceMs?: number;
  // Attributes to set on the element when binding (e.g., { contenteditable: 'true', spellcheck: 'false' })
  attributes?: Record<string, string>;
};

/**
 * useLiveEditable
 * Binds a contentEditable element to React state with debounced onInput updates and
 * safe external value reconciliation (won't clobber the caret while typing).
 *
 * - getEl: returns the target element (can be a query into a dynamic container)
 * - value: external HTML string to reflect in the element
 * - onChange: called with the element's innerHTML on input/blur (debounced)
 */
export function useLiveEditable(getEl: GetEl, value: string, onChange: (html: string) => void, opts?: LiveEditableOptions) {
  const debounceRef = useRef<number | null>(null);
  const composingRef = useRef(false);
  const lastAppliedRef = useRef<string>(value);

  // Attach listeners and element attributes
  useEffect(() => {
    const el = getEl();
    if (!el) return;

    // Apply attributes
    if (opts?.attributes) {
      for (const [k, v] of Object.entries(opts.attributes)) {
        el.setAttribute(k, v);
      }
    }

    const emit = () => {
      const html = (el.innerHTML || '').trim();
      lastAppliedRef.current = html;
      onChange(html);
    };

    const schedule = () => {
      if (composingRef.current) return; // don't emit mid-IME
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      const delay = Math.max(0, opts?.debounceMs ?? 200);
      debounceRef.current = window.setTimeout(() => {
        emit();
        debounceRef.current = null;
      }, delay) as unknown as number;
    };

    const onInput = () => schedule();
    const onBlur = () => {
      // Flush immediately on blur
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      emit();
    };
    const onCompStart = () => { composingRef.current = true; };
    const onCompEnd = () => { composingRef.current = false; schedule(); };

    el.addEventListener('input', onInput);
    el.addEventListener('blur', onBlur);
    el.addEventListener('compositionstart', onCompStart);
    el.addEventListener('compositionend', onCompEnd);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      el.removeEventListener('input', onInput);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('compositionstart', onCompStart);
      el.removeEventListener('compositionend', onCompEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEl, opts?.debounceMs]);

  // Reflect external value into the element when safe (avoid clobbering caret)
  useEffect(() => {
    const el = getEl();
    if (!el) return;
    const focused = document.activeElement === el;
    const currentHtml = (el.innerHTML || '').trim();
    // Only update DOM when not focused OR when current DOM diverges due to external change
    if (!focused && currentHtml !== (value || '').trim()) {
      el.innerHTML = value || '';
      lastAppliedRef.current = value || '';
    }
    // If focused and the value equals the last emitted content, do nothing; avoid loops.
  }, [getEl, value]);
}
