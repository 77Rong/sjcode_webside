'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * /products/[id] 子树的错误边界
 * 任何子组件抛错都会被这里捕获，显示中文错误信息 + 重试按钮
 */
export default function DetailError({ error, reset }: DetailErrorProps) {
  React.useEffect(() => {
    // 实际生产环境应接入 Sentry / 日志上报
    console.error('[product detail] 运行时错误:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card/80 p-8 text-center shadow-lg backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-7 w-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold">页面遇到一点问题</h2>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          产品详情页加载失败，请稍后重试。
          {error.digest && (
            <span className="mt-2 block font-mono text-xs text-muted-foreground/70">
              错误编号：{error.digest}
            </span>
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => reset()} className="gap-2">
            重试
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">返回产品列表</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
