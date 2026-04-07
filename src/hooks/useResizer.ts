import { useCallback, useEffect, useRef } from 'react';

interface UseResizerOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  editorRef: React.RefObject<HTMLDivElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
}

export function useResizer({ containerRef, editorRef, previewRef, enabled }: UseResizerOptions) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startEdW = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      dragging.current = true;
      startX.current = e.clientX;
      startEdW.current = editorRef.current?.offsetWidth ?? 400;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    },
    [enabled, editorRef],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const ep = editorRef.current;
      const pp = previewRef.current;
      const wa = containerRef.current;
      if (!ep || !pp || !wa) return;
      const totalW = wa.offsetWidth;
      const minW = 260;
      const newEdW = Math.min(totalW - minW - 5, Math.max(minW, startEdW.current + (e.clientX - startX.current)));
      ep.style.width = `${newEdW}px`;
      pp.style.width = `${totalW - newEdW - 5}px`;
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [containerRef, editorRef, previewRef]);

  return { onMouseDown };
}
