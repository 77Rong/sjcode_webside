'use client';

import { useEffect } from 'react';

/**
 * 应用级错误边界：当某个路由内部抛运行时错误（如 ChunkLoadError）时，
 * 拦截异常并自动恢复，不让浏览器抛 net::ERR_ABORTED。
 *
 * global-error.tsx 处理 root layout 之外的错误，
 * error.tsx 处理页面级错误。两者都要。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[runtime] 页面异常：', error.message);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16">
      <h2 className="text-2xl font-bold mb-3">页面遇到一点问题</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
        开发模式热更新可能造成了临时资源不一致。点击下方按钮即可恢复正常。
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors"
        >
          重试
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const url = window.location.href.split('?')[0];
              window.location.replace(url);
            }
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          强制刷新
        </button>
      </div>
    </div>
  );
}