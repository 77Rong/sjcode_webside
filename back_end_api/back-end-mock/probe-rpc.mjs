/**
 * 联调探针：探测可用于执行 DDL 的 RPC 函数
 * 运行：node probe-rpc.mjs
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

const rpcNames = ['exec_sql', 'execute_sql', 'run_sql', 'sql', 'query', 'exec']
for (const fn of rpcNames) {
  const { error } = await supabase.rpc(fn, { sql: 'select 1', query: 'select 1', statement: 'select 1' })
  console.log(fn.padEnd(14), error ? `不可用 (${error.code}: ${error.message.slice(0, 60)})` : '可用!')
}

// 尝试 OpenAPI 根，确认暴露的 schema
const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
  headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
})
const spec = await res.json()
const paths = Object.keys(spec.paths || {})
console.log('\n暴露的表路径：')
console.log(paths.filter((p) => !p.includes('rpc')).join('\n'))
