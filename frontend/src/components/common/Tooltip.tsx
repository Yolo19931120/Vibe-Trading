import { useState, useRef, useEffect, type ReactNode } from "react";

interface Props {
  content: string;
  children: ReactNode;
}

/** Lightweight CSS tooltip — replaces the native browser `title` attribute with a styled popup. */
export function Tooltip({ content, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
  }, [visible]);

  function show() {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setVisible(true);
  }
  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  }

  return (
    <span
      ref={wrapperRef}
      className="inline-flex min-w-0"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className="fixed z-[9999] px-2.5 py-1.5 rounded-lg text-xs font-medium leading-relaxed
                     bg-foreground text-background
                     shadow-lg shadow-black/20 dark:shadow-black/30
                     ring-1 ring-white/15 dark:ring-white/10
                     pointer-events-none select-none
                     max-w-[220px] break-words whitespace-normal text-left"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {content}
          <span
            className="absolute left-1/2 -translate-x-1/2 top-full
                       border-[5px] border-transparent
                       border-t-foreground"
          />
        </span>
      )}
    </span>
  );
}
