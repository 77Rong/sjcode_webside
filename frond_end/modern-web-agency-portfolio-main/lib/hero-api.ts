/**
 * 前台站点首页焦点图接口（对接 back-end-mock 的 /api/hero/active）
 *
 * 数据实际存储在 Supabase（hero_slides 表），由后端转发；
 * Mock 服务地址可用环境变量覆盖：NEXT_PUBLIC_MOCK_API_BASE
 *
 * 默认走同源相对路径，由 next.config.js 的 rewrites 转发到 back-end-mock。
 * 页面可能通过内网穿透地址访问，此时浏览器里的 localhost 不是本机，
 * 绝对地址会导致请求失败。
 */

import { apiBase } from './api-base';

export interface HeroSlide {
  /** 记录 ID */
  id: number;
  /** 背景图 URL（本地路径或 Supabase Storage 外链） */
  image: string;
  /** 图片替代文本 */
  imageAlt: string;
  /** 顶部小标签 */
  badge: string;
  /** 主标题 */
  title: string;
  /** 副标题 / 描述 */
  description: string;
  /** 点击跳转链接（空则使用默认 CTA 链接） */
  linkUrl: string;
}

/** 后端不可用 / 无数据时的兜底轮播内容（与初始数据库数据一致） */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/images/xuexiao.webp',
    imageAlt: '校园全景',
    badge: '现代化网站解决方案',
    title: '高等教育过程管理专家',
    description:
      '世纪源创，专注于高等教育过程管理研发与服务，覆盖教学服务、学生管理、校务办公等核心场景',
    linkUrl: '/products',
  },
  {
    id: 2,
    image: '/images/zoulang.jpg',
    imageAlt: '校园走廊',
    badge: '一站式教务管理平台',
    title: '让教务运转更高效',
    description:
      '打通排课、选课、考试、成绩全链路，灵活应对多校区、多教学点协同，让教务人员从繁琐事务中解放出来',
    linkUrl: '/products',
  },
  {
    id: 3,
    image: '/images/caochang.jpg',
    imageAlt: '校园操场',
    badge: '课程档案全周期管理',
    title: '构建智能化课程档案中枢',
    description:
      '从课程大纲到教学评估的每一份档案都能被准确归档、智能检索与多维分析，让教学资产持续增值',
    linkUrl: '/products',
  },
];

/** 规整单条记录（容错：字段缺失时给出安全默认值） */
function normalizeSlide(raw: Record<string, unknown>, index: number): HeroSlide | null {
  const image = typeof raw.imageUrl === 'string' ? raw.imageUrl : '';
  const title = typeof raw.title === 'string' ? raw.title : '';
  if (!image && !title) return null;

  return {
    id: typeof raw.id === 'number' ? raw.id : index + 1,
    image,
    imageAlt: typeof raw.imageAlt === 'string' && raw.imageAlt ? raw.imageAlt : title,
    badge: typeof raw.badge === 'string' ? raw.badge : '',
    title,
    description: typeof raw.subtitle === 'string' ? raw.subtitle : '',
    linkUrl: typeof raw.linkUrl === 'string' ? raw.linkUrl : '',
  };
}

/** 获取启用中的首页焦点图（后台管理的实时数据，按 sort_order 排序） */
export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const res = await fetch(`${apiBase()}/api/hero/active`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('焦点图请求失败');

  const json = await res.json();
  const list = Array.isArray(json?.data) ? json.data : [];
  const slides = list
    .map((item: Record<string, unknown>, index: number) => normalizeSlide(item, index))
    .filter((s: HeroSlide | null): s is HeroSlide => Boolean(s) && Boolean(s!.image));

  if (!slides.length) throw new Error('暂无启用的焦点图');
  return slides;
}

/**
 * 服务端预取焦点图（供 SSR 使用）
 * 读取失败时回退默认轮播，不阻塞页面渲染
 */
export async function fetchHeroSlidesServer(): Promise<HeroSlide[]> {
  try {
    return await fetchHeroSlides();
  } catch (err) {
    console.error('[hero] 服务端读取焦点图失败，使用默认轮播', err);
    return DEFAULT_HERO_SLIDES;
  }
}
