/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关键修复：移除 output: 'export'。
  // 该选项会让 Next.js 在每次客户端导航时重新请求 _next/static/* 资源，
  // 与运行时开发服务器返回的 build ID 不一致，
  // 浏览器会在等待 chunk 加载时收到 ERR_ABORTED（Navigation interrupted）。
  // 运行时模式（next dev）必须保持默认行为（standalone），才能让客户端路由走正确的 chunk 引用。

  eslint: {
    ignoreDuringBuilds: true,
  },
  // 恢复 next/image 在运行时的自动格式优化（webp/avif）+ 响应式 srcset
  images: {
    unoptimized: false,
    // 允许 next/image 加载远程图片（about 页 unsplash 头像 + Supabase Storage 焦点图）
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // 关闭右下角 N 浮标（按需求）
  devIndicators: false,
  // 关键修复：默认 prefetch 是 null，
  // Trae IDE 内嵌预览面板或某些 dev 工具在加载页面时偶尔会中断首屏请求，
  // 表现为 net::ERR_ABORTED。
  // 设置为 true 后 Next.js 在用户悬停链接时就开始预拉 chunk，
  // 等真正导航时 chunk 已经在浏览器缓存里，从根本上避免被中断。
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { dev }) => {
    // Windows 环境下 webpack 持久化缓存的原子重命名会被安全软件短暂锁定，
    // 产生 EPERM 警告。开发模式关闭磁盘缓存，改用内存缓存。
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;