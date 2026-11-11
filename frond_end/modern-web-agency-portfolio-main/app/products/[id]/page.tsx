import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products-data';
import { ProductDetailView } from './product-detail-view';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 预渲染所有产品详情页（构建时生成静态 HTML）
 */
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

/**
 * 动态生成 SEO 元数据
 */
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return { title: '产品未找到' };
  }
  return {
    title: product.name,
    description: product.description.slice(0, 120),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    notFound();
  }
  return <ProductDetailView product={product} allProducts={products} />;
}
