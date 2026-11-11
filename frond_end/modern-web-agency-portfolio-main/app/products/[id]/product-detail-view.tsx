'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
  Layers,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  BookOpen,
  Users,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { type Product } from '@/lib/products-data';

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
};

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
}

/**
 * 产品详情页（参考设计稿）
 *
 * 页面结构：
 *  ┌──────────────────────────────────────────────┐
 *  │  Banner：左/右空白 + 居中标题+副标题+面包屑    │
 *  ├────────┬─────────────────────────────────────┤
 *  │ 左侧栏 │  右侧正文（产品概述 / 功能 / 场景…）   │
 *  │  目录  │                                     │
 *  └────────┴─────────────────────────────────────┘
 */
export function ProductDetailView({ product, allProducts }: ProductDetailViewProps) {
  const Icon = productIcons[product.icon] ?? LayoutGrid;
  const related = allProducts.filter((p) => p.id !== product.id);

  /** 详情页内含完整的产品文档（正文） */
  const doc = buildProductDoc(product);

  return (
    <div className="flex flex-col bg-white">
      {/* Banner */}
      <section className="relative flex items-center justify-center overflow-hidden">
        <div className="relative h-[280px] w-full sm:h-[320px]">
          <Image
            src="/images/jiaoshi.jpg"
            alt={`${product.name} Banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="container absolute inset-0 z-10 mx-auto flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/90 drop-shadow sm:text-lg">
            {product.tagline}
          </p>
          <Breadcrumb className="mt-6">
            <BreadcrumbList className="text-white/85">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">产品</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">产品详情</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* 主体：左侧目录 + 右侧正文 */}
      <section className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          {/* 左侧目录 */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <Icon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold">{product.name}</span>
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-500">{product.tagline}</div>
              <div className="mt-4 border-t pt-4">
                <nav className="space-y-1.5 text-sm">
                  {doc.toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded px-2 py-1.5 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="mt-5 rounded-md border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-blue-700">
                  <Phone className="h-3.5 w-3.5" />
                  产品咨询
                </div>
                <p className="mt-1.5 leading-5">如需了解{product.name}的部署方案、价格与试用，请联系我们。</p>
                <Button size="sm" className="mt-3 w-full" asChild>
                  <Link href="/contact">
                    在线咨询
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* 右侧正文 */}
          <article className="min-w-0 space-y-10">
            {/* 产品概述 */}
            <Section id="overview" title="产品概述">
              <p className="leading-7 text-slate-700">{product.description}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 数据指标 */}
            <Section id="metrics" title="数据指标">
              <div className="grid gap-3 sm:grid-cols-3">
                {product.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-slate-200 bg-white p-5 text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600 sm:text-3xl">{s.value}</div>
                    <div className="mt-1.5 text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 核心功能 */}
            <Section id="features" title="核心功能">
              <div className="grid gap-3 sm:grid-cols-2">
                {product.features.map((f, i) => {
                  const FIcon = [Layers, ShieldCheck, Sparkles, LayoutGrid, BookOpen, Users][i % 6];
                  return (
                    <div
                      key={f.title}
                      className="rounded-lg border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center gap-2 text-blue-600">
                        <FIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold text-slate-800">{f.title}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{f.description}</p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* 应用场景 */}
            <Section id="scenarios" title="应用场景">
              <div className="space-y-3">
                {product.scenarios.map((s) => (
                  <div key={s.title} className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{s.description}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 部署与服务 */}
            <Section id="service" title="部署与服务">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5 text-sm leading-7 text-slate-700">
                <p>
                  {product.name}支持公有云 SaaS、私有化部署、混合云等多种交付方式，可根据学校规模灵活选择。
                  实施团队会提供从需求调研、部署上线到教师培训的全流程服务，并配备 7×12 小时在线技术支持。
                </p>
              </div>
            </Section>
          </article>
        </div>
      </section>

      {/* 相关产品 */}
      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50/50 py-10">
          <div className="container mx-auto px-4">
            <h3 className="text-base font-semibold text-slate-800">相关产品</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => {
                const PIcon = productIcons[p.icon] ?? LayoutGrid;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <PIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">{p.name}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {p.description}
                      </div>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * 详情页目录
 */
interface DocToc {
  id: string;
  title: string;
}

function buildProductDoc(product: Product): { toc: DocToc[] } {
  return {
    toc: [
      { id: 'overview', title: '产品概述' },
      { id: 'metrics', title: '数据指标' },
      { id: 'features', title: '核心功能' },
      { id: 'scenarios', title: '应用场景' },
      { id: 'service', title: '部署与服务' }
    ]
  };
}

/**
 * 段落组件
 */
function Section({
  id,
  title,
  children
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="border-l-4 border-blue-600 pl-3 text-lg font-semibold text-slate-800">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
