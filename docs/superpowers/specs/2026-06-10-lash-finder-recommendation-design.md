# Lash Finder 推荐逻辑 — 设计文档

**日期**: 2026-06-10
**目标**: 让 Lash Finder 问答真正根据用户答案推荐睫毛,取代当前永远返回 "Inbox" 的写死行为。
**范围**: `html-build/` 原型(`assets/theme.js` + 结果卡渲染)。Shopify 主题后续单独移植。

---

## 背景

`initLashFinder()`(`assets/theme.js:432`)收集了 `state.eye / look / freq / flags`,但「See my match」按钮(`data-finder-done`)只执行 `show(4)`,直接跳到 `index.html` 里写死的 Inbox 结果卡。收集的答案完全没用上。这违背品牌两大承诺之一:"The right lash for YOUR eye."

## 问答输入(已存在,不改 HTML 问答步骤)

| 维度 | 字段 | 取值 |
|---|---|---|
| 眼形 | `eye` | `monolid` · `double-lid` · `inner-double-lid` |
| 妆感 | `look` | `natural` · `office` · `soft` · `drama` |
| 频率 | `freq` | `daily` · `weekly` · `events` |
| flags(多选) | `flags[]` | `sensitive` · `contacts` · `firsttime` · `lashext` |

## 目录(10 款睫毛的可匹配属性)

| id | 名称 | group | drama | 适配眼形(eyeType) |
|---|---|---|---|---|
| inbox | Inbox | Natural | 1 | All |
| minutes | Minutes | Natural | 1 | Monolid / Inner double lid |
| kickoff | Kickoff | Natural | 2 | All |
| boardroom | Boardroom | Light makeup | 3 | All |
| pitch | Pitch | Light makeup | 3 | Monolid / Inner double lid |
| memo | Memo | Light makeup | 3 | All |
| afterhours | Afterhours | Heavy makeup | 5 | Double lid |
| twilight | Twilight | Heavy makeup | 5 | All |
| nightshift | Nightshift | Heavy makeup | 5 | Monolid / Double lid |
| vip | VIP Access | Heavy makeup | 5 | All |

**眼形可选池**(供校验):
- **monolid**: inbox, minutes, kickoff, boardroom, pitch, memo, twilight, nightshift, vip(不含 afterhours)
- **double-lid**: inbox, kickoff, boardroom, memo, afterhours, twilight, nightshift, vip(不含 minutes, pitch)
- **inner-double-lid**: inbox, minutes, kickoff, boardroom, pitch, memo, twilight, vip(不含 afterhours, nightshift)

---

## 设计决策(已与用户确认)

1. **规则表达方式 = 显式查表**。用户亲自维护每个组合 → 哪款。
2. **频率会换款**。核心表 = 眼形 × 妆感 × 频率 = **36 格**。
3. **flags 不换款,只加安心文案**。表保持 36 格不变。

---

## 1. 数据结构

放在 `theme.js`,紧邻 `LASH_STYLES` 定义之后:

```js
var LASH_FINDER_MAP = {
  'monolid': {
    'natural': { daily:'minutes',  weekly:'inbox',     events:'kickoff'   },
    'office':  { daily:'pitch',     weekly:'pitch',     events:'boardroom' },
    'soft':    { daily:'memo',      weekly:'memo',      events:'boardroom' },
    'drama':   { daily:'twilight',  weekly:'nightshift',events:'nightshift'}
  },
  'double-lid': {
    'natural': { daily:'inbox',     weekly:'inbox',     events:'kickoff'   },
    'office':  { daily:'boardroom', weekly:'boardroom', events:'memo'      },
    'soft':    { daily:'memo',      weekly:'memo',      events:'boardroom' },
    'drama':   { daily:'twilight',  weekly:'afterhours',events:'vip'       }
  },
  'inner-double-lid': {
    'natural': { daily:'minutes',   weekly:'inbox',     events:'kickoff'   },
    'office':  { daily:'pitch',     weekly:'boardroom', events:'boardroom' },
    'soft':    { daily:'memo',      weekly:'memo',      events:'boardroom' },
    'drama':   { daily:'twilight',  weekly:'twilight',  events:'vip'       }
  }
};
```

**约束**:每格的款必须在该眼形的可选池内。上面草稿已遵守。实现时附一个 dev-only 自检:遍历整表,若某格的款不在该眼形池中,`console.warn`。

### 📋 36 格草稿表(请逐格审,这是我的默认建议,你改这里)

**Monolid**

| 妆感 \ 频率 | daily | weekly | events |
|---|---|---|---|
| natural | Minutes | Inbox | Kickoff |
| office | Pitch | Pitch | Boardroom |
| soft | Memo | Memo | Boardroom |
| drama | Twilight | Nightshift | Nightshift |

**Double lid**

| 妆感 \ 频率 | daily | weekly | events |
|---|---|---|---|
| natural | Inbox | Inbox | Kickoff |
| office | Boardroom | Boardroom | Memo |
| soft | Memo | Memo | Boardroom |
| drama | Twilight | Afterhours | VIP Access |

**Inner double lid**

