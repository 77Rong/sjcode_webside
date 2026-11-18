/**
 * 联调探针：pg_graphql 能否执行写操作 / DDL
 * 运行：node probe-graphql.mjs
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

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE = process.env.SUPABASE_URL

async function gql(query) {
  const res = await fetch(`${BASE}/graphql/v1`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  const text = await res.text()
  return { status: res.status, body: text.slice(0, 500) }
}

console.log('1) 查询 hero_slides:', JSON.stringify(await gql('{ hero_slides { id title } }')))
console.log('\n2) 尝试 CREATE TABLE:', JSON.stringify(await gql(`mutation { create_table(query: "create table t(id int)") { affected_rows } }`)))
