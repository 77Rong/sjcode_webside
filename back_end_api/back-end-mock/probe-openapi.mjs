/**
 * 联调探针：列出 PostgREST 暴露的全部路径（含 rpc），并检测 pg_graphql 是否可用
 * 运行：node probe-openapi.mjs
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

const res = await fetch(`${BASE}/rest/v1/`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
})
const spec = await res.json()
console.log('全部路径：')
console.log(Object.keys(spec.paths || {}).join('\n'))

// pg_graphql 检测
const gql = await fetch(`${BASE}/graphql/v1`, {
  method: 'POST',
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __schema { types { name } } }' })
})
console.log('\ngraphql 端点状态 =', gql.status)
if (gql.ok) {
  const j = await gql.json()
  console.log('graphql 可用, 类型数 =', j?.data?.__schema?.types?.length)
} else {
  console.log('graphql 响应 =', (await gql.text()).slice(0, 200))
}
