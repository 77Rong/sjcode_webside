/**
 * 后台管理系统 - Mock 数据服务
 *
 * 端口：3100
 *
 * 提供的接口：
 *   GET  /api/dashboard/visits  -> 折线图数据（默认最近 7 天）
 *   GET  /api/access-logs       -> 访问详情列表（分页 + 过滤）
 *   POST /api/access-log        -> 上报一条访问记录（由 front_end 调用）
 *   DELETE /api/access-logs     -> 清空访问记录
 *   GET  /api/brand/list        -> 品牌列表（分页 + 过滤）
 *   GET  /api/brand/active      -> 当前启用的品牌（前台站点使用）
 *   POST /api/brand             -> 新增品牌
 *   PUT  /api/brand/:id         -> 更新品牌
 *   DELETE /api/brand/:id       -> 删除品牌
 *   GET  /api/users             -> 用户列表
 *
 * 联系我们（前台留言表单 -> 后台联系管理）：
 *   POST   /api/contact         -> 提交留言（前台「联系我们」表单调用）
 *   GET    /api/contact/list    -> 留言列表（后台管理，分页 + 关键词 + 状态过滤）
 *   PUT    /api/contact/:id     -> 更新留言（处理状态）
 *   DELETE /api/contact/:id     -> 删除留言
 *
 * 首页焦点图（数据与图片存储在 Supabase，凭证见 .env）：
 *   GET    /api/hero/list        -> 焦点图列表（后台管理，关键词 + 启用过滤）
 *   GET    /api/hero/active      -> 启用中的焦点图（前台轮播使用，按 sort_order 排序）
 *   POST   /api/hero             -> 新增焦点图
 *   PUT    /api/hero/:id         -> 更新焦点图（任意字段）
 *   DELETE /api/hero/:id         -> 删除焦点图（同时清理存储对象）
 *   POST   /api/hero/:id/image   -> 上传/替换图片（multipart form-data，存 Supabase Storage）
 *
 * 本地数据（品牌 / 用户 / 访问日志 / 留言）持久化到 ./data.json
 */
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  supabase,
  supabaseConfigured,
  ensureHeroBucket,
  ensureEditorBucket,
  toHeroApi,
  toHeroRow,
  toProductApi,
  toProductRow,
  extractStoragePath,
  BUCKET_NAME,
  EDITOR_BUCKET,
  HERO_TABLE,
  PRODUCT_TABLE
} from './supabase.js'
import {
  ensureContactTable,
  listContacts,
  createContact,
  updateContact,
  deleteContact
} from './contact-store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'data.json')

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 3100

// ----------------- 启动时初始化数据 -----------------
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
      // 兼容旧版用户数据结构（username/nickname/role/createdAt），升级为后台管理所需字段
      if (Array.isArray(data.users) && data.users.length && !('userName' in data.users[0])) {
        data.users = data.users.map((u) => ({
          id: u.id,
          userName: u.username,
          nickName: u.nickname,
          userGender: '男',
          userPhone: '',
          userEmail: u.email || '',
          userRoles: [],
          status: u.status === 1 ? '1' : '2',
          createBy: 'system',
          createTime: u.createdAt || '',
          updateBy: 'system',
          updateTime: u.createdAt || ''
        }))
      }
      // 兼容旧版单条品牌配置结构，升级为品牌列表
      if (!Array.isArray(data.brands)) {
        const legacy = data.brand
        data.brands = [
          {
            id: 1,
            name: legacy?.name || '世纪源创',
            logo: legacy?.logo || '',
            copyright: legacy?.copyright || '© 2025 世纪源创 版权所有',
            icp: legacy?.icp || '沪ICP备2025000000号-1',
            enabled: true,
            createTime: legacy?.updatedAt || '2025-01-12 10:00:00',
            updateTime: legacy?.updatedAt || '2025-01-12 10:00:00'
          }
        ]
        delete data.brand
      }
      // 兼容旧版留言结构（无 status 字段），补齐处理状态
      if (!Array.isArray(data.contacts)) {
        data.contacts = []
      } else {
        data.contacts = data.contacts.map((c) => ({
          ...c,
          status: c.status || 'pending',
          reply: c.reply || ''
        }))
      }
      return data
    } catch (e) {
      console.error('[mock] 解析 data.json 失败，使用初始数据', e)
    }
  }
  return initSeed()
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * 初始化假数据：访问记录 + 品牌 + 用户
 */
