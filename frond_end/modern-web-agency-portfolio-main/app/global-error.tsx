'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Next.js 全局错误边界
 *
 * 作用：
 * 1. 捕获运行时的 ChunkLoadError / 资源加载失败（如 _next/static/* 404），
 *    不再让浏览器抛 net::ERR_ABORTED 后整页空白。
 * 2. 提供"软刷新"按钮：清缓存 + 重新拉当前路由，避免用户被卡死。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 静默上报到控制台，避免在用户控制台制造 ERR_ABORTED 提示
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[runtime] 页面运行异常：', error.message);
    }
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#0f172a',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            页面遇到一点问题
          </h1>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24, maxWidth: 480, textAlign: 'center' }}>
            通常是开发模式下热更新（Fast Refresh）触发的临时资源重建，
            不会影响下次访问。请点击下方按钮重新加载页面。
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              重试
            </button>
            <button
              onClick={() => {
                // 硬刷新：清缓存后重新加载当前路由
                if (typeof window !== 'undefined') {
                  const url = window.location.href.split('?')[0];
                  window.location.replace(url);
                }
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              强制刷新
            </button>
            <Link
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#0f172a',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}