/**
 * 探测是否存在可执行 DDL 的 RPC / 扩展（用于自动建表）
 * 运行：node probe-ddl.mjs
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

const base = `${process.env.SUPABASE_URL}/rest/v1`
const headers = {
  apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
}

const candidates = [
  'exec_sql', 'execute_sql', 'run_sql', 'sql', 'query', 'execute',
  'exec', 'pg_exec', 'graphql', 'query_graphql'
]

for (const fn of candidates) {
  const res = await fetch(`${base}/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql: 'select 1', query: '{ __typename }' })
  })
  const text = await res.text()
  if (res.status !== 404 || !text.includes('PGRST202')) {
    console.log(`[${fn}] status=${res.status} body=${text.slice(0, 300)}`)
  } else {
    console.log(`[${fn}] 不存在`)
  }
}
