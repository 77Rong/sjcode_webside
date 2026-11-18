/**
 * 联调探针：探测 contact 相关数据表是否存在
 * 运行：node probe-tables.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
function loadEnv() {
  const file = path.join(__dirname, '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const candidates = [
  'contact_messages',
  'contact_submissions',
  'contacts',
  'contact_message',
  'messages',
  'hero_slides'
]

for (const t of candidates) {
  const { data, error } = await supabase.from(t).select('*').limit(1)
  console.log(t.padEnd(22), error ? `不存在 (${error.code})` : `存在, 样本 ${JSON.stringify(data)}`)
}
