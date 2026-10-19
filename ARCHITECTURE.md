# Miuda V1.0 Demo 架构

## 1. 技术选择

当前 Demo 使用构建零依赖的静态前端：

- HTML：页面语义和各页面状态的结构；
- CSS：基于 `design.md` 的视觉 Token、响应式布局和组件样式；
- JavaScript：页面导航、Mock 状态与后续本地数据交互；
- 浏览器 `localStorage`：V1.0 的持久化数据层；
- Mock AI Service：模拟衣物识别、搭配和试衣的异步返回。

选择原因：无需构建环境，适合快速演示和低成本迭代；后续可以在不改变产品模型的情况下迁移至 React 或服务端架构。

## 2. 目标目录结构

```text
Miuda/
├── PRD.md
├── design.md
├── ARCHITECTURE.md
├── STATUS.md
├── index.html                 # 应用入口
├── styles.css                 # 全局 Token、布局和组件样式
├── script.js                  # 应用启动与页面组合
├── src/
│   ├── data/
│   │   ├── seed.js            # 预置衣物和搭配数据
│   │   └── storage.js         # localStorage 读写
│   ├── services/
│   │   └── ai.js              # 可替换的 Mock AI Service
│   ├── screens/
│   │   ├── home.js
│   │   ├── wardrobe.js
│   │   ├── add-clothing.js
│   │   ├── detail.js
│   │   ├── stylist.js
│   │   └── try-on.js
│   └── ui/
│       ├── components.js      # 卡片、标签、导航等可复用 UI
│       └── icons.js
└── assets/
    └── design-concepts/       # 已生成的视觉参考稿
```

> `src/` 为下一功能切片开始时的拆分目标。当前静态原型暂保留在根目录，避免在尚未加入数据行为前进行无关重构。

## 3. 核心数据模型

```ts
type ClothingItem = {
  id: string
  name: string
  imageUrl: string
  category: 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'bag' | 'accessory'
  color: string
  styles: string[]
  seasons: string[]
  occasions: string[]
  material?: string
  brand?: string
  note?: string
  createdAt: string
}

type Outfit = {
  id: string
  itemIds: string[]
  title: string
  occasion: string
  weather?: string
  reason: string
  detailReason?: string
}

type TryOnResult = {
  id: string
  personImageUrl: string
  itemIds: string[]
  status: 'selecting' | 'generating' | 'success' | 'failed'
  resultImageUrl?: string
}
```

## 4. 数据流

```text
预置数据 / localStorage
        ↓
    Storage 模块
        ↓
Screen 页面状态 ←→ UI 组件
        ↓
  Mock AI Service
        ↓
更新 Storage → 重新渲染首页 / 衣橱 / 详情
```

## 5. 模块边界

| 模块 | 职责 | 不负责 |
|---|---|---|
| `screens` | 页面渲染、用户操作编排 | 保存数据、AI 规则实现 |
| `ui` | 可复用的展示组件 | 业务状态和路由判断 |
| `data/storage` | 预置数据、本地读写、数据重置 | 页面 DOM 操作 |
| `services/ai` | Mock 识别、搭配、试衣接口 | 直接操作 UI 或 localStorage |
| `styles.css` | Token、通用组件和页面布局 | 业务逻辑 |

## 6. AI 服务替换边界

页面只能调用以下服务接口，不直接嵌入 AI 逻辑：

```ts
analyzeClothing(image): Promise<Partial<ClothingItem>>
generateOutfit(input, wardrobe): Promise<Outfit>
generateTryOn(input): Promise<TryOnResult>
```

V1.0 中，这些接口返回预置或规则化 Mock 结果。未来接入真实 API 时必须通过服务端代理，禁止在浏览器中保存 API Key。

## 7. 安全与隐私边界

- V1.0 不上传用户图片到外部服务；
- 本地图片仅在浏览器预览或本地存储中使用；
- 不收集账户信息、位置、支付或医疗等敏感数据；
- 如后续加入登录和云端同步，需要先增加服务端鉴权、上传权限校验和隐私说明。