| 妆感 \ 频率 | daily | weekly | events |
|---|---|---|---|
| natural | Minutes | Inbox | Kickoff |
| office | Pitch | Boardroom | Boardroom |
| soft | Memo | Memo | Boardroom |
| drama | Twilight | Twilight | VIP Access |

---

## 2. 推荐理由文案(拼装,不逐组合手写)

结果卡 3 条 `<li>` 由三段拼出,只需维护约 18 条短句:

**(a) 每款一句「为什么适合你眼形」(10 句)** — 存为 `LASH_STYLES[id].finderReason`:

| id | finderReason 草稿 |
|---|---|
| inbox | Looks like nothing, reads like everything — the most natural band we make. |
| minutes | A true-to-lash simulation made for monolid and inner-double-lid eyes. |
| kickoff | Fresh, youthful lift that opens the eye without looking 'done'. |
| boardroom | Classic soft volume that never reads as too much — the safe yes. |
| pitch | A 70° high-lift arc that refuses to droop on monolid and inner-double-lid eyes. |
| memo | A sweet 7-cluster burst that makes the eye look wide and bright. |
| afterhours | A full triangle cluster built for double-lid eyes after dark. |
| twilight | Volumised but still natural — drama you can actually wear out. |
| nightshift | A fox-eye upsweep that elongates monolid and double-lid eyes. |
| vip | Statement volume for the nights you want to be seen. |

**(b) 频率专属一句(3 句)**:

| freq | 文案 |
|---|---|
| daily | Daily-comfort band — thirty-second application, light enough to forget you're wearing it. |
| weekly | Comfortable for full days, with just enough lift to feel polished. |
| events | Built to hold its shape all night — no drooping, no resets. |

**(c) flag 安心句(4 句 + 默认)**:多选时按优先级 `sensitive > firsttime > contacts > lashext` 取**一条**;无 flag 用默认。

| flag | 文案 |
|---|---|
| sensitive | Glue-free and hypoallergenic — safe for sensitive eyes. |
| firsttime | One of the easiest bands to place — ideal for a first time with lashes. |
| contacts | No glue near the waterline — comfortable over contact lenses. |
| lashext | A gentle, glue-free reset while you take a break from extensions. |
| (默认) | 30× reusable, hypoallergenic, no glue. |

最终 3 条 = [a] + [b] + [c]。

---

## 3. 结果卡动态渲染

把 `index.html:966-988` 写死的结果卡改为带 `data-finder-result-*` 钩子的模板,JS 在点 done 时填充。

新增 `renderFinderResult(lashId, state)`:
1. `var s = LASH_STYLES[lashId]`
2. 写入款名(斜体)、价格 `s.price`
3. 写入 3 条理由(§2 拼装)
4. 「Add to bag」按钮:设 `data-product-id=s.id`、`data-product-name=s.name`、`data-product-variant=s.group`、`data-product-price=s.price`、`data-product-bg`(用 `#F7F7F7` 或 s 的色)。复用现有购物车,不改购物车逻辑。
5. 「See full details」链接 → `product.html?style=` + s.id
6. (可选,二期)hero 区用 `s.card` 图替换 CSS 占位条。

`data-finder-done` 的 handler 改为:`var id = resolveLash(state); renderFinderResult(id, state); show(4);`

## 4. 匹配函数 + 边界

```js
function resolveLash(state) {
  var eye  = state.eye  || 'double-lid';   // 安全默认
  var look = state.look || 'natural';
  var freq = state.freq || 'weekly';
  var byEye  = LASH_FINDER_MAP[eye]  || LASH_FINDER_MAP['double-lid'];
  var byLook = byEye[look] || byEye['natural'];
  var id = byLook[freq] || byLook['weekly'];
  if (!id || !LASH_STYLES[id]) { console.warn('Finder: no match for', state); id = 'inbox'; }
  return id;
}
```

- **没选满**:每一层都有 fallback,永远返回有效款,绝不白屏。
- **查表漏填**:回退到 weekly 列,再不行回退 inbox,并 `console.warn` 指出哪格漏了。
- **眼形不匹配自检**:dev 启动时跑一次全表校验(§1 约束)。

## 5. 不改动的部分

购物车(`addToCart`/`renderCart`)、问答步骤切换(`show()`)、模态框开关、CSS 全部不碰。改动面 = `theme.js` 新增两个常量/函数 + 改 1 行 done handler + `index.html` 结果卡加 data 钩子。

## 6. 验证方式

- 手动:打开 finder,跑几条路径(monolid+drama+events 应得 Nightshift;double-lid+natural+daily 应得 Inbox),确认款名/价格/理由/CTA 都变。
- 自检:控制台无 finder warn;全表 36 格都通过眼形池校验。
- 回归:加入购物车仍正常跳 toast + 抽屉;「See full details」跳对应 PDP。

## 7. 待办 / 暂不做(YAGNI)

- 结果卡 hero 换真图:二期,非阻塞。
- 标准独立页 `lash-finder.html`:超出本次范围,另开。
- Shopify 主题移植:本设计先在 `html-build/` 落地,主题端的 `initLashFinder()` 用同一张表 + 同一函数再移植。
