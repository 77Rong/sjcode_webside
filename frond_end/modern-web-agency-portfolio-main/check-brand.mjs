import { writeFileSync } from 'node:fs';

const out = [];
const r = await fetch('http://localhost:3000/');
const t = await r.text();
out.push('status ' + r.status + ' len ' + t.length);
out.push('SSR html has 校园通: ' + t.includes('校园通'));
out.push('SSR html has 京ICP备: ' + t.includes('京ICP备'));

// 模拟浏览器端调用前台品牌接口
const b = await (await fetch('http://localhost:3100/api/brand/active')).json();
out.push('active brand -> ' + JSON.stringify(b.data));

const list = await (await fetch('http://localhost:3100/api/brand/list?current=1&size=10')).json();
out.push('enabled brands -> ' + JSON.stringify(list.data.records.filter((r) => r.enabled).map((r) => r.name)));

writeFileSync('check-brand-result.txt', out.join('\n'), 'utf-8');
console.log('written');
