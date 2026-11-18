/**
 * 后端 API 基址解析
 *
 * 浏览器端与服务端渲染（SSR）需要不同的基址：
 * - 浏览器端：使用同源相对路径（如 /api/contact），由 next.config.js 的 rewrites
 *   转发到 back-end-mock。页面可能通过内网穿透地址访问，此时浏览器里的
 *   localhost 指向的不是本机，绝对地址会导致请求失败。
 * - 服务端（Node fetch）：只接受绝对 URL，必须直连 back-end-mock。
 *
 * 也可用环境变量覆盖：NEXT_PUBLIC_MOCK_API_BASE（两边通用，需为绝对地址）
 */

/** 服务端直连地址 */
const SERVER_API_BASE =
  process.env.BACKEND_API_ORIGIN || process.env.NEXT_PUBLIC_MOCK_API_BASE || 'http://localhost:3100';

/** 浏览器端基址：默认空串，表示同源相对路径 */
const CLIENT_API_BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '';

/** 是否运行在浏览器端 */
export const isBrowser = typeof window !== 'undefined';

/** 按运行环境返回合适的 API 基址 */
export function apiBase(): string {
  if (process.env.NEXT_PUBLIC_MOCK_API_BASE) return CLIENT_API_BASE;
  return isBrowser ? '' : SERVER_API_BASE;
}
