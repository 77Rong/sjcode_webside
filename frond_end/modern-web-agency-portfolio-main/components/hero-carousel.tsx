"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_HERO_SLIDES, type HeroSlide } from "@/lib/hero-api";

/**
 * 首页焦点图轮播
 *
 * 数据来源：
 * - 后台「首页焦点管理」维护，存储在 Supabase（hero_slides 表 + Storage）；
 * - 服务端渲染时预取启用中的焦点图（/api/hero/active），通过 props 传入；
 * - 未传入或为空时回退到默认内容，保证页面始终可用。
 *
 * 设计要点（避免闪烁）：
 * - 全部 slide 的 <Image> 同时挂载在 DOM 中，仅切换 opacity，
 *   这样浏览器始终持有已解码的图像，切换瞬间只走 GPU 合成，
 *   不会出现 "Image 重挂 → 空白 → 重新 decode → 出现" 的闪烁。
 * - 文本块同样常驻，按 index 同步淡入淡出。
 */

const ROTATE_INTERVAL_MS = 5000;
const FADE_DURATION = 0.8;

export function HeroCarousel({
  initialSlides,
}: {
  initialSlides?: HeroSlide[];
}) {
  const slides = React.useMemo(
    () => (initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_HERO_SLIDES),
    [initialSlides]
  );

  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const goTo = React.useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);
  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);

  // 5 秒自动切换；用户悬停时暂停，离开时继续
  React.useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 背景图层：所有图常驻，按 index 切 opacity（不卸载，零 decode 延迟） */}
      {/*
       * 关键点：三张图必须同时 priority。
       *   - priority={i === 0} 只让首张走 <link rel="preload">，
       *     另两张默认 lazy，opacity 升到 1 的瞬间浏览器才会同步解码，
       *     那一帧必然闪烁。
       *   - 全部 priority 后，三张图都在页面加载时被预加载并预解码，
       *     切换时只走 GPU 合成，根本不再触发解码。
       */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <motion.div
            key={s.id}
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ willChange: "opacity" }}
          >
            <Image
              src={s.image}
              alt={s.imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        ))}
      </div>

      {/* 遮罩层：保证白色文案在图片上的可读性 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/50 to-slate-950/80 dark:from-slate-950/85 dark:via-slate-950/65 dark:to-black/90" />
      <div className="pointer-events-none absolute inset-0 bg-black/10 dark:bg-black/30" />

      {/* 内容层：badge/title/description 全部常驻，按 index 切 opacity */}
      <div className="container relative z-10 mx-auto flex flex-col items-center px-4 py-20 text-center">
        <div className="relative w-full max-w-5xl">
          {slides.map((s, i) => (
            <motion.div
              key={s.id}
              initial={false}
              animate={{
                opacity: i === index ? 1 : 0,
                y: i === index ? 0 : -8,
              }}
              transition={{ duration: FADE_DURATION, ease: "easeOut" }}
              className="flex flex-col items-center"
              style={{
                position: i === index ? "relative" : "absolute",
                inset: i === index ? undefined : 0,
                pointerEvents: i === index ? "auto" : "none",
                willChange: "opacity, transform",
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                {s.badge}
              </span>

              <h1 className="mt-6 whitespace-nowrap bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-center text-[1.75rem] font-bold leading-tight text-transparent drop-shadow-lg sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl lg:leading-tight">
                {s.title}
              </h1>

              <p className="mt-6 max-w-3xl text-center text-base font-medium leading-relaxed text-white drop-shadow sm:text-lg">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="h-12 px-8 text-base shadow-lg transition-transform hover:scale-105"
          >
            {/* 主按钮跳转到后台为当前焦点图配置的超链接，未配置时回退 /contact */}
            <Link href={slides[index]?.linkUrl || "/contact"}>
              立即开始
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 gap-2 border-white/40 bg-white/10 px-8 text-base text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
          >
            <Link href="/portfolio">
              查看我们的作品
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 左右圆形切换按钮 */}
      <button
        type="button"
        aria-label="上一张"
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:bg-black/45 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60 sm:left-8 sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="下一张"
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:bg-black/45 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60 sm:right-8 sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* 指示小圆点 */}
      <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`切换到第 ${i + 1} 张`}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index
                ? "w-6 bg-white shadow"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* 向下滚动提示 */}
      <a
        href="#services"
        aria-label="向下滚动查看更多"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/70 transition-colors hover:text-white"
      >
        <span className="text-xs tracking-widest">向下滚动</span>
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  );
}
