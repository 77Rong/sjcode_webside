'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
  Search,
  Folder,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  CalendarDays,
  SearchX,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { products, type HelpProduct, type HelpModule, type HelpArticle } from '@/lib/help-center-data';

// 产品图标映射
const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FolderOpen,
  FlaskConical,
  Briefcase,
};

// 搜索关键词高亮
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-yellow-300/50 px-0.5 text-inherit dark:bg-yellow-500/30">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

// 统计文章中关键词出现次数
function countMatches(article: HelpArticle, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const haystacks = [article.title, article.intro, ...article.steps, article.tips ?? ''];
  return haystacks.reduce(
    (acc, text) => acc + (text.toLowerCase().split(q).length - 1),
    0
  );
}

export function HelpCenter() {
  const [activeProduct, setActiveProduct] = React.useState<HelpProduct>(products[0]);
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    () => new Set([products[0].modules[0].id])
  );
  const [activeArticle, setActiveArticle] = React.useState<HelpArticle>(
    products[0].modules[0].articles[0]
  );
  const [activeModuleId, setActiveModuleId] = React.useState<string>(
    products[0].modules[0].id
  );
  const [funcQuery, setFuncQuery] = React.useState('');
  const [contentQuery, setContentQuery] = React.useState('');

  // 切换产品：重置展开、选中项与搜索
  const handleSelectProduct = (product: HelpProduct) => {
    if (product.id === activeProduct.id) return;
    setActiveProduct(product);
    setExpandedModules(new Set([product.modules[0].id]));
    setActiveModuleId(product.modules[0].id);
    setActiveArticle(product.modules[0].articles[0]);
    setFuncQuery('');
    setContentQuery('');
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleSelectArticle = (module: HelpModule, article: HelpArticle) => {
    setActiveModuleId(module.id);
    setActiveArticle(article);
    setExpandedModules((prev) => new Set(prev).add(module.id));
  };

  // 左侧功能搜索过滤
  const searching = funcQuery.trim().length > 0;
  const filteredModules = React.useMemo(() => {
    if (!searching) return activeProduct.modules;
    const q = funcQuery.trim().toLowerCase();
    return activeProduct.modules
      .map((module) => ({
        ...module,
        articles: module.articles.filter((a) => a.title.toLowerCase().includes(q)),
      }))
      .filter(
        (module) =>
          module.title.toLowerCase().includes(q) || module.articles.length > 0
      );
  }, [activeProduct, funcQuery, searching]);

  const activeModule = activeProduct.modules.find((m) => m.id === activeModuleId);
  const matchCount = countMatches(activeArticle, contentQuery);

  return (
    <div className="flex flex-col">
      {/* 页面标题 Banner */}
      <section className="relative flex items-center justify-center overflow-hidden py-20 sm:py-24">
        <Image
          src="/images/jiaoshi.jpg"
          alt="帮助中心 Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              帮助中心
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto drop-shadow">
              按产品查找使用说明、常见问题与最佳实践
            </p>
          </motion.div>
        </div>
      </section>

      {/* 产品选择 */}
      <section className="bg-muted/40 py-6">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border bg-card/60 p-2 backdrop-blur-sm shadow-sm">
            <div className="flex gap-2 overflow-x-auto">
              {products.map((product) => {
                const Icon = productIcons[product.icon] ?? BookOpen;
                const isActive = product.id === activeProduct.id;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className={cn(
                      'flex flex-1 min-w-[150px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-foreground text-background shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {product.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 左右结构：功能目录 + 帮助详情 */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* 左侧：功能目录 */}
            <motion.aside
              key={`sidebar-${activeProduct.id}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur-sm lg:sticky lg:top-24"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={funcQuery}
                  onChange={(e) => setFuncQuery(e.target.value)}
                  placeholder="搜索功能"
                  className="pl-9"
                />
              </div>

              <nav className="mt-4 space-y-1">
                {filteredModules.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                    <SearchX className="h-6 w-6" />
                    未找到匹配的功能
                  </div>
                )}

                {filteredModules.map((module) => {
                  const isExpanded = searching || expandedModules.has(module.id);
                  const isActiveModule = module.id === activeModuleId;
                  return (
                    <div key={module.id}>
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActiveModule
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-accent/60'
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                            !isExpanded && '-rotate-90'
                          )}
                        />
                        {isExpanded ? (
                          <FolderOpen className="h-4 w-4 shrink-0" />
                        ) : (
                          <Folder className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate text-left">
                          <Highlight text={module.title} query={funcQuery} />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-5 space-y-0.5 border-l pl-3 py-1">
                              {module.articles.map((article) => {
                                const isActiveArticle = article.id === activeArticle.id;
                                return (
                                  <button
                                    key={article.id}
                                    type="button"
                                    onClick={() => handleSelectArticle(module, article)}
                                    className={cn(
                                      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                      isActiveArticle
                                        ? 'bg-primary font-medium text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                    )}
                                  >
                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate text-left">
                                      <Highlight text={article.title} query={funcQuery} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </motion.aside>

            {/* 右侧：产品帮助详情 */}
            <motion.div
              key={`content-${activeProduct.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8"
            >
              {/* 面包屑 + 文案搜索 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-1">{activeProduct.name}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="rounded bg-muted px-2 py-1">{activeModule?.title}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="rounded bg-muted px-2 py-1 text-foreground">
                    {activeArticle.title}
                  </span>
                </nav>

                <div className="relative sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={contentQuery}
                    onChange={(e) => setContentQuery(e.target.value)}
                    placeholder="搜文案内容"
                    className="pl-9"
                  />
                </div>
              </div>

              {contentQuery.trim() && (
                <div className="mt-3 text-xs text-muted-foreground">
                  本文共匹配到 <span className="font-semibold text-primary">{matchCount}</span> 处关键词
                </div>
              )}

              {/* 文章详情 */}
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeArticle.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6"
                >
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    <Highlight text={activeArticle.title} query={contentQuery} />
                  </h2>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    最后更新于 {activeArticle.updatedAt}
                  </div>

                  <div className="mt-8 rounded-xl bg-muted/50 p-6 leading-7 text-foreground/90 sm:p-8">
                    <p>
                      <Highlight text={activeArticle.intro} query={contentQuery} />
                    </p>

                    <h3 className="mt-8 flex items-center gap-2 text-base font-semibold">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs text-primary">
                        {activeArticle.steps.length}
                      </span>
                      操作步骤
                    </h3>
                    <ol className="mt-4 space-y-4">
                      {activeArticle.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {index + 1}
                          </span>
                          <span className="pt-0.5 text-sm leading-6">
                            <Highlight text={step} query={contentQuery} />
                          </span>
                        </li>
                      ))}
                    </ol>

                    {activeArticle.tips && (
                      <div className="mt-8 flex gap-3 rounded-xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                          <div className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            温馨提示
                          </div>
                          <p className="mt-1 text-sm leading-6 text-amber-800/90 dark:text-amber-200/80">
                            <Highlight text={activeArticle.tips} query={contentQuery} />
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.article>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
