'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrand } from '@/lib/brand-context';

/**
 * 站点品牌标识：优先展示后台「品牌管理」配置的品牌名称与 logo，
 * 未配置 logo 时回退为矢量图形标（浅灰圆角方块 + 四角星），自动适配明暗主题。
 */
export function Logo({ className }: { className?: string }) {
  const { brand } = useBrand();

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {/* 图形标 */}
      {brand.logo ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-neutral-100 transition-colors dark:bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
        </span>
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-neutral-200 transition-colors dark:bg-neutral-100">
          <Sparkles className="h-[22px] w-[22px] text-neutral-900" strokeWidth={2.4} />
        </span>
      )}
      {/* 文字标 */}
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-[0.08em] text-foreground">
          {brand.name}
        </span>
        <span className="mt-[5px] text-[10px] font-medium tracking-[0.22em] text-muted-foreground">
          职业教育过程管理
        </span>
      </span>
    </span>
  );
}
