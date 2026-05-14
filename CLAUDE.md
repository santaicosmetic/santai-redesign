# Santai Cosmetics 网站改版项目

> 这份文件会被 Claude Code 在每次开启 session 时自动读取。先读完这份再开始动手。

## 项目概览

这是 **Santai Cosmetics**（来自马来西亚吉隆坡的磁性假睫毛品牌）官方网站 `santai-cosmetics.com` 的改版项目。

- **品牌定位：** 编辑级奢华、不费力的美（editorial-luxury, effortless beauty）
- **目标受众：** 现代东南亚女性，20–40 岁，美妆好奇但时间紧张
- **项目目标：** 用静态 HTML/CSS/JS 做出完整的网站原型，之后再移植到 Shopify Liquid 主题
- **两个核心承诺：**
  1. *"The right lash for YOUR eye."* —— 解决选择困难
  2. *"Easier than mascara."* —— 解决新手不敢用的顾虑

每一个页面都至少要服务这两个承诺中的一个。

---

## 文件夹结构

```
santai-redesign/
├── CLAUDE.md                            ← 你正在读的文件
├── HANDOFF.md                           ← Jeffery 给 Riri 的交接说明
├── html-build/                          ← 实际的 HTML 原型（主要工作区）★
├── santai-cosmetics-design-system/      ← 设计系统参考（品牌简报、组件预览、UI 包）
├── Lash Guide/                          ← 睫毛风格参考图片
├── Santai Logo 2.png                    ← Logo
├── font-preview*.html                   ← 字体选型预览
└── .claude/agents/                      ← 项目专用 sub-agents（详见末尾）
```

> ⚠️ `santai-cosmetics-design-system/` 是**参考资料**，不是当前实作。实际页面在 `html-build/`，且视觉系统已经偏离了原始品牌简报（见下）。

---

## ⚠️ 视觉系统 —— Direction C（重要！）

实作的 HTML（`html-build/`）**故意偏离**了原始品牌简报。这是有意的设计决策，不是 bug。

| | 原始品牌简报 | **实际 Direction C** |
|---|---|---|
| 背景 | `--santai-cream` 奶油色（禁用纯白） | **`#FFFFFF` 纯白** |
| 强调色 | `--santai-rosewood` 玫瑰木 | **`#B8957B` 暖裸** |
| 卡片 / 图片面 | `--santai-stone` 米石色 | `#F7F7F7` 浅灰 |
| 次级背景 | `--santai-bone` 骨色 | `#FAFAFA` 米白 |
| 墨色 | `--santai-ink` 暗紫黑 | `#0A0A0A` 近黑 |
| Display 字体 | Tenor Sans | **Newsreader**（编辑感衬线，weight 300） |
| Body 字体 | DM Sans（Söhne 替代品） | **Manrope** |
| 斜体装饰 | Cormorant Garamond Italic | **Newsreader Italic**（同字族） |

参考方向：Augustinus Bader、Vogue editorial、现代单色奢华。

**所有新组件、所有新 section、所有改动，都遵循 Direction C。** 不要用原始品牌简报的色票或字体。

---

## 🚨 设计铁律 —— 移动优先（绝对不可妥协）

每一个新组件、每一次编辑都必须**先为 360px 设计**，再用 `min-width` 媒体查询往上加大屏样式。

- **触摸目标 ≥ 44×44px** —— 禁止 32px / 36px 按钮
- **垂直 padding** —— 移动端 section 从 `--space-7`（48px）起步，到 `≥ 1024px` 才升到 `--space-9 / --space-10`
- **栅格** —— 默认 1 栏；`≥ 720px` 可 2 栏；`≥ 1024px` 才考虑 3+ 栏
- **固定元素** —— 必须用 `env(safe-area-inset-bottom)` 处理 iOS Home indicator
- **字号** —— Display 用 `clamp()` 缩放；body 最小 16px
- **顺序** —— 先写移动端默认规则，再叠 `@media (min-width: ...)`；**永远不要反过来**

> 如果某个 section 在 360px 下放不下，**重新设计这个 section**，不要靠水平滚动绕过。

---

## 保留自原始品牌简报的规则

- **不要全大写 display 标题** —— 用句首大写。全大写只保留给 eyebrows（section 小标、导航、按钮标签），tracking +0.18em
- **每页最多一个斜体装饰字** —— 用 `<span class="display-italic">…</span>` 包裹单个英文字。绝不整句斜体
- **不用 emoji** —— 文案、卡片、toast 一律禁止。Unicode 字形（◆ ★ ✓ →）可以，但要节制
- **不用 Inter / Roboto / Helvetica** —— 已选定 Newsreader + Manrope
- **诚实，不推销** —— *"On its way back. Get notified."*，绝不是 *"Don't miss out!"*

