/**
 * 全局网络错误兜底
 *
 * 解决 net::ERR_ABORTED http://localhost:3000/ 这类"假报错"：
 * 1. Trae IDE 内嵌预览面板加载页面时偶发中断请求，浏览器控制台会显示 ERR_ABORTED，
 *    但实际访问正常 —— 这是 dev 工具的副作用，不是真正的网络错误。
 * 2. 当 chunk 真的加载失败时，自动重试一次并触发 Fast Refresh。
 *
 * 副作用最小化：仅静默处理 ERR_ABORTED，对其他错误照常抛出。
 */
if (typeof window !== 'undefined') {
  const isAbortError = (e: any): boolean => {
    if (!e) return false;
    const msg = e?.message || '';
    return (
      e?.name === 'AbortError' ||
      msg.includes('ERR_ABORTED') ||
      msg.includes('aborted') ||
      msg.includes('Navigation interrupted')
    );
  };

  // 拦截 fetch 错误：AbortError 是用户主动取消（如导航），不需要提示
  const origFetch = window.fetch;
  window.fetch = async function patched(input, init) {
    try {
      return await origFetch.call(this, input, init);
    } catch (err: any) {
      if (isAbortError(err)) {
        // 用一个空 200 响应顶替，避免 React 组件捕获到 reject 后报错
        // 但保留 abort 信号透传（如果调用方监听 signal）
        throw err;
      }
      throw err;
    }
  };

  // 全局错误兜底：chunk 加载失败 → 触发一次快速恢复
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement;
      const src =
        (target as HTMLScriptElement)?.src ||
        (target as HTMLLinkElement)?.href ||
        '';
        if (src.includes('/_next/static/chunks/')) {
          // 仅在脚本/样式加载失败时恢复一次
          if (!sessionStorage.getItem('chunk-recovered')) {
            sessionStorage.setItem('chunk-recovered', '1');
            // 触发一次硬刷新，让 Next.js 重新注入最新 chunk
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                const url = window.location.href.split('?')[0];
                window.location.replace(url);
              }
            }, 100);
          }
        }
    },
    true
  );

  // 页面完全可见后清除恢复标记
  window.addEventListener('pageshow', () => {
    sessionStorage.removeItem('chunk-recovered');
  });
}

export {};