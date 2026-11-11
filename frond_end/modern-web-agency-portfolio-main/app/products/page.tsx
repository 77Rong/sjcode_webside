import type { Metadata } from 'next';
import { ProductsShowcase } from '@/components/products-showcase';

export const metadata: Metadata = {
  title: '产品中心',
  description:
    '智慧校园产品矩阵：教务系统、文件管理系统、实验室预约系统、实习管理系统，覆盖教学、资源、实践全场景。',
};

export default function ProductsPage() {
  return <ProductsShowcase />;
}
