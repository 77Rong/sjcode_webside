-- =====================================================================
-- 产品管理（Product）建表 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行本文件全部内容
-- =====================================================================

-- 1. 产品表（富文本 content 存 HTML 字符串）
create table if not exists public.products (
  id         bigint generated always as identity primary key,
  name       text        not null,                -- 产品名称
  sub_title  text        not null default '',     -- 二级标题 / 营销标语
  category   text        not null default '其它',  -- 产品分类（教育/建站/管理/其它）
  summary    text        not null default '',     -- 一句话简介
  content    text        not null default '',     -- 产品正本（WangEditor 富文本 HTML）
  enabled    boolean     not null default true,   -- 是否启用
  sort_order int         not null default 0,      -- 排序值（小的在前）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. updated_at 自动更新触发器
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 3. 种子数据（与原 mock 的 3 条产品一致，便于无缝过渡）
insert into public.products (name, sub_title, category, summary, content, sort_order)
select * from (values
  (
    '智慧校园管理平台',
    '校园一体化数字管理',
    '教育',
    '覆盖教学、学工、办公全场景的智慧校园一体化平台...',
    '<h2>产品介绍</h2><p>面向您的全场景业务的一体化平台。</p><p>覆盖教学、学工、办公全场景。</p><h3>核心功能</h3><ul><li>智能排课</li><li>在线考务</li><li>成绩分析</li></ul>',
    0
  ),
  (
    '企业官网定制',
    '高端定制企业官网',
    '建站',
    '为企业量身打造品牌官网，响应式设计 + 私域运营...',
    '<h2>服务介绍</h2><p>为企业量身打造品牌官网，响应式设计 + 私域运营。</p>',
    0
  ),
  (
    '教务管理系统',
    '排课 / 考务 / 成绩',
    '教育',
    '教务核心系统，支持智能排课、在线考务与成绩分析...',
    '<h2>系统简介</h2><p>教务核心系统，支持智能排课、在线考务与成绩分析。</p>',
    0
  )
) as seed(name, sub_title, category, summary, content, sort_order)
where not exists (select 1 from public.products);