---

## 当前状态

### 已完成的页面（`html-build/`）

| 文件 | 用途 |
|---|---|
| `index.html` | 首页 |
| `product.html` | 产品详情页（PDP，以 Pitch 款为例） |
| `how-to-apply.html` | 使用教学页 |
| `cart.html` | 购物车页 |
| `collection.html` | 产品列表页 |
| `faq.html` | 常见问题页 |
| `search.html` | 搜索页 |
| `404.html` | 错误页 |

### 已实现的互动功能

- **购物车抽屉** —— 点 header 购物车图标或任何 "Add to bag" 按钮。免运费 nudge 会随小计更新；加入时跳 toast
- **Lash Finder 模态框** —— 任何 "Find my lash" 都可触发。4 步问答 → 结果。可直接从结果加入购物车
- **移动端导航** —— `< 960px` 显示汉堡菜单
- **PDP 变体选择器** —— 切换 SKU
- **三个手风琴**（规格、运送、保养）—— 独立开合

### 故意还没接通的部分

| 项目 | 现状 | 之后要做 |
|---|---|---|
| 产品照片 | CSS-only 占位符 | 接入真实微距摄影 |
| 首页 Hero 图 | CSS 抽象眼睛构图 | 替换成 `<img class="hero__photo">`（CSS 规则已存在） |
| Lash Finder 推荐逻辑 | 永远推荐 Inbox | 建立 (眼形 · 密度 · 场合) → 8 款睫毛 的映射表 |
| 评论数据 | 首页三条评论写死 | 接 Judge.me / Loox / Yotpo |
| Search / Account / Wishlist | 仅装饰 | 接 Shopify 功能 |
| Checkout 按钮 | 仅装饰，到 cart drawer 就停 | 接 Shopify checkout |
| 电子报订阅 | 表单提交禁用 | 接后端 |
| FAQ / Contact 页 | 导航是 `href="#"` | 等文案到位后补 |

---

## 关键文件

| 路径 | 用途 |
|---|---|
| `html-build/README.md` | **视觉系统、Liquid 移植指南、已知缺口 —— 必读** |
| `html-build/assets/styles.css` | 单一的 CSS 主文件（所有页面共用） |
| `html-build/assets/theme.js` | 购物车、Lash Finder、移动导航、手风琴 的 vanilla JS（in-memory cart） |
| `html-build/assets/eye-shapes/` | 6 个眼形 SVG（almond、hooded、monolid、round、upturned、downturned）—— **品牌专属插画，不要替换** |
| `santai-cosmetics-design-system/project/brand-brief.md` | 原始品牌简报 v1.0（参考用） |
| `santai-cosmetics-design-system/project/colors_and_type.css` | 原始品牌的 CSS 变量（**Direction C 没有用这里的变量**，仅作参考） |

---

## 本地预览

直接在浏览器开 HTML 即可，无需 build：

```
file:///<repo-path>/html-build/index.html
```

推荐起本地 server（避免 CORS）：

```powershell
cd html-build
python -m http.server 8000
# 浏览器开 http://localhost:8000
```

---

## Git 工作流

```powershell
git pull            # 上工前先拉一下最新
# ...编辑文件...
git add .
git commit -m "描述你做了什么"
git push            # 推上去
```

repo 内本地 git 身份已经设为：
- `user.name = "Riri"`
- `user.email = "284523824+santaicosmetic@users.noreply.github.com"`

如果在另一台机器克隆，记得再设一次（HANDOFF.md 里有指令）。

---

## 可用的 Sub-agents（`.claude/agents/`）

通过 `Agent` 工具调用：

| Agent | 用途 |
|---|---|
| `design-brand-guardian` | 对照品牌简报审核新 section |
| `engineering-frontend-developer` | 像素级 HTML/CSS 编辑 |
| `engineering-cms-developer` | Shopify Liquid 移植 |
| `engineering-code-reviewer` | 移交前审查 |
| `design-inclusive-visuals-specialist` | WCAG 无障碍审查（focus、alt、对比度） |
| `engineering-technical-writer` | 最终移交文档 |

---

## Shopify Liquid 移植（之后的工作）

`html-build/README.md` 里有完整的 HTML → Liquid 对应表，包括：
- `index.html` → `templates/index.liquid`（建议拆成 7 个 sections 让 merchandiser 可重排）
- `product.html` → `templates/product.liquid` + `sections/product.liquid`
- 购物车的 in-memory 逻辑要改成 Shopify `/cart.js` + `/cart/add.js` 的 Ajax API
- CSS 变量保留，Liquid 不动它们

现在还在 HTML 原型阶段，**暂时不做 Liquid 移植**，等所有页面定型再说。
