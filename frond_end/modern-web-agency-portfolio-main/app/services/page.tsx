import { Button } from '@/components/ui/button';
import { Code2, Palette, Rocket, BarChart, ShoppingCart, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ServiceCard, ServicesGrid } from '@/components/ui/service-card';
import { StatsSection } from '@/components/ui/stats-section';
import { CTASection } from '@/components/ui/cta-section';

const services = [
  {
    icon: Code2,
    title: '网站开发',
    description: '基于前沿技术打造的定制化 Web 应用。我们提供可扩展、安全、高性能的解决方案，贴合您的业务需求。',
    features: ['定制化 Web 应用', '电商解决方案', 'API 开发', '渐进式 Web 应用'],
  },
  {
    icon: Palette,
    title: 'UI/UX 设计',
    description: '以用户为中心的设计方案，兼顾美学与功能。我们打造直观的界面，让用户愉悦并沉浸其中。',
    features: ['用户界面设计', '用户体验设计', '线框图与原型', '设计系统'],
  },
  {
    icon: Rocket,
    title: '数字营销',
    description: '战略性的数字营销解决方案，提升您的线上影响力。助您精准触达目标受众，实现业务目标。',
    features: ['SEO 优化', '内容策略', '社交媒体营销', '数据分析与报表'],
  },
  {
    icon: BarChart,
    title: '数据分析与优化',
    description: '以数据驱动洞察，提升您的数字化表现。帮助您理解用户行为并持续优化效果。',
    features: ['性能监控', '用户行为分析', '转化优化', 'A/B 测试'],
  },
  {
    icon: ShoppingCart,
    title: '电商解决方案',
    description: '端到端的电商解决方案，助力您的线上业务增长。打造安全可扩展的平台，驱动销售转化。',
    features: ['定制电商平台', '支付系统集成', '库存管理', '移动电商'],
  },
  {
    icon: Globe,
    title: '云服务',
    description: '云基础设施与部署方案。确保您的应用具备可扩展性、安全性，并保持高可用性。',
    features: ['云架构', 'DevOps 服务', '安全实施', '性能优化'],
  },
];

// Stats data
const stats = [
  { value: "100+", label: "完成项目" },
  { value: "50+", label: "满意客户" },
  { value: "5+", label: "年行业经验" },
  { value: "10+", label: "团队成员" }
];

export default function Services() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center overflow-hidden py-20 sm:py-24">
        <Image
          src="/images/jiaoshi.jpg"
          alt="服务 Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              我们的服务
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto drop-shadow">
              我们提供全方位的数字化服务，助力您的业务在线上取得成功。
              从网站开发到数字营销，我们为您一站式覆盖。
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4">
          <ServicesGrid
            title="我们提供的服务"
            description="探索我们的服务矩阵，助力提升数字化形象并驱动业务增长。"
          >
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={<service.icon className="h-6 w-6" />}
              />
            ))}
          </ServicesGrid>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">我们的方法</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              我们遵循一套成熟的方法论，为客户交付卓越成果。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service, index) => (
              <div key={index} className="bg-background rounded-lg border p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* CTA Section */}
      <CTASection
        heading="准备好为您的业务转型升级了吗？"
        description="让我们探讨如何通过全面的服务方案，助您达成数字化目标。"
        badgeText="专业解决方案"
        primaryButton={{
          text: "联系我们",
          url: "/contact",
          icon: <ArrowRight className="h-4 w-4" />,
        }}
        secondaryButton={{
          text: "查看我们的作品",
          url: "/portfolio",
        }}
      />
    </div>
  );
}