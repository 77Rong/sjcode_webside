/**
 * 品牌列表接口联调验证脚本
 * 运行：node verify-brand.mjs
 */
const BASE = 'http://localhost:3100';

const log = (tag, payload) => console.log(tag, JSON.stringify(payload, null, 2));

// 1. 列表
const listRes = await fetch(`${BASE}/api/brand/list?current=1&size=10`);
const list = await listRes.json();
log('LIST total =', list.data.total);
log('LIST records =', list.data.records.map((r) => ({ id: r.id, name: r.name, enabled: r.enabled })));

// 2. 新增
const createRes = await fetch(`${BASE}/api/brand`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '联调测试品牌',
    logo: 'data:image/svg+xml;base64,PHN2Zy8+',
    copyright: '© 2026 联调测试品牌',
    icp: '京ICP备 20269999 号',
    enabled: true
  })
});
const created = await createRes.json();
log('CREATE =', created.data);

// 3. 编辑
const updateRes = await fetch(`${BASE}/api/brand/${created.data.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '联调测试品牌-改', enabled: false })
});
log('UPDATE =', (await updateRes.json()).data);

// 4. 启用中的品牌
const active = await (await fetch(`${BASE}/api/brand/active`)).json();
log('ACTIVE =', { id: active.data.id, name: active.data.name, enabled: active.data.enabled });

// 5. 删除
const delRes = await fetch(`${BASE}/api/brand/${created.data.id}`, { method: 'DELETE' });
log('DELETE =', await delRes.json());

// 6. 校验删除后总数
const after = await (await fetch(`${BASE}/api/brand/list?current=1&size=10`)).json();
log('AFTER total =', after.data.total);
