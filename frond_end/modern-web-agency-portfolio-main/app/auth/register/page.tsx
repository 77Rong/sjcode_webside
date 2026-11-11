import type { Metadata } from 'next';
import { RegisterView, AuthPageShell } from '@/components/auth/auth-views';

export const metadata: Metadata = {
  title: '注册账号',
  description: '使用邮箱注册世纪源创账号。',
};

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterView mode="page" />
    </AuthPageShell>
  );
}