function initSeed() {
  const now = Date.now()
  const seedRegions = [
    '北京市',
    '上海市',
    '广州市',
    '深圳市',
    '杭州市',
    '成都市',
    '武汉市',
    '南京市',
    '重庆市',
    '西安市',
    '苏州市',
    '天津市',
    '青岛市',
    '长沙市',
    '郑州市'
  ]
  const seedIps = [
    '127.0.0.1',
    '192.168.1.10',
    '192.168.1.11',
    '10.0.0.2',
    '10.0.0.3',
    '172.16.0.5',
    '222.94.140.9',
    '58.213.123.45',
    '114.88.66.21',
    '36.22.55.7'
  ]
  const seedPaths = ['/', '/products', '/services', '/help', '/contact', '/about', '/news']

  const accessLogs = []
  for (let i = 0; i < 60; i++) {
    const offset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    accessLogs.push({
      id: now - i * 1000,
      ip: seedIps[Math.floor(Math.random() * seedIps.length)],
      region: seedRegions[Math.floor(Math.random() * seedRegions.length)],
      time: new Date(now - offset).toISOString(),
      path: seedPaths[Math.floor(Math.random() * seedPaths.length)],
      userAgent:
        Math.random() > 0.5
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
    })
  }
  accessLogs.sort((a, b) => b.id - a.id)

  const brands = [
    {
      id: 1,
      name: '校园通',
      logo: '',
      copyright: '© 2026 校园通教育科技有限公司',
      icp: '京ICP备 20260001 号',
      enabled: true,
      createTime: '2026-01-08 09:30:00',
      updateTime: '2026-01-08 09:30:00'
    },
    {
      id: 2,
      name: '云教务',
      logo: '',
      copyright: '© 2026 云教务 All Rights Reserved',
      icp: '京ICP备 20260002 号',
      enabled: true,
      createTime: '2026-02-15 14:20:00',
      updateTime: '2026-02-15 14:20:00'
    },
    {
      id: 3,
      name: '云校招',
      logo: '',
      copyright: '© 2026 云校招',
      icp: '京ICP备 20260003 号',
      enabled: false,
      createTime: '2026-03-22 11:05:00',
      updateTime: '2026-03-22 11:05:00'
    }
  ]

  const users = [
    {
      id: 1,
      userName: 'admin',
      nickName: '超级管理员',
      userGender: '男',
      userPhone: '13800138000',
      userEmail: 'admin@example.com',
      userRoles: ['R_SUPER'],
      status: '1',
      createBy: 'system',
      createTime: '2025-01-01 09:00:00',
      updateBy: 'system',
      updateTime: '2025-01-01 09:00:00'
    },
    {
      id: 2,
      userName: 'editor',
      nickName: '内容编辑',
      userGender: '女',
      userPhone: '13800138001',
      userEmail: 'editor@example.com',
      userRoles: ['R_ADMIN'],
      status: '1',
      createBy: 'admin',
      createTime: '2025-01-05 14:20:00',
      updateBy: 'admin',
      updateTime: '2025-01-05 14:20:00'
    },
    {
      id: 3,
      userName: 'viewer',
      nickName: '访客',
      userGender: '男',
      userPhone: '13800138002',
      userEmail: 'viewer@example.com',
      userRoles: [],
      status: '2',
      createBy: 'admin',
      createTime: '2025-01-08 11:11:00',
      updateBy: 'admin',
      updateTime: '2025-01-08 11:11:00'
    },
    {
      id: 4,
      userName: 'zhangsan',
      nickName: '张三',
      userGender: '男',
      userPhone: '13905718888',
      userEmail: 'zhangsan@example.com',
      userRoles: ['R_ADMIN'],
      status: '1',
      createBy: 'admin',
      createTime: '2025-02-11 09:30:00',
      updateBy: 'admin',
      updateTime: '2025-02-11 09:30:00'
    },
    {
      id: 5,
      userName: 'lisi',
      nickName: '李四',
      userGender: '女',
      userPhone: '13705719999',
      userEmail: 'lisi@example.com',
      userRoles: ['R_ADMIN'],
      status: '1',
      createBy: 'admin',
      createTime: '2025-03-02 16:45:00',
      updateBy: 'admin',
      updateTime: '2025-03-02 16:45:00'
    },
    {
      id: 6,
      userName: 'wangwu',
      nickName: '王五',
      userGender: '男',
      userPhone: '13605712222',
      userEmail: 'wangwu@example.com',
      userRoles: [],
      status: '2',
      createBy: 'zhangsan',
      createTime: '2025-04-18 10:05:00',
      updateBy: 'zhangsan',
      updateTime: '2025-04-18 10:05:00'
    },
    {
      id: 7,
      userName: 'sunqi',
      nickName: '孙七',
      userGender: '女',
      userPhone: '13505713333',
      userEmail: 'sunqi@example.com',
      userRoles: ['R_ADMIN'],
      status: '1',
      createBy: 'admin',
      createTime: '2025-05-22 13:20:00',
      updateBy: 'admin',
      updateTime: '2025-05-22 13:20:00'
    },
    {
      id: 8,
      userName: 'zhouba',
      nickName: '周八',
      userGender: '男',
      userPhone: '13405714444',
      userEmail: 'zhouba@example.com',
      userRoles: [],
      status: '4',
      createBy: 'admin',
      createTime: '2025-06-30 08:00:00',
      updateBy: 'admin',
      updateTime: '2025-06-30 08:00:00'
    }
  ]

  const contacts = [
    {
      id: 1,
      name: '张同学',
      email: 'zhang@example.com',
      phone: '13812341234',
      message: '想咨询产品定制流程',
      status: 'pending',
      reply: '',
      createdAt: '2026-09-28 14:25:31'
    },
    {
      id: 2,
      name: '王老师',
      email: 'wang@example.com',
      phone: '13987655678',
      message: '希望上门演示系统',
      status: 'processed',
      reply: '已电话联系，安排下周演示',
      createdAt: '2026-09-29 09:42:18'
    },
    {
      id: 3,
      name: '刘总',
      email: 'liu@example.com',
      phone: '13678909012',
      message: '需要商务合作',
      status: 'pending',
      reply: '',
      createdAt: '2026-09-30 11:08:55'
    }
  ]

  return { accessLogs, brands, users, contacts }
}

