/**
 * 门户（portal）共享数据
 *
 * 目前 mock 数据集中在 store 里，让「产品管理」「帮助文档管理」等页面
 * 共享同一份产品列表，避免各自维护重复数据。
 *
 * 真实环境下这里应替换为后端接口调用。
 *
 * @module store/modules/portal
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface PortalProduct {
  id: number
  name: string
  subTitle: string
  category: string
  summary: string
  /** 产品正本内容（HTML 字符串） */
  content: string
}

export const PRODUCT_CATEGORY_OPTIONS = [
  { value: '教育', label: '教育' },
  { value: '建站', label: '建站' },
  { value: '管理', label: '管理' },
  { value: '其它', label: '其它' }
]

const INITIAL_PRODUCTS: PortalProduct[] = [
  {
    id: 1,
    name: '智慧校园管理平台',
    subTitle: '校上一体化数字管理',
    category: '教育',
    summary: '覆盖教学、学工、办公全场景的智慧校园一体化平台...',
    content:
      '<h2>产品介绍</h2><p>面向您的全场景业务的一体化平台。</p><p>覆盖教学、学工、办公全场景。</p><h3>核心功能</h3><ul><li>智能排课</li><li>在线考务</li><li>成绩分析</li></ul>'
  },
  {
    id: 2,
    name: '企业官网定制',
    subTitle: '高端定制企业官网',
    category: '建站',
    summary: '为企业量身打造品牌官网，响应式设计 + 私域运营...',
    content:
      '<h2>服务介绍</h2><p>为企业量身打造品牌官网，响应式设计 + 私域运营。</p>'
  },
  {
    id: 3,
    name: '教务管理系统',
    subTitle: '排课 / 考务 / 成绩',
    category: '教育',
    summary: '教务核心系统，支持智能排课、在线考务与成绩分析...',
    content:
      '<h2>系统简介</h2><p>教务核心系统，支持智能排课、在线考务与成绩分析。</p>'
  }
]

export const usePortalStore = defineStore('portalStore', () => {
  /** 产品列表 */
  const products = ref<PortalProduct[]>(INITIAL_PRODUCTS)

  /** 用后端返回的产品列表覆盖本地 mock（产品管理页加载后调用） */
  const setProducts = (list: PortalProduct[]) => {
    if (Array.isArray(list)) products.value = list
  }

  /** 产品下拉选项：供「帮助文档管理」等产品名称字段选择 */
  const productOptions = computed(() =>
    products.value.map((p) => ({ value: p.name, label: p.name }))
  )

  /** 按名称查找产品 */
  const getProductByName = (name: string) => products.value.find((p) => p.name === name)

  /** 按 id 查找产品 */
  const getProductById = (id: number) => products.value.find((p) => p.id === id)

  /** 生成下一个可用 id */
  const nextProductId = () => Math.max(0, ...products.value.map((p) => p.id)) + 1

  return { products, productOptions, getProductByName, getProductById, nextProductId, setProducts }
})