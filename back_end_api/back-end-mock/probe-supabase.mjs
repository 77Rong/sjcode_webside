/**
 * 联调探针：检查 Supabase 连接状态与现有表
 * 运行：node probe-supabase.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 手动解析 .env（避免依赖 dotenv）
function loadEnv() {
  const file = path.join(__dirname, '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const URL_ = process.env.SUPABASE_URL || ''
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
console.log('URL  =', URL_ ? URL_.replace(/\/\/([^.]+)\./, '//***.') : '(空)')
console.log('KEY  =', KEY ? KEY.slice(0, 12) + '...' + KEY.slice(-6) : '(空)')

if (!URL_ || !KEY) {
  console.log('结果：未配置 Supabase 凭证')
  process.exit(0)
}

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(URL_, KEY, { auth: { persistSession: false } })

const { data: tables, error: tErr } = await supabase
  .from('hero_slides')
  .select('id')
  .limit(1)
console.log('hero_slides 查询 =', tErr ? `错误: ${tErr.message}` : `可访问, 样本 ${JSON.stringify(tables)}`)

// 探查是否存在可执行 DDL 的函数
const { data: fns, error: fErr } = await supabase.rpc('exec_sql', { sql: 'select 1' }).then(
  (r) => ({ data: r.data, error: r.error }),
  (e) => ({ data: null, error: e })
)
console.log('exec_sql rpc =', fErr ? `错误: ${fErr.message}` : `可用: ${JSON.stringify(fns)}`)