const db = loadData()

// ----------------- Express 启动 -----------------
const app = express()
app.use(cors())
// 品牌 logo 以 base64 dataURL 形式存储，放宽请求体大小限制
app.use(express.json({ limit: '5mb' }))

// 简单访问日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

/** 统一响应包装 */
function ok(data) {
  return { code: 200, msg: 'success', data }
}
function fail(msg, code = 400) {
  return { code, msg, data: null }
}

// ----------------- 仪表盘：折线图 -----------------
app.get('/api/dashboard/visits', (req, res) => {
  const days = Math.max(1, Math.min(30, Number(req.query.days) || 7))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates = []
  const values = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    dates.push(key)
    const count = db.accessLogs.filter((it) => it.time?.slice(0, 10) === key).length
    // 给一个保底值，避免数据全是 0 看不到线
    const seed = Math.max(3, Math.round(Math.random() * 25))
    values.push(count + seed)
  }
  res.json(ok({ dates, values }))
})

// ----------------- 访问记录 -----------------
app.get('/api/access-logs', (req, res) => {
  const { page = 1, pageSize = 20, ip = '', region = '' } = req.query
  const list = db.accessLogs
    .filter((it) => {
      if (ip && !it.ip.includes(ip)) return false
      if (region && !it.region.includes(region)) return false
      return true
    })
    .sort((a, b) => b.id - a.id)
  const start = (Number(page) - 1) * Number(pageSize)
  const end = start + Number(pageSize)
  res.json(ok({ list: list.slice(start, end), total: list.length }))
})

// 依据客户端时区推断地区（无外部 IP 库时的轻量方案）
const TIMEZONE_REGIONS = {
  'Asia/Shanghai': '上海市',
  'Asia/Chongqing': '重庆市',
  'Asia/Urumqi': '乌鲁木齐市',
  'Asia/Hong_Kong': '香港特别行政区',
  'Asia/Macau': '澳门特别行政区',
  'Asia/Taipei': '台北市',
  'Asia/Tokyo': '东京都',
  'Asia/Seoul': '首尔特别市',
  'America/New_York': '纽约市',
  'America/Los_Angeles': '洛杉矶市',
  'Europe/London': '伦敦市'
}

app.post('/api/access-log', (req, res) => {
  const { ip = '', region = '', timezone = '', path: p = '', userAgent = '' } = req.body || {}
  const finalIp = ip || (req.headers['x-forwarded-for']?.toString().split(',')[0].trim()) || req.ip || '127.0.0.1'
  const finalRegion = region || TIMEZONE_REGIONS[timezone] || '未知地区'
  const item = {
    id: Date.now(),
    ip: finalIp,
    region: finalRegion,
    time: new Date().toISOString(),
    path: p,
    userAgent
  }
  db.accessLogs.unshift(item)
  if (db.accessLogs.length > 5000) db.accessLogs.length = 5000
  saveData(db)
  res.json(ok({ ok: true }))
})

app.delete('/api/access-logs', (_req, res) => {
  db.accessLogs = []
  saveData(db)
  res.json(ok({ ok: true }))
})

