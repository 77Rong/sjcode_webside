"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Users, Clock, Globe, ArrowRight, Sparkles, Building, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatsSection } from '@/components/ui/stats-section';
import { CTASection } from '@/components/ui/cta-section';

const team = [
  {
    name: '王建国',
    role: '创始人 / 首席执行官',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400',
    bio: '拥有 15 年以上教育信息化与高校服务经验。',
  },
  {
    name: '陈志远',
    role: '技术总监',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400',
    bio: '热衷于打造高可用、可扩展的校园业务系统。',
  },
  {
    name: '林晓敏',
    role: '产品总监',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400',
    bio: '长期深入院校一线，擅长教学场景的产品设计。',
  },
  {
    name: '赵明辉',
    role: '客户成功总监',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400',
    bio: '专注院校交付与上线运营，保障系统平稳落地。',
  },
];

const values = [
  {
    icon: Award,
    title: '卓越',
    description: '我们在所做的一切中追求卓越，从代码质量到客户服务，无一例外。',
  },
  {
    icon: Users,
    title: '协作',
    description: '我们坚信与客户紧密合作，才能实现最佳成果。',
  },
  {
    icon: Clock,
    title: '高效',
    description: '我们持续优化流程，按时交付高质量解决方案。',
  },
  {
    icon: Globe,
    title: '创新',
    description: '我们始终走在技术前沿，提供前瞻性的解决方案。',
  },
];

// Stats data
const stats = [
  { value: "2015", label: "成立年份" },
  { value: "50+", label: "团队成员" },
  { value: "100+", label: "合作院校" },
  { value: "50万+", label: "服务师生" }
];

// Company timeline
const timeline = [
  {
    year: "2015",
    title: "公司成立",
    description: "世纪源创成立，专注高等教育信息化研发与服务。"
  },
  {
    year: "2017",
    title: "教务系统上线",
    description: "推出首款教务管理系统，服务首批高校客户。"
  },
  {
    year: "2019",
    title: "产品矩阵成形",
    description: "文件管理系统、实验室预约系统陆续发布，覆盖校园核心场景。"
  },
  {
    year: "2022",
    title: "贯通实践教学",
    description: "实习管理系统上线，实现教学、管理、实践全过程数字化闭环。"
  }
];

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-sm">
              关于世纪源创
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              我们是一支深耕高等教育领域的产品与研发团队，
              致力于用数字化手段让校园管理更智能、教学过程更高效。
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src="/images/jiaoshi.jpg"
                  alt="世纪源创服务高校教学场景"
                  width={1922}
                  height={1080}
                  className="object-cover w-full h-[400px]"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-6">我们的故事</h2>
              <p className="text-muted-foreground mb-6">
                世纪源创成立于 2015 年，从一套面向高校的教务管理系统起步，逐步成长为覆盖教学服务、学生管理、校务办公等核心场景的高等教育过程管理服务商，产品矩阵包含教务系统、文件管理系统、实验室预约系统与实习管理系统。
              </p>
              <p className="text-muted-foreground mb-6">
                我们长期扎根院校一线，深入理解教务、学工与实践教学的真实流程，把技术专长与教育场景经验结合，与合作院校建立长期伙伴关系，量身定制贴合校情的数字化解决方案。
              </p>
              <div className="flex gap-4 mt-8">
                <Button asChild>
                  <Link href="/products">查看产品</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">联系我们</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">我们的价值观</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              这些核心准则指引着我们的一言一行，也塑造了我们与客户的合作方式。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 text-center h-full border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{value.title}</h3>
                    <p className="mt-2 text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">发展历程</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              回顾我们多年来的成长与蜕变。
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-1/2"></div>
                    <div className="flex items-center justify-center z-10">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>

                  <div className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 p-4 ${index % 2 === 0 ? 'text-right pr-12' : 'pl-12'}`}>
                      <div className="bg-background rounded-lg border p-6 shadow-sm">
                        <div className="text-primary font-bold text-xl mb-2">{item.year}</div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">我们的团队</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              认识一下让公司变得卓越的杰出成员。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden bg-background hover:shadow-md transition-all">
                  <div className="aspect-square relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <div className="mt-1 text-sm text-primary font-medium">{member.role}</div>
                    <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        heading="携手共建智慧校园"
        description="无论您是希望升级现有教务流程，还是新校区需要一体化的过程管理方案，我们都期待与您深入交流，量身定制合作路径。"
        badgeText="合作洽谈"
        icon={<Building className="h-12 w-12 text-primary" />}
        primaryButton={{
          text: "预约产品演示",
          url: "/contact",
          icon: <ArrowRight className="h-4 w-4" />,
        }}
        secondaryButton={{
          text: "查看产品",
          url: "/products",
        }}
      />
    </div>
  );
}