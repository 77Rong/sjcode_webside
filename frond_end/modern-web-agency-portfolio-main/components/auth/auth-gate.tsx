'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthDialog } from '@/components/auth/auth-dialog';

/**
 * 登录门禁：未登录时内容模糊且不可交互，同时弹出强制登录对话框。
 * 等待本地会话恢复完成后再判断，避免已登录用户被误拦。
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, hydrated, openAuth, dialog } = useAuth();

  React.useEffect(() => {
    if (hydrated && !user && !dialog.open) {
      openAuth({ view: 'login', forced: true, redirect: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user]);

  if (user) return <>{children}</>;

  return (
    <>
      <div aria-hidden className="pointer-events-none select-none blur-[6px] saturate-50">
        {children}
      </div>
      {hydrated && <AuthDialog />}
    </>
  );
}