// ----------------- 品牌管理（多品牌列表） -----------------
// 后台品牌列表：分页 + 名称/状态过滤
app.get('/api/brand/list', (req, res) => {
  const { current = 1, size = 10, name = '', enabled } = req.query

  let list = db.brands.slice()

  if (name) {
    const kw = String(name).toLowerCase()
    list = list.filter((b) => b.name.toLowerCase().includes(kw))
  }
  if (enabled !== undefined && enabled !== '' && enabled !== 'all') {
    const target = enabled === true || enabled === 'true' || enabled === 1 || enabled === '1'
    list = list.filter((b) => b.enabled === target)
  }

  const total = list.length
  const start = (Number(current) - 1) * Number(size)
  const records = list.slice(start, start + Number(size))

  res.json(ok({ records, current: Number(current), size: Number(size), total }))
})

// 前台站点使用：取第一个启用中的品牌
app.get('/api/brand/active', (_req, res) => {
  const active = db.brands.find((b) => b.enabled) || null
  res.json(ok(active))
})

// 新增品牌
app.post('/api/brand', (req, res) => {
  const { name, logo = '', copyright = '', icp = '', enabled = true } = req.body || {}
  if (!name || !String(name).trim()) return res.json(fail('品牌名称不能为空'))

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const item = {
    id: Math.max(0, ...db.brands.map((b) => b.id)) + 1,
    name: String(name).trim(),
    logo,
    copyright,
    icp,
    enabled: enabled === true || enabled === 'true' || enabled === 1 || enabled === '1',
    createTime: now,
    updateTime: now
  }
  db.brands.unshift(item)
  saveData(db)
  res.json(ok(item))
})

// 更新品牌
app.put('/api/brand/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.brands.findIndex((b) => b.id === id)
  if (idx < 0) return res.json(fail('品牌不存在'))

  const { name, logo, copyright, icp, enabled } = req.body || {}
  if (name !== undefined && !String(name).trim()) return res.json(fail('品牌名称不能为空'))

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  db.brands[idx] = {
    ...db.brands[idx],
    name: name !== undefined ? String(name).trim() : db.brands[idx].name,
    logo: logo !== undefined ? logo : db.brands[idx].logo,
    copyright: copyright !== undefined ? copyright : db.brands[idx].copyright,
    icp: icp !== undefined ? icp : db.brands[idx].icp,
    enabled:
      enabled !== undefined
        ? enabled === true || enabled === 'true' || enabled === 1 || enabled === '1'
        : db.brands[idx].enabled,
    updateTime: now
  }
  saveData(db)
  res.json(ok(db.brands[idx]))
})

// 删除品牌
app.delete('/api/brand/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.brands.findIndex((b) => b.id === id)
  if (idx < 0) return res.json(fail('品牌不存在'))
  db.brands.splice(idx, 1)
  saveData(db)
  res.json(ok({ ok: true }))
})

// ----------------- 联系我们留言 -----------------

/** 电话脱敏：13812341234 -> 138****1234 */
function maskPhone(phone) {
  const str = String(phone || '')
  if (str.length < 7) return str
  return `${str.slice(0, 3)}****${str.slice(-4)}`
}

/** 留言记录 -> API 字段（列表用脱敏电话，详情用原始电话） */
function toContactApi(row = {}) {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    phone: maskPhone(row.phone),
    rawPhone: row.phone ?? '',
    message: row.message ?? '',
    status: row.status || 'pending',
    reply: row.reply ?? '',
    createdAt: row.createdAt ?? ''
  }
}

// 前台提交留言
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {}
  if (!name || !String(name).trim()) return res.json(fail('姓名不能为空'))
  if (!email || !String(email).trim()) return res.json(fail('邮箱不能为空'))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.json(fail('邮箱格式不正确'))
  }
  if (!phone || !String(phone).trim()) return res.json(fail('电话不能为空'))
  if (!message || !String(message).trim()) return res.json(fail('留言内容不能为空'))

  const payload = {
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    message: String(message).trim(),
    status: 'pending',
    reply: ''
  }

  // Supabase 表可用时直接入库
  if (await ensureContactTable()) {
    try {
      const created = await createContact(payload)
      return res.json(ok(toContactApi(created)))
    } catch (err) {
      console.error('[contact] 写入 Supabase 失败：', err.message)
      return res.json(fail('提交失败，请稍后重试'))
    }
  }

  // 回退：data.json
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const item = {
    id: Math.max(0, ...db.contacts.map((c) => c.id)) + 1,
    ...payload,
    createdAt:
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  }
  db.contacts.unshift(item)
  saveData(db)
  res.json(ok(toContactApi(item)))
})

