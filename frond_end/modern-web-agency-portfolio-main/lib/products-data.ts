// 产品中心数据

export interface ProductFeature {
  title: string;
  description: string;
}

export interface ProductScenario {
  title: string;
  description: string;
}

export interface ProductStat {
  value: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  // 主题强调色（完整 Tailwind 类名，供 JIT 识别）
  accent: {
    gradient: string; // 渐变背景
    soft: string; // 浅色底
    text: string; // 文字色
    ring: string; // 边框/光晕
    chip: string; // 标签底色
  };
  highlights: string[]; // 卖点清单
  features: ProductFeature[]; // 核心能力
  scenarios: ProductScenario[]; // 应用场景
  stats: ProductStat[]; // 产品数据
}

export const products: Product[] = [
  {
    id: 'academic',
    name: '教务系统',
    tagline: '学籍 · 选课 · 成绩一体化管理平台',
    description:
      '覆盖学生从入学到毕业的全生命周期教务管理，打通学籍、培养方案、排课选课、成绩考核等核心环节，让教务工作从"人工跑表"走向"数据跑路"。',
    icon: 'GraduationCap',
    accent: {
      gradient: 'from-blue-500 via-indigo-500 to-violet-600',
      soft: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/30',
      chip: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    highlights: [
      '学籍异动全流程线上审批',
      '三轮选课智能检测冲突与容量',
      '成绩录入、复核、绩点自动计算',
      '培养方案达成度实时分析',
    ],
    features: [
      {
        title: '学籍管理',
        description: '新生注册、信息变更、休学复学、毕业审核全流程线上化，状态自动同步至各业务模块。',
      },
      {
        title: '智能排课选课',
        description: '基于教师、教室、时间三维冲突检测，支持初选、正选、退补选多阶段并发选课。',
      },
      {
        title: '成绩与绩点',
        description: '支持平时分、期末分多权重合成，自动核算学分绩点，在线复核全程留痕。',
      },
      {
        title: '培养方案',
        description: '按专业维护课程体系与毕业要求，自动比对修读进度，学业预警一目了然。',
      },
      {
        title: '考务管理',
        description: '考试安排、考场分配、监考排程自动生成，学生凭二维码签到入场。',
      },
      {
        title: '数据看板',
        description: '选课热度、学分分布、挂科率等多维度统计图表，为教学决策提供数据支撑。',
      },
    ],
    scenarios: [
      {
        title: '高校教务处',
        description: '统一管理全校学籍与教学运行，减少 70% 线下表格流转。',
      },
      {
        title: '二级学院',
        description: '院级排课、成绩审核与学业预警在一个平台内完成。',
      },
      {
        title: '师生自助服务',
        description: '学生在线选课查成绩，教师移动端录成绩，随时随地办理。',
      },
    ],
    stats: [
      { value: '99.9%', label: '选课高峰可用性' },
      { value: '3 轮', label: '并发选课零超卖' },
      { value: '70%', label: '线下流程减少' },
    ],
  },
  {
    id: 'files',
    name: '文件管理系统',
    tagline: '安全、高效的校园云盘与协作空间',
    description:
      '面向高校与企业团队的文件存储与协作平台，支持大文件断点续传、多级权限管控与全文检索，让每一份课件、资料、合同都找得到、管得住、不丢失。',
    icon: 'FolderOpen',
    accent: {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      soft: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500/30',
      chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    },
    highlights: [
      '单文件 2GB 断点续传',
      '外链分享支持密码与有效期',
      '权限继承 + 操作日志审计',
      '文件名与正文全文检索',
    ],
    features: [
      {
        title: '极速传输',
        description: '分片上传与断点续传，弱网环境不中断；文件夹批量下载自动打包。',
      },
      {
        title: '精细权限',
        description: '所有者、编辑者、查看者三级角色，支持文件夹继承与成员单独授权。',
      },
      {
        title: '安全外链',
        description: '分享链接可设访问范围、提取密码、有效期，并可一键禁止下载。',
      },
      {
        title: '全文检索',
        description: '不仅搜文件名，还能检索 Word、PDF 正文内容，支持标签组合筛选。',
      },
      {
        title: '版本历史',
        description: '自动保留最近 50 个历史版本，误删误改随时回滚，回收站 30 天兜底。',
      },
      {
        title: '审计日志',
        description: '上传、下载、分享、删除等操作全程记录，满足等保合规与追溯要求。',
      },
    ],
    scenarios: [
      {
        title: '教研室协作',
        description: '课件、试卷集中存储，按教研组授权，新老师入职即可继承资料。',
      },
      {
        title: '行政归档',
        description: '合同、公文按目录归档，操作可追溯，到期文件自动提醒。',
      },
      {
        title: '大文件交换',
        description: '实验数据、视频素材免 U 盘传递，外链发给校外合作方也安全。',
      },
    ],
    stats: [
      { value: '2GB', label: '单文件上限' },
      { value: '50 版', label: '历史版本回溯' },
      { value: '30 天', label: '回收站兜底' },
    ],
  },
  {
    id: 'lab',
    name: '实验室预约系统',
    tagline: '让每一间实验室、每一台设备高效运转',
    description:
      '以可视化时间轴管理实验室与仪器设备的预约、审批、签到与使用登记，叠加安全培训与危化品管控，实现"开放共享"与"安全底线"的双赢。',
    icon: 'FlaskConical',
    accent: {
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      soft: 'bg-violet-500/10',
      text: 'text-violet-600 dark:text-violet-400',
      ring: 'ring-violet-500/30',
      chip: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    },
    highlights: [
      '时间轴可视化预约与审批',
      '二维码签到，杜绝代预约',
      '安全培训未通过自动拦截',
      '设备故障一键上报闭环',
    ],
    features: [
      {
        title: '可视化预约',
        description: '实验室与设备占用情况时间轴直览，绿色可约、灰色占用，提前 14 天开放。',
      },
      {
        title: '在线审批',
        description: '预约提交后管理员手机端即可审批，通过后生成签到二维码。',
      },
      {
        title: '安全准入',
        description: '培训视频 + 在线测验 + 责任书电子签署，未达标人员刷卡无法进入。',
      },
      {
        title: '设备台账',
        description: '仪器档案、使用机时、维保记录电子化，扫码即可查看设备状态。',
      },
      {
        title: '危化品管理',
        description: '危化品申领、领用、归还全程登记，用量台账自动汇总。',
      },
      {
        title: '信用机制',
        description: '爽约自动记录并扣分，信用分影响预约优先级，提升资源利用率。',
      },
    ],
    scenarios: [
      {
        title: '公共实验平台',
        description: '大型仪器面向全校共享，机时统计自动生成，开放率提升明显。',
      },
      {
        title: '院系实验室',
        description: '本科实验课与学生科创预约分流，减少管理员排表负担。',
      },
      {
        title: '安全管理部门',
        description: '准入培训、危化品台账集中监管，随时应对安全检查。',
      },
    ],
    stats: [
      { value: '14 天', label: '提前开放预约' },
      { value: '100%', label: '安全准入拦截' },
      { value: '2 小时', label: '取消免审批时限' },
    ],
  },
  {
    id: 'internship',
    name: '实习管理系统',
    tagline: '实习全过程数字化，校企协同不掉线',
    description:
      '从实习申请、单位审核、协议签署，到周志批阅、企业鉴定、成绩评定，实习管理的每一个环节都在线留痕，学校、学生、企业三方实时协同。',
    icon: 'Briefcase',
    accent: {
      gradient: 'from-orange-500 via-amber-500 to-yellow-600',
      soft: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      ring: 'ring-orange-500/30',
      chip: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    },
    highlights: [
      '企业资质自动校验',
      '三方协议在线签署归档',
      '周志定时提醒、在线批阅',
      '校企双导师成绩联合评定',
    ],
    features: [
      {
        title: '实习申请',
        description: '单位信息、岗位、起止时间在线填报，对接企业库自动校验资质。',
      },
      {
        title: '协议管理',
        description: '三方协议模板下载、扫描上传、学院审核，电子档案永久保存。',
      },
      {
        title: '周志与考勤',
        description: '每周定时推送提醒，学生提交周志与定位打卡，教师移动批阅。',
      },
      {
        title: '企业鉴定',
        description: '企业导师在线填写鉴定意见与评分，无需纸质表格来回邮寄。',
      },
      {
        title: '成绩评定',
        description: '周志、报告、企业鉴定按权重自动合成五级制成绩并归档。',
      },
      {
        title: '安全跟踪',
        description: '实习地点地图分布可视化，异常情况一键联系学生与紧急联系人。',
      },
    ],
    scenarios: [
      {
        title: '就业指导中心',
        description: '全校实习数据集中看板，实习去向、专业对口率实时掌握。',
      },
      {
        title: '校内指导教师',
        description: '周志批阅、报告指导线上完成，所带学生进度一屏掌握。',
      },
      {
        title: '实习企业',
        description: '企业导师免注册参与鉴定，反馈渠道规范高效。',
      },
    ],
    stats: [
      { value: '3 方', label: '校企生实时协同' },
      { value: '0 纸质', label: '鉴定表流转' },
      { value: '5 级制', label: '成绩自动合成' },
    ],
  },
];
