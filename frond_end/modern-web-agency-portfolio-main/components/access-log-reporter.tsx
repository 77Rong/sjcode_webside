'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { reportAccessLog } from '@/lib/brand-api';

/**
 * 站点访问记录上报
 * 每次路由变化时向 /api/access-log 上报一次访问（IP / 地区 / 时间 / 路径）。
 */
export function AccessLogReporter() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!pathname || lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    let timezone = '';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      timezone = '';
    }

    // 上报失败不影响页面，静默处理
    reportAccessLog({
      path: pathname,
      timezone,
      userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    }).catch((err) => {
      console.warn('[access-log] 上报访问记录失败', err);
    });
  }, [pathname]);

  return null;
}
