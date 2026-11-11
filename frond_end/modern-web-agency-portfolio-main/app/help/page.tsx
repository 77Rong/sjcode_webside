import type { Metadata } from 'next';
import { HelpCenter } from '@/components/help-center';
import { AuthGate } from '@/components/auth/auth-gate';

export const metadata: Metadata = {
  title: '帮助中心',
  description: '按产品查找使用说明、常见问题与最佳实践，覆盖教务系统、文件管理系统、实验室预约系统与实习管理系统。',
};

export default function HelpPage() {
  return (
    <AuthGate>
      <HelpCenter />
    </AuthGate>
  );
}
