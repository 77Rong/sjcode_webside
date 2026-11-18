/**
 * 列出 PostgREST 暴露的全部表与 RPC 函数
 * 运行：node probe-openapi-all.mjs
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

const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  }
})
const openapi = await res.json()

console.log('=== 暴露的路径 ===')
for (const p of Object.keys(openapi.paths ?? {})) console.log(' ', p)

console.log('\n=== 表（definitions） ===')
for (const d of Object.keys(openapi.definitions ?? {})) console.log(' ', d)

console.log('\n=== RPC 函数 ===')
for (const p of Object.keys(openapi.paths ?? {})) {
  if (p.startsWith('/rpc/')) console.log(' ', p.replace('/rpc/', ''))
}