// 后台列表：分页 + 关键词 + 处理状态过滤
app.get('/api/contact/list', async (req, res) => {
  const { current = 1, size = 10, keyword = '', status = '' } = req.query

  if (await ensureContactTable()) {
    try {
      const result = await listContacts({ current, size, keyword, status })
      return res.json(
        ok({
          records: result.records.map(toContactApi),
          current: result.current,
          size: result.size,
          total: result.total
        })
      )
    } catch (err) {
      console.error('[contact] 读取 Supabase 失败：', err.message)
      return res.json(fail('读取留言失败，请稍后重试'))
    }
  }

  let list = db.contacts.slice()

  if (keyword) {
    const kw = String(keyword).trim().toLowerCase()
    list = list.filter(
      (c) =>
        String(c.name).toLowerCase().includes(kw) ||
        String(c.email).toLowerCase().includes(kw) ||
        String(c.phone).includes(kw) ||
        String(c.message).toLowerCase().includes(kw)
    )
  }
  if (status && status !== 'all') {
    list = list.filter((c) => (c.status || 'pending') === String(status))
  }

  const total = list.length
  const start = (Number(current) - 1) * Number(size)
  const records = list.slice(start, start + Number(size)).map(toContactApi)

  res.json(ok({ records, current: Number(current), size: Number(size), total }))
})

// 更新留言（处理状态 / 备注）
app.put('/api/contact/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { status, reply } = req.body || {}
  if (status !== undefined && !['pending', 'processed'].includes(String(status))) {
    return res.json(fail('处理状态不合法'))
  }

  const patch = {}
  if (status !== undefined) patch.status = String(status)
  if (reply !== undefined) patch.reply = String(reply)

  if (await ensureContactTable()) {
    try {
      const updated = await updateContact(id, patch)
      return res.json(ok(toContactApi(updated)))
    } catch (err) {
      console.error('[contact] 更新 Supabase 失败：', err.message)
      return res.json(fail('留言不存在或更新失败'))
    }
  }

  const idx = db.contacts.findIndex((c) => c.id === id)
  if (idx < 0) return res.json(fail('留言不存在'))

  db.contacts[idx] = {
    ...db.contacts[idx],
    status: status !== undefined ? String(status) : db.contacts[idx].status || 'pending',
    reply: reply !== undefined ? String(reply) : db.contacts[idx].reply || ''
  }
  saveData(db)
  res.json(ok(toContactApi(db.contacts[idx])))
})

// 删除留言
app.delete('/api/contact/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (await ensureContactTable()) {
    try {
      await deleteContact(id)
      return res.json(ok({ ok: true }))
    } catch (err) {
      console.error('[contact] 删除 Supabase 失败：', err.message)
      return res.json(fail('留言不存在或删除失败'))
    }
  }

  const idx = db.contacts.findIndex((c) => c.id === id)
  if (idx < 0) return res.json(fail('留言不存在'))
  db.contacts.splice(idx, 1)
  saveData(db)
  res.json(ok({ ok: true }))
})

// ----------------- 用户管理 -----------------
// 后台管理（Art Design Pro）用户列表：分页 + 多条件筛选
app.get('/api/user/list', (req, res) => {
  const { current = 1, size = 10, userName, userPhone, userEmail, status, userGender } = req.query

  let list = db.users.slice()

  if (userName) {
    const kw = String(userName).toLowerCase()
    list = list.filter((u) => u.userName.toLowerCase().includes(kw) || u.nickName.toLowerCase().includes(kw))
  }
  if (userPhone) {
    list = list.filter((u) => u.userPhone.includes(String(userPhone)))
  }
  if (userEmail) {
    const kw = String(userEmail).toLowerCase()
    list = list.filter((u) => u.userEmail.toLowerCase().includes(kw))
  }
  if (status) {
    list = list.filter((u) => u.status === String(status))
  }
  if (userGender) {
    // 前端性别筛选值为 1=男 2=女
    const gender = userGender === '1' ? '男' : userGender === '2' ? '女' : String(userGender)
    list = list.filter((u) => u.userGender === gender)
  }

  const total = list.length
  const start = (Number(current) - 1) * Number(size)
  const records = list.slice(start, start + Number(size))

  res.json(ok({ records, current: Number(current), size: Number(size), total }))
})

