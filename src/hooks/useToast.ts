import { useState, useCallback, useRef } from 'react';

interface Toast {
  icon: string;
  message: string;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<Toast>({ icon: '', message: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((icon: string, message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ icon, message, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  return { toast, showToast };
}
