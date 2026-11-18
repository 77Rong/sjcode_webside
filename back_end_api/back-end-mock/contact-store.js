/**
 * 联系我们留言存储（Supabase）
 *
 * 数据表 public.contact_messages（在 Supabase Dashboard 的 SQL Editor 中执行
 * back-end-mock/sql/contact_messages.sql 创建）
 *
 * 表不存在时（尚未建表 / 未配置凭证）自动回退到 data.json 的 contacts 集合，
 * 保证前台表单与后台列表始终可用。
 *
 * 凭证（.env）：
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   仅后端使用，切勿暴露到前端
 */
import { supabase, supabaseConfigured } from './supabase.js'

/** 留言表名 */
export const CONTACT_TABLE = 'contact_messages'

/** 表是否存在（探测结果缓存 30 秒，便于建表后自动生效） */
let tableReady = null
let tableReadyAt = 0
const TABLE_PROBE_TTL = 30_000

async function ensureContactTable() {
  if (!supabaseConfigured) return false
  if (tableReady === true) return true
  if (tableReady === false && Date.now() - tableReadyAt < TABLE_PROBE_TTL) return false

  const { error } = await supabase.from(CONTACT_TABLE).select('id').limit(1)
  if (!error) {
    tableReady = true
    tableReadyAt = Date.now()
    return true
  }

  tableReady = false
  tableReadyAt = Date.now()
  if (error.code === 'PGRST205') {
    console.warn(
      `[contact] Supabase 表 ${CONTACT_TABLE} 不存在，已回退到 data.json。请执行 sql/contact_messages.sql 建表。`
    )
  } else {
    console.error('[contact] 探测 Supabase 表失败：', error.message)
  }
  return false
}

/** 数据库行（snake_case）→ API 字段（camelCase） */
export function toContactRow(row = {}) {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    message: row.message ?? '',
    status: row.status || 'pending',
    reply: row.reply ?? '',
    createdAt: row.created_at ? String(row.created_at).replace('T', ' ').slice(0, 19) : ''
  }
}

/** API 字段（camelCase）→ 数据库列（snake_case），只保留传入的字段 */
export function toContactColumns(body = {}) {
  const map = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    message: 'message',
    status: 'status',
    reply: 'reply'
  }
  const row = {}
  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) row[column] = body[key]
  }
  return row
}

/** 过滤 PostgREST or() 语法中的特殊字符，避免关键词破坏查询表达式 */
function sanitizeKeyword(kw) {
  return String(kw).trim().replace(/[,()*%]/g, ' ').trim()
}

/** 留言列表：服务端分页 + 关键词 + 状态过滤 */
export async function listContacts({ current = 1, size = 10, keyword = '', status = '' } = {}) {
  let query = supabase
    .from(CONTACT_TABLE)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', String(status))
  }

  const kw = sanitizeKeyword(keyword)
  if (kw) {
    // 关键词同时匹配姓名 / 邮箱 / 电话 / 留言内容
    query = query.or(
      `name.ilike.%${kw}%,email.ilike.%${kw}%,phone.ilike.%${kw}%,message.ilike.%${kw}%`
    )
  }

  const from = (Number(current) - 1) * Number(size)
  const { data, error, count } = await query.range(from, from + Number(size) - 1)

  if (error) throw new Error(error.message)

  return {
    records: (data ?? []).map(toContactRow),
    current: Number(current),
    size: Number(size),
    total: count ?? data?.length ?? 0
  }
}

/** 新增留言，返回落库后的记录 */
export async function createContact(payload) {
  const { data, error } = await supabase
    .from(CONTACT_TABLE)
    .insert(toContactColumns(payload))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return toContactRow(data)
}

/** 更新留言（处理状态 / 备注） */
export async function updateContact(id, payload) {
  const { data, error } = await supabase
    .from(CONTACT_TABLE)
    .update(toContactColumns(payload))
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('留言不存在')
  return toContactRow(data[0])
}

/** 删除留言 */
export async function deleteContact(id) {
  const { data, error } = await supabase
    .from(CONTACT_TABLE)
    .delete()
    .eq('id', id)
    .select('id')

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('留言不存在')
  return { ok: true }
}

/** 探测表是否可用（供 server.js 决定走 Supabase 还是 data.json） */
export { ensureContactTable }