// 用户名/邮箱查重（供前台注册页实时调用）
app.get('/api/user/check', (req, res) => {
  const { userName = '', userEmail = '' } = req.query
  const name = String(userName).trim().toLowerCase()
  const mail = String(userEmail).trim().toLowerCase()

  res.json(
    ok({
      userNameExists: !!name && db.users.some((u) => String(u.userName).toLowerCase() === name),
      userEmailExists: !!mail && db.users.some((u) => String(u.userEmail).toLowerCase() === mail)
    })
  )
})

// 新增用户
app.post('/api/user', (req, res) => {
  const { userName, nickName = '', userGender = '男', userPhone = '', userEmail = '', userRoles = [], status = '1' } = req.body || {}
  if (!userName) return res.json(fail('用户名不能为空'))
  if (
    db.users.some((u) => String(u.userName).toLowerCase() === String(userName).toLowerCase())
  ) {
    return res.json(fail('用户名已存在'))
  }
  if (userEmail && db.users.some((u) => String(u.userEmail).toLowerCase() === String(userEmail).toLowerCase())) {
    return res.json(fail('邮箱已存在'))
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const item = {
    id: Math.max(0, ...db.users.map((u) => u.id)) + 1,
    userName,
    nickName,
    userGender,
    userPhone,
    userEmail,
    userRoles,
    status,
    createBy: 'admin',
    createTime: now,
    updateBy: 'admin',
    updateTime: now
  }
  db.users.unshift(item)
  saveData(db)
  res.json(ok(item))
})

// 更新用户
app.put('/api/user/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx < 0) return res.json(fail('用户不存在'))

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  db.users[idx] = {
    ...db.users[idx],
    ...req.body,
    id,
    updateBy: 'admin',
    updateTime: now
  }
  saveData(db)
  res.json(ok(db.users[idx]))
})

// 重置密码
app.put('/api/user/:id/password', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx < 0) return res.json(fail('用户不存在'))

  const { password = '' } = req.body || {}
  if (!password || String(password).length < 6) return res.json(fail('新密码至少 6 位'))

  db.users[idx] = {
    ...db.users[idx],
    password: String(password),
    updateBy: 'admin',
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  saveData(db)
  res.json(ok({ ok: true, userId: id, password: String(password) }))
})

// 删除（注销）用户
app.delete('/api/user/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx < 0) return res.json(fail('用户不存在'))
  db.users.splice(idx, 1)
  saveData(db)
  res.json(ok({ ok: true }))
})

// 兼容旧接口：用户列表
app.get('/api/users', (req, res) => {
  const { page = 1, pageSize = 20, keyword = '' } = req.query
  const list = db.users.filter((u) => !keyword || u.userName.includes(keyword) || u.nickName.includes(keyword))
  const start = (Number(page) - 1) * Number(pageSize)
  res.json(ok({ list: list.slice(start, start + Number(pageSize)), total: list.length }))
})

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = db.users.findIndex((u) => u.id === id)
  if (idx < 0) return res.json(fail('用户不存在'))
  db.users.splice(idx, 1)
  saveData(db)
  res.json(ok({ ok: true }))
})

// ----------------- 登录（占位） -----------------
app.post('/api/auth/login', (req, res) => {
  const { username = 'admin', password = '123456' } = req.body || {}
  if (username === 'admin' && password === '123456') {
    res.json(ok({ token: 'mock-token-' + Date.now(), username }))
  } else {
    res.json(fail('账号或密码错误', 401))
  }
})

app.get('/api/user/info', (_req, res) => {
  res.json(
    ok({
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: '',
      roles: ['R_SUPER', 'R_ADMIN']
    })
  )
})

// ----------------- 首页焦点图（Supabase：hero_slides 表 + Storage） -----------------

/** 未配置 Supabase 时统一返回提示 */
function requireSupabase(res) {
  if (!supabaseConfigured) {
    res.json(
      fail('后端未配置 Supabase：请在 back-end-mock/.env 中填写 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY', 500)
    )
    return false
  }
  return true
}

