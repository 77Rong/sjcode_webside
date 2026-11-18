/**
 * 探查现有表结构（列名 / 类型 / 默认值）
 * 运行：node probe-schema.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '.env')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}

const { createClient } = await import('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const { data, error } = await supabase.from('hero_slides').select('*').limit(1)
if (error) {
  console.error('读取失败：', error.message)
  process.exit(1)
}

console.log('=== hero_slides 列结构（由返回字段推断） ===')
console.log(JSON.stringify(data?.[0] ?? {}, null, 2))

// 用 PostgREST 的 OpenAPI 描述拿到精确的列类型
const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  }
})
const openapi = await res.json()
const def = openapi?.definitions?.hero_slides
if (def) {
  console.log('\n=== 列类型与必填 ===')
  for (const [col, schema] of Object.entries(def.properties ?? {})) {
    console.log(`- ${col}  type=${schema.type ?? '?'}  default=${JSON.stringify(schema.default ?? null)}`)
  }
  console.log('required:', JSON.stringify(def.required ?? []))
}
