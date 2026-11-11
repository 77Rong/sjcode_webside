"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProjectCard } from '@/components/ui/project-card';
import { StatsSection } from '@/components/ui/stats-section';
import { CTASection } from '@/components/ui/cta-section';
import { motion } from 'framer-motion';
import { useState } from 'react';

const projects = [
  {
    title: '电商平台',
    category: '网站开发',
    description: '基于 Next.js 与 Stripe 集成打造的全功能电商平台。',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=800',
    tags: ['Next.js', 'Stripe', 'TypeScript', 'Tailwind CSS'],
    demoUrl: '#',
  },
  {
    title: '医疗健康仪表盘',
    category: 'UI/UX 设计',
    description: '为医疗专业人员打造的直观仪表盘，便于管理患者数据。',
    image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=800',
    tags: ['React', 'D3.js', 'Material-UI', 'Firebase'],
    demoUrl: '#',
  },
  {
    title: '房产平台',
    category: '网站开发',
    description: '具备 VR 看房与预约系统的现代化房产平台。',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800',
    tags: ['Vue.js', 'Node.js', 'MongoDB', 'WebGL'],
    demoUrl: '#',
  },
  {
    title: '健身 App',
    category: '移动开发',
    description: '一款跨平台健身应用，具备训练记录与社交功能。',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800',
    tags: ['React Native', 'Redux', 'Node.js', 'MongoDB'],
    demoUrl: '#',
  },
  {
    title: '餐厅点餐系统',
    category: '网站开发',
    description: '面向餐厅的在线点餐系统，支持实时订单追踪。',
    image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&w=800',
    tags: ['Next.js', 'Socket.io', 'PostgreSQL', 'Redis'],
    demoUrl: '#',
  },
  {
    title: '教育平台',
    category: '网站开发',
    description: '一个互动式学习平台，支持视频课程与直播教学。',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800',
    tags: ['React', 'WebRTC', 'Node.js', 'MongoDB'],
    demoUrl: '#',
  },
];

// Stats data
const stats = [
  { value: "60+", label: "交付项目" },
  { value: "15+", label: "服务行业" },
  { value: "98%", label: "客户满意度" },
  { value: "40+", label: "获奖数量" }
];

// Project categories
const categories = [
  "全部",
  "网站开发",
  "UI/UX 设计",
  "移动开发",
  "电商"
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("全部");

  // Filter projects based on active category
  const filteredProjects = activeCategory === "全部"
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
              我们的作品
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              探索我们成功案例的合集，了解我们如何帮助企业
              实现数字化目标。
            </p>
          </div>
        </div>
      </section>

      {/* Project Categories */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={category === activeCategory ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">精选项目</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              浏览我们在不同行业与技术领域中最具代表性的作品。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  image={project.image}
                  tags={project.tags}
                  demoUrl={project.demoUrl}
                />
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">该分类下暂无项目。</p>
            </div>
          )}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">我们的流程</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              我们遵循一套成熟的方法论，为每一个项目交付卓越成果。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {['需求洞察', '设计', '开发', '交付'].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-background rounded-lg border p-6 shadow-sm relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step}</h3>
                  <p className="text-sm text-muted-foreground">
                    {index === 0 && "我们深入了解您的业务目标、目标用户与项目需求。"}
                    {index === 1 && "我们制作线框图与设计稿，贴合您的品牌与用户需求。"}
                    {index === 2 && "我们采用最新技术与最佳实践，构建您的解决方案。"}
                    {index === 3 && "我们上线您的项目，并提供持续的支持与维护。"}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-border z-0 -translate-y-1/2 -ml-4 -mr-4" style={{ width: 'calc(100% - 3rem)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* CTA Section */}
      <CTASection
        heading="有项目想要合作？"
        description="凭借我们的专业能力与丰富经验，让我们探讨如何助您实现数字化目标。"
        badgeText="开启合作"
        icon={<Sparkles className="h-12 w-12 text-primary" />}
        primaryButton={{
          text: "发起项目",
          url: "/contact",
          icon: <ArrowRight className="h-4 w-4" />,
        }}
        secondaryButton={{
          text: "查看服务",
          url: "/services",
        }}
      />
    </div>
  );
}