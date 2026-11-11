'use client';

import * as React from 'react';
import { DEFAULT_BRAND, fetchBrandConfig, type BrandConfig } from './brand-api';

interface BrandContextValue {
  brand: BrandConfig;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BrandContext = React.createContext<BrandContextValue>({
  brand: DEFAULT_BRAND,
  loading: true,
  refresh: async () => {},
});

/**
 * 站点品牌信息提供者
 * 从后台「品牌管理」接口读取品牌名称 / logo / 版权信息 / 备案号，供 Logo、页脚等组件使用。
 *
 * initialBrand 由服务端预取后传入，保证首屏 SSR 即渲染真实品牌；
 * 客户端挂载后再刷新一次，保证后台改动能及时生效。
 */
export function BrandProvider({
  children,
  initialBrand,
}: {
  children: React.ReactNode;
  initialBrand?: BrandConfig;
}) {
  const [brand, setBrand] = React.useState<BrandConfig>(initialBrand ?? DEFAULT_BRAND);
  const [loading, setLoading] = React.useState(!initialBrand);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBrandConfig();
      setBrand(data);
    } catch (err) {
      // 品牌信息读取失败时回退到默认文案，不阻塞页面渲染
      console.error('[brand] 读取品牌配置失败，使用默认值', err);
      setBrand((prev) => prev ?? DEFAULT_BRAND);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const value = React.useMemo(
    () => ({ brand, loading, refresh: load }),
    [brand, loading, load]
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return React.useContext(BrandContext);
}
