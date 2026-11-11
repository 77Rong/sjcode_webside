/**
 * Supabase 客户端封装
 *
 * 用于「首页焦点图」功能：
 *  - 数据库表 public.hero_slides（在 Supabase Dashboard 的 SQL Editor 中执行建表 SQL）
 *  - 存储桶 hero-images（公开读，由本模块在首次上传时自动创建）
 *
 * 凭证从环境变量读取（.env 文件，随 npm start / npm dev 自动加载）：
 *  - SUPABASE_URL                形如 https://xxxx.supabase.co
 *  - SUPABASE_SERVICE_ROLE_KEY   service_role 密钥（仅在后端使用，切勿提交/暴露到前端）
 *
 * 未配置时相关接口返回友好提示，不影响其他 mock 接口。
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/** 存放轮播图片的公开存储桶名 */
export const BUCKET_NAME = 'hero-images'
/** 对应的数据库表名 */
export const HERO_TABLE = 'hero_slides'

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null

/** 存储桶是否已确认存在（避免每次上传都查询） */
let bucketReady = false

/** 首次上传前确保存储桶存在（不存在则创建公开桶） */
export async function ensureHeroBucket() {
  if (!supabase || bucketReady) return
  const { data } = await supabase.storage.getBucket(BUCKET_NAME)
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true })
    if (error) {
      const msg = String(error.message || '').toLowerCase()
      // 桶已存在（并发/残留）时忽略，其他错误抛出
      if (!msg.includes('exist') && !msg.includes('duplicate')) throw error
    }
  }
  bucketReady = true
}

/** 数据库行（snake_case）→ API 字段（camelCase） */
export function toHeroApi(row = {}) {
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    badge: row.badge ?? '',
    imageUrl: row.image_url ?? '',
    imageAlt: row.image_alt ?? '',
    linkUrl: row.link_url ?? '',
    enabled: row.enabled ?? true,
    sortOrder: row.sort_order ?? 0,
    createTime: row.created_at ? String(row.created_at).replace('T', ' ').slice(0, 19) : '',
    updateTime: row.updated_at ? String(row.updated_at).replace('T', ' ').slice(0, 19) : ''
  }
}

/** API 字段（camelCase）→ 数据库列（snake_case），只保留请求中传入的字段 */
export function toHeroRow(body = {}) {
  const map = {
    title: 'title',
    subtitle: 'subtitle',
    badge: 'badge',
    imageUrl: 'image_url',
    imageAlt: 'image_alt',
    linkUrl: 'link_url',
    enabled: 'enabled',
    sortOrder: 'sort_order'
  }
  const row = {}
  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) row[column] = body[key]
  }
  return row
}

/** 从图片公开 URL 中解析出存储对象路径（用于删除旧图） */
export function extractStoragePath(imageUrl) {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
  const idx = String(imageUrl || '').indexOf(marker)
  if (idx < 0) return null
  return decodeURIComponent(String(imageUrl).slice(idx + marker.length).split('?')[0])
}