// 列表（后台管理）：关键词搜索 + 启用状态过滤
app.get('/api/hero/list', async (req, res) => {
  if (!requireSupabase(res)) return
  const { keyword = '', enabled } = req.query

  let query = supabase.from(HERO_TABLE).select('*').order('sort_order').order('id')
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,subtitle.ilike.%${keyword}%,link_url.ilike.%${keyword}%`)
  }
  if (enabled !== undefined && enabled !== '' && enabled !== 'all') {
    query = query.eq('enabled', enabled === 'true' || enabled === '1')
  }

  const { data, error } = await query
  if (error) return res.json(fail(`读取焦点图失败：${error.message}`, 500))
  res.json(ok((data || []).map(toHeroApi)))
})

// 前台站点使用：启用中的焦点图，按 sort_order 升序
app.get('/api/hero/active', async (_req, res) => {
  if (!requireSupabase(res)) return
  const { data, error } = await supabase
    .from(HERO_TABLE)
    .select('*')
    .eq('enabled', true)
    .order('sort_order')
    .order('id')
  if (error) return res.json(fail(`读取焦点图失败：${error.message}`, 500))
  res.json(ok((data || []).map(toHeroApi)))
})

// 新增焦点图
app.post('/api/hero', async (req, res) => {
  if (!requireSupabase(res)) return
  const body = req.body || {}
  if (!body.title || !String(body.title).trim()) return res.json(fail('标题不能为空'))
  if (!body.imageUrl || !String(body.imageUrl).trim()) return res.json(fail('图片 URL 不能为空'))

  const row = toHeroRow(body)
  const { data, error } = await supabase.from(HERO_TABLE).insert(row).select().single()
  if (error) return res.json(fail(`新增焦点图失败：${error.message}`, 500))
  res.json(ok(toHeroApi(data)))
})

// 更新焦点图（支持任意字段的局部更新）
app.put('/api/hero/:id', async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)
  const row = toHeroRow(req.body || {})
  if (!Object.keys(row).length) return res.json(fail('没有需要更新的字段'))

  const { data, error } = await supabase.from(HERO_TABLE).update(row).eq('id', id).select().single()
  if (error) return res.json(fail(`更新焦点图失败：${error.message}`, 500))
  if (!data) return res.json(fail('焦点图不存在'))
  res.json(ok(toHeroApi(data)))
})

// 删除焦点图（同时尽力清理存储中的图片对象）
app.delete('/api/hero/:id', async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)

  const { data: existing, error: e1 } = await supabase.from(HERO_TABLE).select('*').eq('id', id).single()
  if (e1 || !existing) return res.json(fail('焦点图不存在'))

  const { error } = await supabase.from(HERO_TABLE).delete().eq('id', id)
  if (error) return res.json(fail(`删除焦点图失败：${error.message}`, 500))

  const storagePath = extractStoragePath(existing.image_url)
  if (storagePath) {
    try {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
    } catch {
      // 清理失败不影响删除结果
    }
  }
  res.json(ok(toHeroApi(existing)))
})

// 图片上传（multipart/form-data，字段名 file）：存入 Supabase Storage 并回写 image_url
const heroUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('只能上传图片文件'))
  }
})

app.post('/api/hero/:id/image', heroUpload.single('file'), async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)
  if (!req.file) return res.json(fail('请选择要上传的图片文件'))

  const { data: existing, error: e1 } = await supabase.from(HERO_TABLE).select('*').eq('id', id).single()
  if (e1 || !existing) return res.json(fail('焦点图不存在'))

  try {
    await ensureHeroBucket()
  } catch (err) {
    return res.json(fail(`初始化存储桶失败：${err.message}`, 500))
  }

  const ext =
    (String(req.file.originalname).split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') ||
    'png'
  const objectPath = `hero-${id}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(objectPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false })
  if (upErr) return res.json(fail(`图片上传失败：${upErr.message}`, 500))

  const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectPath)
  const publicUrl = pub?.publicUrl || ''

  const { data, error } = await supabase
    .from(HERO_TABLE)
    .update({ image_url: publicUrl })
    .eq('id', id)
    .select()
    .single()
  if (error) return res.json(fail(`保存图片地址失败：${error.message}`, 500))

  // 替换旧图时尽力清理旧对象（失败不影响结果）
  const oldPath = extractStoragePath(existing.image_url)
  if (oldPath && oldPath !== objectPath) {
    try {
      await supabase.storage.from(BUCKET_NAME).remove([oldPath])
    } catch {
      // 清理失败不影响结果
    }
  }
  res.json(ok(toHeroApi(data)))
})

// ----------------- 产品管理（Supabase：products 表 + editor-images 存储桶） -----------------

// 列表（后台管理）：关键词搜索 + 分类 / 启用状态过滤
app.get('/api/product/list', async (req, res) => {
  if (!requireSupabase(res)) return
  const { keyword = '', category, enabled } = req.query

  let query = supabase.from(PRODUCT_TABLE).select('*').order('sort_order').order('id')
  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,sub_title.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (enabled !== undefined && enabled !== '' && enabled !== 'all') {
    query = query.eq('enabled', enabled === 'true' || enabled === '1')
  }

  const { data, error } = await query
  if (error) return res.json(fail(`读取产品列表失败：${error.message}`, 500))
  res.json(ok((data || []).map(toProductApi)))
})

