/**
 * 验证后台品牌状态切换后，前台 SSR 是否同步渲染新品牌
 */
const out = [];

const list = async () => {
  const r = await (await fetch('http://localhost:3100/api/brand/list?current=1&size=10')).json();
  return r.data.records;
};

const active = async () => {
  const r = await (await fetch('http://localhost:3100/api/brand/active')).json();
  return r.data;
};

const ssr = async () => {
  const t = await (await fetch('http://localhost:3000/')).text();
  return {
    hasXiaoyejiao: t.includes('云教务'),
    hasXiaoyuanchuang: t.includes('世纪源创'),
    hasXiaoyuanzhao: t.includes('云校招')
  };
};

// 初始状态
out.push('初始 active -> ' + (await active())?.name);
out.push('初始 SSR -> ' + JSON.stringify(await ssr()));

// 停用「校园通」，启用「云校招」
const records = await list();
const campus = records.find((r) => r.name === '校园通');
const recruit = records.find((r) => r.name === '云校招');

await fetch(`http://localhost:3100/api/brand/${campus.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: false })
});
await fetch(`http://localhost:3100/api/brand/${recruit.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: true })
});

out.push('切换后 active -> ' + (await active())?.name);
out.push('切换后 SSR -> ' + JSON.stringify(await ssr()));

// 还原
await fetch(`http://localhost:3100/api/brand/${campus.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: true })
});
await fetch(`http://localhost:3100/api/brand/${recruit.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: false })
});

out.push('还原后 active -> ' + (await active())?.name);
out.push('还原后 SSR -> ' + JSON.stringify(await ssr()));

console.log(out.join('\n'));
