<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Refresh } from '@element-plus/icons-vue'
import { fetchVisitChart, fetchAccessLogs, clearAccessLogs, type AccessLogItem } from '@/api/dashboard'

defineOptions({ name: 'Console' })

const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)
const loading = ref(false)
const logs = ref<AccessLogItem[]>([])
const total = ref(0)

const formatTime = (s: string) => {
  if (!s) return ''
  return s.replace('T', ' ').slice(0, 19)
}

const renderChart = (dates: string[], values: number[]) => {
  if (!chartRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value, 'light', { renderer: 'canvas' })
  }
  chartInstance.value.setOption({
    grid: { left: 50, right: 30, top: 50, bottom: 40 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#409eff' },
        itemStyle: { color: '#409eff', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.35)' },
            { offset: 1, color: 'rgba(64,158,255,0.02)' }
          ])
        }
      }
    ]
  })
}

const onResize = () => chartInstance.value?.resize()

const loadChart = async () => {
  try {
    const res = await fetchVisitChart()
    const dates = res.dates || []
    const values = res.values || []
    renderChart(dates, values)
  } catch (e: any) {
    ElMessage.error('加载访问量图表失败：' + (e?.message || '未知错误'))
  }
}

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await fetchAccessLogs({ page: 1, pageSize: 50 })
    logs.value = res.list || []
    total.value = res.total || 0
  } catch (e: any) {
    ElMessage.error('加载访问详情失败：' + (e?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await Promise.all([loadChart(), loadLogs()])
  ElMessage.success('已刷新')
}

const onClear = async () => {
  await ElMessageBox.confirm('确定清空所有访问记录？此操作不可恢复。', '提示', {
    type: 'warning'
  })
  await clearAccessLogs()
  ElMessage.success('已清空')
  await refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<template>
  <div class="space-y-4">
    <!-- 顶部统计卡片 -->
    <ElRow :gutter="16">
      <ElCol :sm="12" :md="6">
        <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div class="stat-label">今日访问</div>
          <div class="stat-value">{{ logs.filter(l => l.time?.startsWith(new Date().toISOString().slice(0,10))).length }}</div>
          <div class="stat-icon">
            <el-icon :size="32"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/><path d="M11 7h2v6h-2zm0 8h2v2h-2z"/></svg></el-icon>
          </div>
        </div>
      </ElCol>
      <ElCol :sm="12" :md="6">
        <div class="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div class="stat-label">总访问数</div>
          <div class="stat-value">{{ total }}</div>
          <div class="stat-icon">
            <el-icon :size="32"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg></el-icon>
          </div>
        </div>
      </ElCol>
      <ElCol :sm="12" :md="6">
        <div class="stat-card bg-gradient-to-br from-amber-500 to-amber-600">
          <div class="stat-label">独立 IP</div>
          <div class="stat-value">{{ new Set(logs.map(l => l.ip)).size }}</div>
          <div class="stat-icon">
            <el-icon :size="32"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg></el-icon>
          </div>
        </div>
      </ElCol>
      <ElCol :sm="12" :md="6">
        <div class="stat-card bg-gradient-to-br from-violet-500 to-violet-600">
          <div class="stat-label">覆盖地区</div>
          <div class="stat-value">{{ new Set(logs.map(l => l.region)).size }}</div>
          <div class="stat-icon">
            <el-icon :size="32"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></el-icon>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 折线图 -->
    <ElCard shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold">访问量趋势（最近 7 天）</span>
          <ElButton :icon="Refresh" size="small" @click="loadChart">刷新图表</ElButton>
        </div>
      </template>
      <div ref="chartRef" style="width: 100%; height: 360px"></div>
    </ElCard>

    <!-- 访问详情表格 -->
    <ElCard shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold">访问详情（IP / 地区 / 时间）</span>
          <div class="flex gap-2">
            <ElButton :icon="Refresh" size="small" @click="loadLogs">刷新</ElButton>
            <ElButton :icon="Delete" size="small" type="danger" plain @click="onClear">清空</ElButton>
          </div>
        </div>
      </template>
      <ElTable
        v-loading="loading"
        :data="logs"
        border
        stripe
        row-key="id"
        style="width: 100%"
      >
        <ElTableColumn type="index" width="60" align="center" label="#" />
        <ElTableColumn prop="ip" label="访问 IP" min-width="160">
          <template #default="{ row }">
            <ElTag size="small">{{ row.ip }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="region" label="访问地区" min-width="160">
          <template #default="{ row }">
            <span class="inline-flex items-center gap-1">
              <el-icon color="#67c23a"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></el-icon>
              {{ row.region }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="time" label="访问时间" min-width="180">
          <template #default="{ row }">{{ formatTime(row.time) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="path" label="访问路径" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="userAgent" label="User Agent" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs text-gray-500">{{ row.userAgent }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  border-radius: 12px;
  padding: 20px 24px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
.stat-label {
  font-size: 13px;
  opacity: 0.9;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-top: 6px;
  line-height: 1.2;
}
.stat-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
}
.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
