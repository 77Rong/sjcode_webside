'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { useBrand } from '@/lib/brand-context';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { brand } = useBrand();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-16">
        {/* Newsletter Section */}
        <motion.div 
          className="mb-16 rounded-xl bg-muted/30 p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">保持最新资讯</h3>
              <p className="text-muted-foreground">
                订阅我们的新闻通讯，获取教育信息化政策、产品更新与最佳实践的最新动态。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="请输入您的邮箱"
                className="flex-1"
              />
              <Button className="group">
                订阅
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Main Footer Content */}
        <motion.div 
          className="grid grid-cols-1 gap-10 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Logo />
            <p className="mt-4 text-muted-foreground">
              专注高等教育过程管理，让校园管理更智能、教学过程更高效。
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@shijiyuanchuang.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+86 138-0000-0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>中国·上海市浦东新区数字大道 123 号</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold">产品</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>教务系统</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>文件管理系统</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>实验室预约系统</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>实习管理系统</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold">公司</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>关于我们</span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>作品集</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>联系我们</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold">关注我们</h3>
            <div className="mt-4 flex gap-3">
              <Link href="#" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Copyright */}
        <div className="mt-16 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {brand.copyright || `© ${currentYear} ${brand.name} 版权所有。`}
          </p>
          {brand.icp && (
            <p className="mt-2 text-xs text-muted-foreground/80">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                {brand.icp}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}