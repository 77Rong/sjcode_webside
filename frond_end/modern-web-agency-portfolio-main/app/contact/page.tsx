'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, '姓名至少需要 2 个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().min(10, '电话号码至少需要 10 位数字'),
  message: z.string().min(10, '留言内容至少需要 10 个字符'),
});

// FAQ items
const faqItems = [
  {
    question: "你们提供哪些服务？",
    answer: "我们提供全方位的数字化服务，包括网站开发、UI/UX 设计、移动应用开发与电商解决方案。详情请查看我们的服务页面。"
  },
  {
    question: "一个项目通常需要多长时间？",
    answer: "项目周期取决于复杂度与范围。一个简单的网站可能需要 2-4 周，而复杂的 Web 应用可能需要 2-3 个月。我们会在初次沟通时提供详细的时间表。"
  },
  {
    question: "你们是否提供持续维护服务？",
    answer: "是的，我们提供多种维护套餐，保障您的网站安全、最新并保持最佳性能。我们可根据您的具体需求定制维护方案。"
  },
  {
    question: "我们如何开始合作？",
    answer: "请填写本页的联系表单，我们的团队将与您联系并安排初次咨询。我们会沟通需求、时间表与预算，并据此提供定制化方案。"
  }
];

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center overflow-hidden py-20 sm:py-24">
        <Image
          src="/images/jiaoshi.jpg"
          alt="联系我们 Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              联系我们
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto drop-shadow">
              有项目想要合作？欢迎与我们联系，探讨我们如何
              助您将愿景化为现实。
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight">与我们联系</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  我们很乐意倾听您的需求。我们友好的团队随时为您提供帮助。
                </p>
              </div>

              <div className="space-y-6">
                <Card className="p-6 border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">邮箱</h3>
                      <p className="mt-1 text-muted-foreground">contact@shijiyuanchuang.com</p>
                      <a href="mailto:contact@shijiyuanchuang.com" className="text-primary text-sm mt-2 inline-block hover:underline">
                        发送邮件 →
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">电话</h3>
                      <p className="mt-1 text-muted-foreground">+86 138-0000-0000</p>
                      <a href="tel:+8613800000000" className="text-primary text-sm mt-2 inline-block hover:underline">
                        致电我们 →
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">办公地址</h3>
                      <p className="mt-1 text-muted-foreground">
                        中国·上海市浦东新区数字大道 123 号
                      </p>
                      <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-2 inline-block hover:underline">
                        查看路线 →
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mr-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">营业时间</h3>
                      <p className="mt-1 text-muted-foreground">
                        周一至周五：09:00 - 18:00
                      </p>
                      <p className="text-muted-foreground">
                        周六至周日：休息
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 border shadow-sm bg-background">
                {!isSubmitted ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold tracking-tight">给我们留言</h3>
                      <p className="text-muted-foreground mt-2">请填写下方表单，我们会尽快与您联系。</p>
                    </div>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>姓名</FormLabel>
                                <FormControl>
                                  <Input placeholder="您的姓名" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>邮箱</FormLabel>
                                <FormControl>
                                  <Input placeholder="your@email.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>电话</FormLabel>
                              <FormControl>
                                <Input placeholder="您的电话号码" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>留言内容</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="请告诉我们您的项目需求"
                                  className="min-h-[150px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">
                          <Send className="mr-2 h-4 w-4" /> 发送留言
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">留言已发送！</h3>
                    <p className="text-muted-foreground max-w-md">
                      感谢您的联系。我们已收到您的留言，将在 24 小时内与您联系。
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => {
                        setIsSubmitted(false);
                        form.reset();
                      }}
                    >
                      再发送一条留言
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">常见问题</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              在此为您解答关于我们服务与流程的常见疑问。
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                      <p className="text-muted-foreground text-sm">{item.answer}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">找到我们</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              欢迎来访我们的办公室，或通过线上方式与我们联系。
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden border shadow-sm h-[400px] relative">
            {/* This would be replaced with an actual map component in production */}
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">地图占位 - 此处将集成高德地图或类似地图服务</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}