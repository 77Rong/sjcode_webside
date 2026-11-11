import { Button } from '@/components/ui/button';
import { Code2, Palette, Rocket, Trophy, ArrowRight, Globe, Database, LineChart } from 'lucide-react';
import Link from 'next/link';
import { HeroCarousel } from '@/components/hero-carousel';
import { ServiceCard, ServicesGrid } from '@/components/ui/service-card';
import { ProjectCard } from '@/components/ui/project-card';
import { StatsSection } from '@/components/ui/stats-section';
import { CTASection } from '@/components/ui/cta-section';
import { fetchHeroSlidesServer } from '@/lib/hero-api';

export default async function Home() {
  // Services data
  const services = [
    {
      title: "网站开发",
      description: "采用现代技术与最佳实践，打造性能卓越的定制化 Web 应用。",
      icon: <Code2 className="h-6 w-6" />
    },
    {
      title: "UI/UX 设计",
      description: "精美、直观的界面设计，带来卓越的用户体验并有效吸引您的受众。",
      icon: <Palette className="h-6 w-6" />
    },
    {
      title: "数字营销",
      description: "战略性的营销解决方案，助您拓展线上影响力并精准触达目标用户。",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      title: "云服务",
      description: "可扩展的云基础设施与部署方案，保障应用安全可靠运行。",
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: "数据库解决方案",
      description: "高效的数据库设计与管理，确保您的数据井然有序、随时可用。",
      icon: <Database className="h-6 w-6" />
    },
    {
      title: "数据分析与报表",
      description: "全面的分析与报表工具，追踪性能表现并支持数据驱动决策。",
      icon: <LineChart className="h-6 w-6" />
    }
  ];

  // Stats data
  const stats = [
    { value: "100+", label: "完成项目" },
    { value: "50+", label: "满意客户" },
    { value: "5+", label: "年行业经验" },
    { value: "10+", label: "团队成员" }
  ];

  return (
    <div className="flex flex-col">
      {/* 首屏：全屏背景焦点图轮播（5 秒自动切换 + 左右圆形按钮）
          数据来自后台「首页焦点管理」（Supabase），服务端预取保证首屏即渲染真实数据 */}
      <HeroCarousel initialSlides={await fetchHeroSlidesServer()} />

      {/* 第二屏：服务内容 */}
      <section id="services" className="scroll-mt-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <ServicesGrid
            title="我们的服务"
            description="我们提供全方位的数字化解决方案，助力您的业务在线上取得成功。"
          >
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </ServicesGrid>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">精选项目</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              探索我们最具代表性的项目，了解我们如何帮助企业达成数字化目标。
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCard
              title="电商平台"
              description="具备流畅结账体验的现代电商平台。"
              image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800"
              tags={["React", "Node.js", "Stripe"]}
              demoUrl="/portfolio"
            />
            <ProjectCard
              title="移动应用"
              description="面向健身品牌的跨平台移动应用。"
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800"
              tags={["React Native", "Firebase", "UI/UX"]}
              demoUrl="/portfolio"
            />
            <ProjectCard
              title="企业官网"
              description="为金融服务公司打造的专业网站。"
              image="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800"
              tags={["Next.js", "Tailwind CSS", "CMS"]}
              demoUrl="/portfolio"
            />
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/portfolio">查看全部项目</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* CTA Section */}
      <CTASection
        icon={<Trophy className="h-12 w-12 text-primary" />}
        heading="准备好开启您的项目了吗？"
        description="让我们携手合作，将您的愿景化为现实。我们的专家团队随时准备助您实现数字化目标。"
        primaryButton={{
          text: "联系我们",
          url: "/contact",
          icon: <ArrowRight className="h-4 w-4" />,
        }}
        secondaryButton={{
          text: "查看我们的服务",
          url: "/services",
        }}
      />
    </div>
  );
}