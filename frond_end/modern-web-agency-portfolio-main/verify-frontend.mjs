const base = 'http://localhost:3000';
const html = await (await fetch(base + '/')).text();

const paths = [...new Set([...html.matchAll(/_next\/static\/chunks\/[^"']+?\.js/g)].map((m) => m[0]))];
console.log('chunks referenced:', paths.length);

let failed = 0;
for (const p of paths) {
  const r = await fetch(base + '/' + p);
  const t = await r.text();
  // 真实编译错误特征：Next.js dev overlay 报错文案
  const bad = /__next_error__|webpackHotUpdate.*Error|^\s*Error: Failed to compile/m.test(t);
  console.log(bad ? 'BAD ' : 'OK  ', r.status, p);
  if (bad) {
    failed++;
    const idx = t.indexOf('Error');
    console.log(t.slice(Math.max(0, idx - 100), idx + 500));
  }
}
console.log(failed === 0 ? 'ALL CHUNKS OK' : `FAILED CHUNKS: ${failed}`);
