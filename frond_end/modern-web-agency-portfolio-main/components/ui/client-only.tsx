'use client';

/**
 * 客户端挂载守卫 — 避免 framer-motion 的 initial 样式与 SSR 输出的 HTML 不一致，
 * 引发 "Hydration failed" 控制台报错。
 *
 * 用法：包裹所有依赖浏览器 API 或 framer-motion 的子树。
 */
import * as React from 'react';

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
