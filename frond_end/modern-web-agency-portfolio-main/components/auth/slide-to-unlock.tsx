'use client';

import * as React from 'react';
import { ChevronRight, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideToUnlockProps {
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
  className?: string;
}

/**
 * 滑动解锁：按住滑块拖到最右端完成验证；未满程松手自动回弹。
 */
export function SlideToUnlock({ verified, onVerifiedChange, className }: SlideToUnlockProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLButtonElement>(null);
  const startXRef = React.useRef(0);
  const maxXRef = React.useRef(0);
  const [x, setX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const THUMB_SIZE = 40; // h-10 w-10
  const PADDING = 4;

  const reset = React.useCallback(() => {
    setX(0);
    setDragging(false);
    onVerifiedChange(false);
  }, [onVerifiedChange]);

  const handlePointerMove = React.useCallback(
    (e: PointerEvent) => {
      const maxX = maxXRef.current;
      const next = Math.min(Math.max(e.clientX - startXRef.current, 0), maxX);
      setX(next);
      if (next >= maxX - 2) {
        setX(maxX);
        setDragging(false);
        onVerifiedChange(true);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handlePointerUp = React.useCallback(() => {
    setDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    // 未满程回弹
    setX((cur) => {
      if (cur < maxXRef.current - 2) {
        onVerifiedChange(false);
        return 0;
      }
      return cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePointerMove]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (verified) return;
    const track = trackRef.current;
    if (!track) return;
    maxXRef.current = track.clientWidth - THUMB_SIZE - PADDING * 2;
    // 外部把 verified 重置为 false（如登录失败）时，滑块若停在终点则先归零
    if (x >= maxXRef.current - 2) {
      setX(0);
      startXRef.current = e.clientX;
    } else {
      startXRef.current = e.clientX - x;
    }
    setDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  React.useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // 外部重置（如切换登录失败后）
  React.useImperativeHandle(
    thumbRef,
    () =>
      ({
        reset,
      }) as unknown as HTMLButtonElement,
    [reset]
  );

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative h-11 w-full select-none overflow-hidden rounded-md border transition-colors',
        verified
          ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-input bg-muted'
      )}
    >
      {/* 提示文字 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
          )}
        >
          {verified ? '验证通过' : '按住滑块，拖动到最右侧'}
        </span>
      </div>

      {/* 已滑过区域 */}
      <div
        className={cn(
          'absolute rounded-md transition-colors',
          verified ? 'bg-emerald-500/20' : 'bg-primary/10',
          !dragging && !verified && 'transition-all duration-300'
        )}
        style={{ left: PADDING, top: 2, bottom: 2, width: x + THUMB_SIZE }}
      />

      {/* 滑块按钮 */}
      <button
        type="button"
        aria-label={verified ? '已完成滑动验证' : '滑动解锁'}
        onPointerDown={handlePointerDown}
        disabled={verified}
        className={cn(
          'absolute flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-md text-white shadow-sm transition-colors',
          verified
            ? 'bg-emerald-500'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          dragging && 'cursor-grabbing',
          !dragging && !verified && 'transition-transform duration-300'
        )}
        style={{ left: PADDING + x, top: 2 }}
      >
        {verified ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {/* 重置按钮 */}
      {verified && (
        <button
          type="button"
          onClick={reset}
          aria-label="重新验证"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
