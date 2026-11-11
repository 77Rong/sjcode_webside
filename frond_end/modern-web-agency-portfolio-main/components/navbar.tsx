'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Menu, X, LogOut, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/logo';

const navigation = [
  { name: '首页', href: '/' },
  { name: '产品', href: '/products' },
  { name: '服务', href: '/services' },
  { name: '帮助', href: '/help' },
  { name: '联系', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuth, logout } = useAuth();

  // 帮助中心需要登录：未登录弹出登录框，登录后跳转
  const handleHelpClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (user) {
      router.push('/help');
    } else {
      openAuth({ view: 'login', forced: false, redirect: '/help' });
    }
  };

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" 
          : "bg-background/50 backdrop-blur-none"
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="group" aria-label="世纪源创 首页">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:gap-x-1">
          {navigation.map((item) => {
            const itemClassName = cn(
              'relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent/50',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            );
            const inner = (
              <>
                {pathname === item.href && (
                  <motion.span
                    className="absolute inset-0 rounded-md bg-primary/10 z-[-1]"
                    layoutId="navbar-active"
                    transition={{ type: 'spring', duration: 0.6 }}
                  />
                )}
                {item.name}
              </>
            );
            // 帮助中心需要登录
            if (item.href === '/help') {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={handleHelpClick}
                  className={itemClassName}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link key={item.name} href={item.href} className={itemClassName}>
                {inner}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                <UserRound className="h-3.5 w-3.5 text-primary" />
                {user.username}
              </span>
              <button
                type="button"
                onClick={logout}
                title="退出登录"
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                退出
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth({ view: 'login', forced: false })}
              className="hidden h-10 items-center rounded-xl border border-neutral-300 bg-white px-7 text-[15px] font-medium text-neutral-900 shadow-sm transition-all hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:border-neutral-500 dark:hover:bg-neutral-700 md:inline-flex"
            >
              登录
            </button>
          )}
          <button
            type="button"
            className="md:hidden rounded-md p-1.5 hover:bg-accent/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">切换菜单</span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-1 px-4 pb-5 pt-3">
            {navigation.map((item, index) => {
              const itemClassName = cn(
                'flex w-full items-center py-2.5 text-base font-medium transition-colors rounded-md px-3 text-left',
                pathname === item.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              );
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {item.href === '/help' ? (
                    <button type="button" onClick={handleHelpClick} className={itemClassName}>
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={itemClassName}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: navigation.length * 0.05 }}
            >
              {user ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                    <UserRound className="h-4 w-4 text-primary" />
                    当前登录：{user.username}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    退出登录
                  </Button>
                </div>
              ) : (
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth({ view: 'login', forced: false });
                  }}
                >
                  登录
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </header>
  );
}