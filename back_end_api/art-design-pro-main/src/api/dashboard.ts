import request from '@/utils/http'

/**
 * 访问记录条目
 */
export interface AccessLogItem {
  /** 唯一 ID（时间戳） */
  id: number
  /** 访问 IP */
  ip: string
  /** 访问地区（IP 归属地） */
  region: string
  /** 访问时间 ISO 字符串 */
  time: string
  /** 访问路径 */
  path?: string
  /** User Agent */
  userAgent?: string
}

/**
 * 折线图数据响应
 */
export interface VisitChartResponse {
  /** 日期标签（YYYY-MM-DD） */
  dates: string[]
  /** 对应日期的访问次数 */
  values: number[]
}

/**
 * 访问记录分页响应
 */
export interface AccessLogListResponse {
  list: AccessLogItem[]
  total: number
}

/**
 * 折线图查询参数
 */
export interface VisitChartParams {
  days?: number
}

/**
 * 访问记录查询参数
 */
export interface AccessLogQuery {
  page?: number
  pageSize?: number
  ip?: string
  region?: string
}

/**
 * 上报访问记录参数
 */
export interface ReportAccessParams {
  ip?: string
  region?: string
  path?: string
  userAgent?: string
}

/**
 * 折线图
 */
export function fetchVisitChart(params: VisitChartParams = {}) {
  return request.get<VisitChartResponse>({
    url: '/api/dashboard/visits',
    params
  })
}

/**
 * 访问详情列表
 */
export function fetchAccessLogs(params: AccessLogQuery = {}) {
  return request.get<AccessLogListResponse>({
    url: '/api/access-logs',
    params
  })
}

/**
 * 清空访问记录
 */
export function clearAccessLogs() {
  return request.del<{ ok: true }>({
    url: '/api/access-logs',
    showSuccessMessage: false
  })
}

/**
 * 上报一条访问记录（由 front_end 调用）
 */
export function reportAccessLog(data: ReportAccessParams) {
  return request.post<{ ok: true }>({
    url: '/api/access-log',
    data,
    showSuccessMessage: false,
    showErrorMessage: false
  })
}
