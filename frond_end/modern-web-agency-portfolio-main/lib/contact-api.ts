/**
 * 前台「联系我们」留言提交接口（对接 back-end-mock 的 /api/contact）
 *
 * 使用同源相对路径 /api/contact，由 next.config.js 的 rewrites 转发到
 * back-end-mock（默认 http://localhost:3100）。
 * 不用绝对地址是因为页面可能通过内网穿透地址访问，此时浏览器里的
 * localhost 指向的不是本机，提交会静默失败。
 * 如需直连后端，可用环境变量覆盖：NEXT_PUBLIC_MOCK_API_BASE
 */

import { apiBase } from './api-base';

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** 提交留言，成功返回后台可见的留言记录 */
export async function fetchSubmitContact(payload: ContactPayload): Promise<{
  ok: boolean;
  msg?: string;
  id?: number;
}> {
  const res = await fetch(`${apiBase()}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('提交失败');

  const json = await res.json();
  return { ok: json?.code === 200, msg: json?.msg, id: json?.data?.id };
}
