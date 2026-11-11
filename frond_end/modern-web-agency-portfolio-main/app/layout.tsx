import './globals.css';
import '@/lib/network-guard';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/lib/auth-context';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { BrandProvider } from '@/lib/brand-context';
import { AccessLogReporter } from '@/components/access-log-reporter';
import { fetchBrandConfigServer } from '@/lib/brand-api';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const brand = await fetchBrandConfigServer();
  return {
    title: {
      default: `${brand.name} - 高等教育过程管理专家`,
      template: `%s - ${brand.name}`,
    },
    description:
      `${brand.name}专注于高等教育过程管理研发与服务，覆盖教学服务、学生管理、校务办公等核心场景，让校园管理更智能，让教学过程更高效。`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 服务端预取品牌，首屏即渲染后台配置的品牌信息
  const brand = await fetchBrandConfigServer();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <BrandProvider initialBrand={brand}>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <AuthDialog />
              <AccessLogReporter />
            </BrandProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}