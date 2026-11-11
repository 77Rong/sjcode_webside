/**
 * 前台站点品牌配置接口（对接 back-end-mock 的 /api/brand/active）
 *
 * Mock 服务地址可用环境变量覆盖：NEXT_PUBLIC_MOCK_API_BASE
 */

const MOCK_API_BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || 'http://localhost:3100';

export interface BrandConfig {
  /** 品牌 ID */
  id?: number;
  /** 品牌名称 */
  name: string;
  /** 品牌 logo（base64 dataURL 或图片地址） */
  logo: string;
  /** 版权信息 */
  copyright: string;
  /** 备案号 */
  icp: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 最后更新时间 */
  updatedAt?: string;
}

export const DEFAULT_BRAND: BrandConfig = {
  name: '世纪源创',
  logo: '',
  copyright: '© 世纪源创 版权所有',
  icp: '',
};

/** 获取站点品牌配置（后台启用的品牌，多个时取第一个） */
export async function fetchBrandConfig(): Promise<BrandConfig> {
  const res = await fetch(`${MOCK_API_BASE}/api/brand/active`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('品牌配置请求失败');

  const json = await res.json();
  const data = json?.data;
  if (!data) return { ...DEFAULT_BRAND };

  return {
    id: data.id,
    name: data.name || DEFAULT_BRAND.name,
    logo: data.logo || '',
    copyright: data.copyright || DEFAULT_BRAND.copyright,
    icp: data.icp || '',
    enabled: data.enabled,
    updatedAt: data.updateTime,
  };
}

/**
 * 服务端预取品牌配置（供 SSR 使用）
 * 读取失败时回退默认值，不阻塞页面渲染
 */
export async function fetchBrandConfigServer(): Promise<BrandConfig> {
  try {
    return await fetchBrandConfig();
  } catch (err) {
    console.error('[brand] 服务端读取品牌配置失败，使用默认值', err);
    return { ...DEFAULT_BRAND };
  }
}

/** 上报站点访问记录 */
export async function reportAccessLog(payload: {
  path: string;
  timezone?: string;
  userAgent?: string;
}): Promise<void> {
  await fetch(`${MOCK_API_BASE}/api/access-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: payload.path,
      timezone: payload.timezone || '',
      userAgent: payload.userAgent || '',
    }),
    keepalive: true,
  });
}
