'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
  Check,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Users,
  ShieldCheck,
  LayoutGrid,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CTASection } from '@/components/ui/cta-section';
import { products, type Product } from '@/lib/products-data';

const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
};

// 动画变体
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export function ProductsShowcase() {
  const [active, setActive] = React.useState<Product>(products[0]);

  return (
    <div className="flex flex-col">
      {/* 大标题 Banner */}
      <section className="relative flex items-center justify-center overflow-hidden py-20 sm:py-24">
        {/* Banner 背景图：宽度自适应，cover 铺满 */}
        <Image
          src="/images/jiaoshi.jpg"
          alt="职业教育场景 Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* 遮罩：保证白色文字可读 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-3 text-sm font-medium tracking-[0.2em] text-white/80">
              Our Products
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              我们的产品
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-white/90 drop-shadow">
              覆盖教学教务、学生管理、校务办公等职业教育全场景，助力院校数字化转型。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 产品选择卡片 */}
      <section className="sticky top-16 z-30 border-y bg-background/80 py-3 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {products.map((product) => {
              const Icon = productIcons[product.icon] ?? LayoutGrid;
              const isActive = product.id === active.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActive(product)}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-300',
                    isActive
                      ? 'border-transparent text-white shadow-lg'
                      : 'bg-card/60 hover:border-primary/40 hover:shadow-md'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="product-active-bg"
                      className={cn('absolute inset-0 bg-gradient-to-r', product.accent.gradient)}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive ? 'bg-white/20' : cn(product.accent.soft, product.accent.text)
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="relative min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {product.name}
                    </span>
                    <span
                      className={cn(
                        'block truncate text-xs',
                        isActive ? 'text-white/80' : 'text-muted-foreground'
                      )}
                    >
                      {product.tagline.split(' · ')[0]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 选中产品的详情 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { staggerChildren: 0.08 } },
            exit: { opacity: 0, transition: { duration: 0.15 } },
          }}
        >
          {/* 产品主展示：左右结构 */}
          <section className="bg-muted/30 py-14 sm:py-16">
            <div className="container mx-auto px-4">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                {/* 左侧文案 */}
                <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm',
                        active.accent.soft,
                        active.accent.text
                      )}
                    >
                      {React.createElement(productIcons[active.icon] ?? LayoutGrid, {
                        className: 'h-6 w-6',
                      })}
                    </span>
                    <Badge variant="outline" className={cn('rounded-full', active.accent.chip, 'border-transparent')}>
                      {active.tagline}
                    </Badge>
                  </div>

                  <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                    {active.name}
                  </h2>
                  <p className="mt-4 leading-7 text-muted-foreground">
                    {active.description}
                  </p>

                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {active.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white',
                            active.accent.gradient
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="leading-5">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" className="group gap-2" asChild>
                      <Link href={`/products/${active.id}`}>
                        <LayoutGrid className="h-4 w-4" />
                        查看产品详情
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2" asChild>
                      <Link href="/contact">
                        <PlayCircle className="h-4 w-4" />
                        预约产品演示
                      </Link>
                    </Button>
                  </div>
                </motion.div>

                {/* 右侧视觉：产品界面模拟窗 */}
                <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                  <div className="relative">
                    {/* 光晕 */}
                    <div
                      className={cn(
                        'absolute -inset-4 rounded-[2rem] bg-gradient-to-br opacity-20 blur-2xl',
                        active.accent.gradient
                      )}
                    />
                    <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                      {/* 窗口顶栏 */}
                      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
                        <span className="h-3 w-3 rounded-full bg-red-400" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400" />
                        <span className="h-3 w-3 rounded-full bg-green-400" />
                        <span className="ml-3 hidden rounded-md bg-background px-3 py-1 text-xs text-muted-foreground sm:inline">
                          https://app.sjcode.cn/{active.id}
                        </span>
                      </div>

                      {/* 模拟界面 */}
                      <div className={cn('relative bg-gradient-to-br p-6 sm:p-8', active.accent.gradient)}>
                        <div className="flex items-center justify-between text-white/90">
                          <div className="flex items-center gap-2.5">
                            {React.createElement(productIcons[active.icon] ?? LayoutGrid, {
                              className: 'h-7 w-7',
                            })}
                            <span className="text-lg font-bold text-white">{active.name}</span>
                          </div>
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs text-white backdrop-blur">
                            运行中
                          </span>
                        </div>

                        {/* 模拟统计卡片 */}
                        <div className="mt-6 grid grid-cols-3 gap-3">
                          {active.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-md"
                            >
                              <div className="text-lg font-bold text-white sm:text-xl">
                                {stat.value}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-tight text-white/80">
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 模拟功能行 */}
                        <div className="mt-5 space-y-2.5">
                          {active.features.slice(0, 3).map((feature, i) => (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                              className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-sm"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5">
                                <Layers className="h-4 w-4 text-foreground/70" />
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground">
                                  {feature.title}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {feature.description}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 浮动徽章 */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                      animate={{ opacity: 1, scale: 1, rotate: -8 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-semibold shadow-xl ring-1 ring-border"
                    >
                      <ShieldCheck className={cn('h-4 w-4', active.accent.text)} />
                      等保三级
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 核心能力 */}
          <section className="py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">核心能力</h3>
                <p className="mt-3 text-muted-foreground">
                  {active.name}提供六大核心模块，覆盖业务全流程
                </p>
              </motion.div>

              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {active.features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    transition={{ duration: 0.35 }}
                    className="group relative overflow-hidden rounded-2xl border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* hover 光晕 */}
                    <div
                      className={cn(
                        'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20',
                        active.accent.gradient
                      )}
                    />
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold',
                        active.accent.soft,
                        active.accent.text
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="mt-5 text-base font-semibold">{feature.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 应用场景 */}
          <section className="bg-muted/30 py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">应用场景</h3>
                <p className="mt-3 text-muted-foreground">
                  不同角色都能在{active.name}中找到高效的工作方式
                </p>
              </motion.div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {active.scenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.title}
                    variants={fadeUp}
                    transition={{ duration: 0.35 }}
                    className="relative rounded-2xl border bg-card/70 p-7 shadow-sm backdrop-blur-sm"
                  >
                    <span
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md',
                        active.accent.gradient
                      )}
                    >
                      <Users className="h-6 w-6" />
                    </span>
                    <h4 className="mt-5 text-lg font-semibold">{scenario.title}</h4>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                      {scenario.description}
                    </p>
                    <span className="absolute right-6 top-7 text-5xl font-bold text-muted/60">
                      {index + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

      {/* 底部 CTA */}
      <CTASection
        heading="想了解哪款产品更适合您？"
        description="告诉我们您的使用场景与规模，产品顾问将在 1 个工作日内为您提供专属方案与演示环境。"
        badgeText="免费咨询"
        primaryButton={{ text: '联系产品顾问', url: '/contact', icon: <ArrowRight className="h-4 w-4" /> }}
        secondaryButton={{ text: '浏览帮助文档', url: '/help', icon: <BookOpen className="h-4 w-4" /> }}
      />
    </div>
  );
}
