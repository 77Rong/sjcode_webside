import type { Metadata } from 'next';
import { ForgotPasswordView, AuthPageShell } from '@/components/auth/auth-views';

export const metadata: Metadata = {
  title: '找回密码',
  description: '通过绑定邮箱验证身份并重置密码。',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordView mode="page" />
    </AuthPageShell>
  );
}
