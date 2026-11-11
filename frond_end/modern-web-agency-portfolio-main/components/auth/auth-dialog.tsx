'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginView, RegisterView, ForgotPasswordView } from '@/components/auth/auth-views';
import { Logo } from '@/components/logo';

/**
 * 全局登录/注册/忘记密码弹窗。
 * - 普通模式：可点遮罩 / Esc / 右上角 X 关闭
 * - 强制模式（帮助页门禁）：不可关闭，登录成功后自动放行
 * - 登录 / 注册成功后，若存在 redirect 地址则自动跳转
 */
export function AuthDialog() {
  const { dialog, closeAuth, user } = useAuth();
  const router = useRouter();

  // 监听登录态：成功后跳转 redirect
  React.useEffect(() => {
    if (user && dialog.redirect) {
      router.push(dialog.redirect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !dialog.forced) closeAuth();
  };

  return (
    <DialogPrimitive.Root open={dialog.open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        {/* 半透明遮罩 + 毛玻璃模糊 */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          onPointerDownOutside={(e) => {
            if (dialog.forced) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (dialog.forced) e.preventDefault();
          }}
          className="fixed left-1/2 top-1/2 z-[61] max-h-[92vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border bg-card p-7 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:p-9"
        >
          {/* 顶部品牌 */}
          <div className="mb-6 flex items-center justify-center">
            <Logo />
          </div>

          {!dialog.forced && (
            <DialogPrimitive.Close
              aria-label="关闭"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          )}

          {dialog.forced && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              帮助中心仅对登录用户开放，请先登录
            </p>
          )}

          {/* 视图切换时整体淡入，确保滑动验证等内部状态重置 */}
          <DialogPrimitive.Title className="sr-only">
            {dialog.view === 'login' ? '用户登录' : dialog.view === 'register' ? '注册账号' : '找回密码'}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {dialog.view === 'login'
              ? '输入用户名和密码并完成滑动验证'
              : dialog.view === 'register'
              ? '使用邮箱注册账号'
              : '通过绑定邮箱找回密码'}
          </DialogPrimitive.Description>

          {dialog.view === 'login' && <LoginView key="login" mode="dialog" />}
          {dialog.view === 'register' && <RegisterView key="register" mode="dialog" />}
          {dialog.view === 'forgot' && <ForgotPasswordView key="forgot" mode="dialog" />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