// 前台站点使用：启用中的产品，按 sort_order 升序
app.get('/api/product/active', async (_req, res) => {
  if (!requireSupabase(res)) return
  const { data, error } = await supabase
    .from(PRODUCT_TABLE)
    .select('*')
    .eq('enabled', true)
    .order('sort_order')
    .order('id')
  if (error) return res.json(fail(`读取产品列表失败：${error.message}`, 500))
  res.json(ok((data || []).map(toProductApi)))
})

// 产品详情（后台「正本编辑」页使用）
app.get('/api/product/:id', async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)
  const { data, error } = await supabase.from(PRODUCT_TABLE).select('*').eq('id', id).single()
  if (error || !data) return res.json(fail('产品不存在'))
  res.json(ok(toProductApi(data)))
})

// 新增产品
app.post('/api/product', async (req, res) => {
  if (!requireSupabase(res)) return
  const body = req.body || {}
  if (!body.name || !String(body.name).trim()) return res.json(fail('产品名称不能为空'))

  const row = toProductRow(body)
  const { data, error } = await supabase.from(PRODUCT_TABLE).insert(row).select().single()
  if (error) return res.json(fail(`新增产品失败：${error.message}`, 500))
  res.json(ok(toProductApi(data)))
})

// 更新产品（支持任意字段的局部更新）
app.put('/api/product/:id', async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)
  const row = toProductRow(req.body || {})
  if (!Object.keys(row).length) return res.json(fail('没有需要更新的字段'))

  const { data, error } = await supabase.from(PRODUCT_TABLE).update(row).eq('id', id).select().single()
  if (error) return res.json(fail(`更新产品失败：${error.message}`, 500))
  if (!data) return res.json(fail('产品不存在'))
  res.json(ok(toProductApi(data)))
})

// 删除产品
app.delete('/api/product/:id', async (req, res) => {
  if (!requireSupabase(res)) return
  const id = Number(req.params.id)

  const { data: existing, error: e1 } = await supabase.from(PRODUCT_TABLE).select('*').eq('id', id).single()
  if (e1 || !existing) return res.json(fail('产品不存在'))

  const { error } = await supabase.from(PRODUCT_TABLE).delete().eq('id', id)
  if (error) return res.json(fail(`删除产品失败：${error.message}`, 500))

  // 尽力清理正文中引用的本桶图片（解析 content 里的 URL 逐个删除，失败不影响结果）
  const urls = String(existing.content || '').match(
    new RegExp(String.raw`https:\/\/[^"'()\s]+\/storage\/v1\/object\/public\/${EDITOR_BUCKET}\/[^"'()\s]+`, 'g')
  )
  const paths = [...new Set((urls || []).map((u) => extractStoragePath(u, EDITOR_BUCKET)).filter(Boolean))]
  if (paths.length) {
    try {
      await supabase.storage.from(EDITOR_BUCKET).remove(paths)
    } catch {
      // 清理失败不影响删除结果
    }
  }
  res.json(ok(toProductApi(existing)))
})

// 富文本编辑器图片上传（multipart/form-data，字段名 file）
// 存入公开桶 editor-images，返回 { url, alt, href } 供 WangEditor 插图
const editorUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('只能上传图片文件'))
  }
})

app.post('/api/common/upload/wangeditor', editorUpload.single('file'), async (req, res) => {
  if (!requireSupabase(res)) return
  if (!req.file) return res.json(fail('请选择要上传的图片文件'))

  try {
    await ensureEditorBucket()
  } catch (err) {
    return res.json(fail(`初始化存储桶失败：${err.message}`, 500))
  }

  const ext =
    (String(req.file.originalname).split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') ||
    'png'
  const objectPath = `editor-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`

  const { error: upErr } = await supabase.storage
    .from(EDITOR_BUCKET)
    .upload(objectPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false })
  if (upErr) return res.json(fail(`图片上传失败：${upErr.message}`, 500))

  const { data: pub } = supabase.storage.from(EDITOR_BUCKET).getPublicUrl(objectPath)
  const publicUrl = pub?.publicUrl || ''
  res.json(ok({ url: publicUrl, alt: req.file.originalname || '', href: '' }))
})

// ----------------- 根路径 -----------------
app.get('/', (_req, res) => {
  res.json({ service: 'back-end-mock', port: PORT, endpoints: ['/api/dashboard/visits', '/api/access-logs', '/api/access-log', '/api/brand/list', '/api/brand/active', '/api/users', '/api/contact', '/api/contact/list'] })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ back-end-mock listening on http://localhost:${PORT}`)
})
