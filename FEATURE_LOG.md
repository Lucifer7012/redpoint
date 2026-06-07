# 功能记录

这个文件从 2026-05-18 开始记录项目后续新增功能和重要规则变更。每次增加新功能时，先写清楚目标、改动范围、验证方式和后续注意点，方便之后继续接手。

## 2026-06-07

### 横屏单张牌继续放大

- 背景：用户继续反馈单张牌希望更接近标注图中的大尺寸，同时仍要求公共牌和手牌保持一行，牌面比例不能变形。
- 改动：
  - 触屏横屏 `--game-public-card-width` 提升到 `clamp(80px, 9.8vw, 90px)`，真实验证中公共牌约 `83-90px` 宽。
  - 触屏横屏 `--game-hand-card-width` 提升到 `clamp(82px, 9.5vw, 90px)`，真实验证中手牌约 `82-87px` 宽。
  - 公共牌继续 `flex-wrap: nowrap`，并把 `.table-cards` 最大宽度放开到 `100%`；公共牌之间使用负边距压缩横向占用，13 张公共牌仍保持单行。
  - `renderHumanHand()` 给手牌容器写入 `data-card-count`，并在手牌超过 7 张时加 `is-scroll-hand`，让 2 人 10 张手牌保持单行且可横向滚动。
  - 右侧最近动作牌保持 `clamp(56px, 6.2vw, 60px)`，不跟主牌面同幅放大，避免压住最近动作文字和三张指标卡。
  - 缓存版本更新为 `20260607-large-single-cards`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-large-single-cards` 与 `app.js?v=20260607-large-single-cards`。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-large-single-cards-4p-915x412.png`
    - `artifacts/layout-check/real-index-large-single-cards-4p-844x390.png`
    - `artifacts/layout-check/real-index-large-single-cards-2p-915x412.png`
  - `artifacts/layout-check/large-single-cards-check.json` 记录 3 个视口均命中触屏横屏媒体规则，坏图数为 0，公共牌行数为 1，手牌行数为 1；2 人 `915 x 412` 下手牌启用 `is-scroll-hand`，横向滚动宽度大于可视宽度。

### 横屏牌面单行放大与四人座位调整

- 背景：用户截图标注希望左右两个玩家移到两侧空位，并要求公共牌和手牌都改成一行排列，让牌继续变大，便于看清道风牌面。
- 改动：
  - `getSeatAssignments()` 在 4 人模式下改为 `left / top / right` 三个对手座位，不再使用 `top-left / top-right`。
  - 触屏横屏 `.seat-left` / `.seat-right` 下移到牌桌两侧空位，避开公共牌横排。
  - 触屏横屏 `--game-side-inset` 从较大的公共牌安全边距收窄到 `clamp(82px, 9.5vw, 96px)`，给公共牌单行横排留出更多宽度。
  - `.table-cards` 改为 `flex-wrap: nowrap`，公共牌始终单行排列；超过 12 张时 `is-wide-table` 会略缩公共牌宽度但仍保持一行。
  - 公共牌宽度提升到 `clamp(52px, 6.2vw, 58px)`，手牌提升到 `clamp(58px, 6.8vw, 66px)`，最近动作牌提升到 `clamp(50px, 5.8vw, 56px)`。
  - 手牌重叠量调整为 `-26px`，确保 2 人 10 张手牌仍在底部手牌区内保持一行。
  - 缓存版本更新为 `20260607-one-row-cards`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-one-row-cards` 与 `app.js?v=20260607-one-row-cards`。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-one-row-cards-4p-915x412.png`
    - `artifacts/layout-check/real-index-one-row-cards-4p-844x390.png`
    - `artifacts/layout-check/real-index-one-row-cards-2p-915x412.png`
  - `artifacts/layout-check/one-row-cards-check.json` 记录 3 个视口均命中触屏横屏媒体规则，坏图数为 0，公共牌行数为 1，手牌行数为 1；4 人模式左右座位已切到 `seat-left` / `seat-right`。

### 道风牌面可读性放大

- 背景：用户实机截图反馈上一版图片牌面仍然太小，看不清细节；截图中公共牌和右侧动作牌尤其小，且不可选牌置灰后细节发白。
- 改动：
  - 触屏横屏对局中，公共牌宽度提升到 `clamp(42px, 5vw, 48px)`，手牌提升到 `clamp(50px, 5.8vw, 56px)`，右侧最近动作牌提升到 `clamp(44px, 5vw, 50px)`。
  - 公共牌区域 top/bottom 留白重新分配，给放大后的两排牌更多竖向空间。
  - `renderTableCards()` 给公共牌容器写入张数并在超过 12 张时加 `is-wide-table`，让 13 张牌自动排成 7 + 6，避免第 13 张被挤到第三排。
  - `syncLandscapeActionPanel()` 的旧内联兜底同步改为 2:3 图片牌尺寸，不再强制 40px、18/25 和 4px padding。
  - `.dimmed-card` 从 0.38 透明度调整为 0.72，并降低灰度，避免图片牌不可选时看不清。
  - 缓存版本更新为 `20260607-daoist-cards-readable`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-daoist-cards-readable` 与 `app.js?v=20260607-daoist-cards-readable`。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-daoist-cards-readable-4p-915x412.png`
    - `artifacts/layout-check/real-index-daoist-cards-readable-4p-844x390.png`
    - `artifacts/layout-check/real-index-daoist-cards-readable-2p-915x412.png`
  - `artifacts/layout-check/daoist-cards-readable-check.json` 记录 3 个视口均命中触屏横屏媒体规则，牌面坏图数为 0，公共牌越界为 false；4 人 `915 x 412` 丢牌后公共牌张数为 13 且启用 `is-wide-table`。

### 道风扑克牌图片牌面接入

- 背景：用户反馈当前牌显示偏大、观感偏粗糙，并提供一套重新设计的扑克牌；要求前 52 张作为正式牌面，显示大小可以调整，但不能改变比例，也不要继续使用没有棱角的大圆角牌 UI。
- 改动：
  - 从新牌源图生成 52 张 256 x 384 WebP 资源，放入 `assets/cards/daoist/`，保留 2:3 比例。
  - 新增牌面路径映射：`hearts -> H`、`diamonds -> D`、`clubs -> C`、`spades -> S`，按 `rank + suit` 加载图片。
  - `createCardButton()` 从文字牌结构改为 `<img class="card-face">`，保留 `aria-label`、禁用原因、点击回调、选中态、可打牌态、置灰态和发牌动画。
  - `.card-btn` 改为小边角、零内边距、2:3 图片框，不再用 18px 大圆角和文字牌内部排版。
  - 触屏横屏下公共牌、最近动作牌、手牌分别缩小一档，避免新牌面在 844 x 390 / 915 x 412 下继续显得过大。
  - `artifacts/layout-check/public-area-preview.html` 同步换成图片牌。
  - `tools/sync-start.ps1` / `tools/sync-finish.ps1` 的跟踪清单补上 `assets` 和 `artifacts/layout-check`，确保牌面资源和真实截图能跨电脑同步。
  - 缓存版本更新为 `20260607-daoist-card-faces`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `assets/cards/daoist/`
  - `artifacts/layout-check/public-area-preview.html`
  - `tools/sync-start.ps1`
  - `tools/sync-finish.ps1`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-daoist-card-faces` 与 `app.js?v=20260607-daoist-card-faces`。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-daoist-cards-4p-915x412.png`
    - `artifacts/layout-check/real-index-daoist-cards-4p-844x390.png`
    - `artifacts/layout-check/real-index-daoist-cards-2p-915x412.png`
  - `artifacts/layout-check/daoist-card-faces-check.json` 记录 3 个视口均命中触屏横屏媒体规则，牌面坏图数为 0。

### 四人横屏骰子布局修正

- 背景：4 人模式横屏摇骰子结果阶段，顶部三个对手骰子和本地玩家骰子会挤进公共牌区域，中间骰子还会压住“公共牌区暂时没有明牌”；同时底部手牌区在未发牌前显示“你的手牌已经出完”，语义不对。
- 改动：
  - 新增 body 状态 `is-dice-view`，只在 `dice-rolling` / `dice-result` 阶段开启。
  - `is-dice-view` 下隐藏空的 `.table-public-area`，给骰子阶段腾出牌桌中部空间。
  - 为横屏骰子阶段重新定位 `.seat-dice-top-left`、`.seat-dice-top`、`.seat-dice-top-right` 和 `.seat-dice-bottom`，改为三上、一中下的紧凑布局。
  - 压缩骰子 cube、标签和点数说明字号，避免 4 人模式横屏下互相覆盖。
  - 骰子阶段手牌空状态改为“等待摇骰子结果”。
  - 缓存版本更新为 `20260607-dice-layout-4p`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-dice-layout-4p-915x412.png`
    - `artifacts/layout-check/real-index-dice-layout-4p-844x390.png`
    - `artifacts/layout-check/real-index-dice-layout-2p-915x412.png`
    - `artifacts/layout-check/real-index-dice-layout-4p-active-915x412.png`

### 手机横屏公共牌外框收窄

- 背景：用户确认上方大红框是公共牌大外框，并提醒 4 人模式左右会增加玩家座位，所以公共牌外框不能继续横向铺太开。
- 改动：
  - 将触屏横屏对局的 `--game-side-inset` 从 `clamp(88px, 10.8vw, 102px)` 调整为 `clamp(144px, 17vw, 170px)`。
  - 只收窄 `.table-public-area` 的大背景框，公共牌本体 `.table-cards` 仍在框内居中显示。
  - 缓存版本更新为 `20260607-public-frame-narrow`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-public-frame-narrow-2p-915x412.png`
    - `artifacts/layout-check/real-index-public-frame-narrow-4p-915x412.png`
    - `artifacts/layout-check/real-index-public-frame-narrow-4p-844x390.png`

### 手机横屏对局底部整行压缩

- 背景：用户反馈对局页最下面整行高度偏高，中间手牌区上方空白太多，但仍希望左侧牌堆、中间手牌、右侧最近动作/指标保持同高对齐。
- 改动：
  - 将触屏横屏对局的 `--game-bottom-band-height` 从 `184px` 调整为 `160px`。
  - 右侧最近动作 CSS 高度公式同步改为跟随新的共同高度。
  - `syncLandscapeActionPanel()` 改为读取 `.human-panel` 的实际高度，再计算最近动作框高度，避免 JS 固定定位把动作框撑回旧高度。
  - `.selection-metrics` 在该布局下显式清掉旧 `grid-area` 静态定位影响，固定贴住底部，避免压缩后被裁切。
  - 缓存版本更新为 `20260607-bottom-band-compact`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏 `915 x 412`、`844 x 390` 下截图验证：
    - `artifacts/layout-check/real-index-bottom-band-compact-915x412.png`
    - `artifacts/layout-check/real-index-bottom-band-compact-844x390.png`
  - 内置浏览器确认本地真实页面加载 `styles.css?v=20260607-bottom-band-compact` 与 `app.js?v=20260607-bottom-band-compact`。

## 2026-06-04

### 真实对局页右侧最近动作 JS 固定

- 背景：用户在真实 `index.html` 对局页清空缓存后仍看不到右侧最近动作，说明此前只基于 `public-area-preview.html` 的截图验证不足。
- 改动：
  - 新增 `syncLandscapeActionPanel()`。
  - 每次 `render()` 后和窗口尺寸变化后，按 `.selection-metrics` 的实际位置，将 `.action-stage` 固定到三张指标卡上方。
  - 使用内联 important 样式修正最近动作框、文字区和动作牌区，不再强制改公共牌、手牌或对手区。
  - 缓存版本更新为 `20260604-landscape-js-pin`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 分别验证 `915 x 412` 与 `844 x 390`。
  - 正式回合截图 `artifacts/layout-check/real-index-js-pin-active-915x412.png`、`artifacts/layout-check/real-index-js-pin-active-844x390.png` 均确认右侧最近动作固定在三张指标卡上方，公共牌区和手牌区仍可见。
  - 内置浏览器打开本地真实页面，确认当前加载 `styles.css?v=20260604-landscape-js-pin` 与 `app.js?v=20260604-landscape-js-pin`。

### 横屏最终覆盖顺序修正

- 背景：用户再次用 `915 x 412` 截图确认右侧最近动作仍不见；排查后确认上一轮兜底规则位置仍早于后续触屏横屏规则，所以被覆盖。
- 改动：
  - 将最终右侧最近动作覆盖规则补到 `styles.css` 文件末尾。
  - 普通横屏和触屏横屏都强制保留右侧最近动作文字区、动作牌区和三张指标卡。
  - 清理此前误加的整套横屏强制布局，只保留右侧最近动作最小覆盖。
  - 缓存版本更新为 `20260604-landscape-preview-verified`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本机 Chrome + Playwright 系统浏览器、`isMobile: true`、`hasTouch: true` 生成 `artifacts/layout-check/chrome-final-915x412.png` 和 `artifacts/layout-check/chrome-final-844x390.png`，两张图均确认右侧最近动作和动作牌可见，公共牌区未被压坏。

### 横屏响应式预览兜底规则

- 背景：用户使用电脑 Chrome DevTools 的 `844 x 390` 响应式预览时，命中的媒体条件和此前主要修改的触屏专用分支不同，导致线上看起来没变化。
- 改动：
  - 在 CSS 末尾新增 `body.is-game-view` 横屏兜底规则。
  - 普通横屏和触屏横屏都强制使用底部三栏牌桌结构。
  - 右侧最近动作固定显示为左文字、右动作牌，下方保留三张指标卡。
  - 缓存版本更新为 `20260604-landscape-action-visible`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本机 Chrome headless 生成 `artifacts/layout-check/chrome-after-landscape-fallback-844x390.png`，右侧最近动作和动作牌可见。

### 手机横屏对局右侧最近动作内容锁定

- 背景：右侧最近动作外框已固定到右栏，但实机截图显示框内文字和动作牌仍不可见。
- 改动：
  - `action-stage` 内部改为左侧文字、右侧动作牌的固定两列。
  - 显式恢复 `action-stage__meta` 和 `action-stage__cards` 的可见性、透明度和 transform。
  - 牌区固定为 46px 右列，避免被自动网格压到不可见区域。
  - 缓存版本更新为 `20260604-right-panel-content-locked`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。

### 手机横屏对局右侧最近动作锁定

- 背景：再次实机截图显示，仅提高层级和加宽右栏仍不够，最近动作文字会错位到手牌面板上方。
- 改动：
  - 触屏横屏游戏布局里，`action-stage` 改为绝对定位。
  - 最近动作固定贴在右侧栏，位于三张指标卡上方。
  - 不再让最近动作参与底部三列网格排版，避免和中间手牌面板互相覆盖。
  - 缓存版本更新为 `20260604-right-panel-locked`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。

### 手机横屏对局右侧面板裁切修正

- 背景：上一轮恢复右侧最近动作后，实机截图显示右侧面板仍被中间手牌面板压住，文字和动作牌只露出一部分。
- 改动：
  - 触屏横屏游戏布局里，`center-stage` 层级提升到手牌面板之上。
  - 右侧栏宽度放大到 `244px - 278px`，中间手牌区同步让位。
  - 右侧 `action-stage` 改为占满右栏宽度并左上排版，动作牌缩小一点，避免再次被裁。
  - 缓存版本更新为 `20260604-right-panel-unclipped`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 仍需用真机横屏截图确认触屏媒体条件下的最终视觉。

### 手机横屏对局右侧最近动作恢复

- 背景：实机截图显示左侧牌堆和张数位置偏高，右侧底部只剩三张指标卡，原本类似图三的“最近动作 + 动作牌”区域没有显示出来。
- 改动：
  - 左侧 `draw-pile__stack` 和 `draw-pile__meta` 在触屏横屏对局布局里整体下移一点。
  - 右侧 `action-stage` 改为固定占据右侧栏上方空间。
  - `selection-metrics` 固定为右侧栏底部三张指标卡，避免继续挤掉最近动作。
  - 缓存版本更新为 `20260604-right-action-restored`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本地服务可打开，预览页加载新版缓存参数。内置浏览器不能命中触屏媒体条件，后续仍以真机横屏截图确认最终视觉。

## 2026-06-02

### 移动端大厅 ID 账户信息入口恢复

- 背景：移动端适配前，点击“当前账号已绑定唯一 ID”里的 ID 可以弹出账号信息；移动端大厅改成右上角 `ID: 当前游戏ID` 后，这个新 ID 文本没有接上旧的浮层逻辑。
- 改动：
  - 右上角 `lobby-account-id` 重新接入账号信息浮层点击逻辑。
  - 未登录或未绑定 ID 时不打开浮层；已绑定 ID 时显示为可点击状态，并支持 Enter / 空格键触发。
  - 手机横屏大厅里，账号信息浮层改为固定在右上角 ID 下方，避免旧宿主“游戏 ID”卡片隐藏后浮层不可见。
  - 账号信息内容去掉联机门票说明，改为展示 2 / 3 / 4 人模式的累计积分、局数、胜场和单局最高，底部保留当前榜单模式上一局分数。
  - 浮层样式改为深色半透明小面板，贴近当前大厅画风。
  - 缓存版本更新为 `20260602-id-stats-modes`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
  - 本地页面可加载新版缓存参数，控制台无错误。

### 登录注册表单深色化

- 背景：邮箱登录 / 注册表单仍是浅色输入卡，和大厅、欢乐豆中心、规则弹窗的深色游戏画风不一致。
- 改动：
  - 手机横屏下邮箱登录弹窗改为深色半透明游戏面板。
  - 邮箱和密码输入框改为深色底、金色聚焦边框。
  - “记住邮箱”、登录、注册、收起按钮统一为深色金边 / 金色主按钮风格。
  - 缓存版本更新为 `20260602-auth-dark-panel`。
- 涉及文件：
  - `index.html`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
  - 本地页面可加载新版缓存参数，控制台无错误。

### 金豆资源条与欢乐豆中心弹窗

- 背景：大厅顶部“+ 2,120 欢乐豆”文字太长，和斗地主式资源条相比不够游戏化；点击 `+` 后的欢乐豆中心仍是浅色网页卡片，和当前大厅、规则弹窗的深色半透明画风不统一。
- 改动：
  - 新增紧凑豆子数量格式，顶部资源条和欢乐豆中心大余额只显示数字或“万”单位，不再显示一长串“欢乐豆”。
  - 顶部资源条新增金豆圆标，小 `+` 改为贴近金豆旁边的充值入口。
  - 欢乐豆中心弹窗改为深色半透明游戏面板，使用金色标题、金豆余额条和深色奖励卡片。
  - 手机横屏大厅下压缩豆子中心弹窗尺寸，三张奖励卡横向排布，避免浅色大弹窗遮住整屏。
  - 缓存版本更新为 `20260602-bean-gold-ui`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
  - 本地页面可加载新版缓存参数，控制台无错误。

### 手机横屏大厅顶部账号区

- 背景：当前大厅右上角同时承载退出登录和状态说明，视觉上比参考图更挤；测试希望改为右上角只显示类似 `ID: wilson` 的账号信息与退出按钮，状态白字放回左上角大厅标题区。
- 改动：
  - 新增 `lobby-account-id` 显示位，在手机横屏大厅右上角显示 `ID: 当前游戏ID`。
  - 左上角大厅标题块继续显示“游戏大厅”，并把登录后的大厅状态说明写到标题下方。
  - 手机横屏大厅隐藏原右上角 `auth-status`，右上角只保留账号 ID 与“退出登录”按钮。
  - 修正 844 x 390 下中间模式卡和底部操作条按整屏居中导致向右重叠好友列表的问题，改为按左侧流程列与右侧好友/排行榜栏之间的通道定位。
  - 修正左上角状态白字被单行省略截断的问题，标题块略微加宽加高，状态文案允许最多两行显示。
  - 根据实测反馈回收左上角标题块高度，避免状态文案压住下方搜索框；状态文案改为“可开始单机或好友房”并保持单行显示。
  - 按测试反馈恢复左上角标题块到更早的紧凑宽度，只把状态文案改为“可开始单机或好友联机”。
  - 缓存版本更新为 `20260602-lobby-header-copy`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
  - 本地页面加载新版缓存参数，控制台无错误。

## 2026-05-19

### 好友与邀请布局调整

- 背景：社交面板里房间、申请、邀请、好友列表和当前 ID 信息的排列不够符合邀请流程，好友列表较长时也会把面板撑得过高。
- 改动：
  - 社交面板改为左右两栏：左侧依次显示好友申请/房间邀请、房间创建或当前房间卡片、当前 ID/联机门票/战绩信息。
  - 右侧单独显示好友列表，并限制为约 5 条高度，好友更多时在该区域内上下滚动查看。
  - 没有等待房间时，创建 2 / 3 / 4 人房的按钮移动到说明文字下方。
  - 好友申请、房间邀请和房主的邀请反馈都改为区域内滚动，避免数量过多时撑大整个社交面板。
  - 当前房间卡片里的邀请反馈移动到房间信息右侧空白区，和关闭/开始按钮保持同一行布局。
- 涉及文件：
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
  - 本地浏览器确认社交面板 DOM 顺序、好友列表滚动样式和控制台错误。

### 房间邀请居中提醒

- 背景：原房间邀请只显示在社交面板里，不够醒目，容易错过；用户希望更接近排位组队邀请的居中弹窗体验。
- 改动：
  - 新增居中的房间邀请弹窗，展示邀请人、房间人数和门票。
  - 弹窗支持“同意加入”“忽略”“拒绝”三种操作。
  - “忽略”只在当前页面会话内隐藏该邀请，不改服务器状态，仍可在社交面板中处理。
  - “拒绝”展开原因面板，支持快捷原因和自定义文字。
  - 拒绝时会把 `rejectReason`、`rejectReasonQuick`、`rejectedByUid`、`rejectedByGameId` 写入 `roomInvites/{inviteId}`。
  - 社交数据实时刷新后会直接渲染邀请弹窗，不需要先点击社交面板里的邀请。
  - 社交面板里的房间邀请按钮改为“查看邀请 / 拒绝并回复”，作为弹窗的兜底入口。
  - 房间邀请列表按创建时间倒序显示，最新邀请排在最上面；新邀请额外写入 `createdAtMs` 作为本地即时排序兜底。
  - 被邀请人刷新邀请时会校验房间仍为等待中且未满员；房间已关闭、已开局或已满的旧邀请不会再自动弹窗，也不会继续显示在房间邀请列表里。
  - 房主侧会监听自己发出的房间邀请，并在房间卡片里显示“邀请反馈”：等待回复、已加入、已拒绝及拒绝原因。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 当前拒绝原因会显示在房主的房间卡片“邀请反馈”里；后续如需更醒目，可以再补全局通知或弹窗提示。

### 欢乐豆中心与福利领取

- 背景：原余额卡右上角 `+` 只是充值占位，玩家没有可测试的欢乐豆获取入口；真实充值和广告 SDK 仍需要后端/第三方校验，不能直接做成纯客户端支付入账。
- 改动：
  - 新增“欢乐豆中心”弹窗，从余额卡右上角 `+` 打开。
  - 增加每日福利：每个账号每天可领取 300 欢乐豆。
  - 增加模拟广告奖励：每个账号每天最多 5 次，每次 80 欢乐豆。
  - 领取记录写入 `profiles/{uid}.beansBenefits`，余额使用 Firestore 事务更新。
  - 未绑定游戏 ID 的登录账号也可以先领取福利，后续绑定 ID 时会保留已有余额。
  - 充值套餐入口继续保留为“支付待接入”，避免在没有服务端校验时从客户端伪造充值。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 真实充值应由服务端支付回调写入余额，不能信任前端按钮。
  - 真实广告奖励接入广告 SDK 后，应由广告完成回调替换当前“模拟观看广告”按钮。

### 等待房间门票退款

- 背景：联机等待房还没真正开局时，如果玩家离开或房主关闭房间，已扣除的门票不应永久损失。
- 改动：
  - 玩家离开等待房时，会在同一个 Firestore 事务里退回自己的门票，并从房间 `beansRound.paidUids` 移除。
  - 房主关闭等待房时，会退回房主自己的门票。
  - 其他成员遇到已关闭房间时，下一次刷新社交数据会自动退回自己的门票并移出该关闭房间。
  - 退款记录写入 `beansRound.refundedUids`，避免重复退款。
- 涉及文件：
  - `app.js`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 当前退款遵守现有 Firestore 权限模型：每个客户端只能退回自己账号的门票，不能由房主代替所有成员改余额。

## 2026-05-18

### 账号区与欢乐豆余额布局调整

- 背景：排行榜不应展示欢乐豆余额；登录区需要更集中，原密码输入框位置改为当前账号欢乐豆余额展示，并提供充值入口。
- 改动：
  - 邮箱和密码输入合并到同一个账号登录卡片里。
  - 原密码框位置新增欢乐豆余额卡，显示当前账号余额。
  - 余额卡右上角增加充值 `+` 按钮，当前先显示“充值功能待接入”的提示。
  - 排行榜条目不再展示欢乐豆余额。
  - 玩家统计卡不再重复显示欢乐豆余额，余额统一放到顶部余额卡。
  - 登录卡尺寸收紧，不再占两列，游戏 ID 和其他开局设置保持同一行网格展示。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 充值按钮目前只是入口占位，真实充值需要后端/支付校验。

### 赢家领取奖励确认

- 背景：联机欢乐豆奖池不应在结算时静默自动入账，赢家需要看到并确认领取奖励。
- 改动：
  - 增加 `pendingBeansAward` 状态，记录待领取的本局奖池。
  - 结算后如果本地玩家是唯一赢家且本局有奖池，会在赢家结算卡里显示领奖操作。
  - 玩家可选择直接领取奖池，或模拟观看广告后按奖池 2 倍领取。
  - 玩家点击领取后才执行欢乐豆派奖，并刷新当前账号余额和排行榜数据。
  - 奖励成功到账后会显示“奖励已领取”，再点击可查看结算榜单。
  - 修正派奖失败时不应把本地奖池状态直接标记为已派奖的问题。
- 涉及文件：
  - `app.js`
  - `styles.css`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 该确认只影响真人联机奖池；本地打电脑仍然没有欢乐豆奖池。
  - 如果后续加入真实支付或广告奖励，也应该保留类似的显式确认/到账反馈。

### 联机开局门票兜底校验

- 背景：如果房间创建或旧房间状态里没有正确记录房主已支付门票，可能出现赢家领取奖池后余额只回到 2000，而不是 `2000 - 门票 + 奖池`。
- 改动：
  - 联机房主开始已有房间对局时，会先调用门票校验逻辑。
  - 如果当前用户还没有为本局 `beansRound` 支付门票，会在开局前补扣并写入 `paidUids`。
  - 如果欢乐豆不足，会阻止开局，避免生成未付款奖池。
- 涉及文件：
  - `app.js`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 这只保证当前开局用户付款；被邀请玩家仍依赖接受邀请/进入房间时扣门票。
  - 已经结束的旧对局不会自动重算余额，需要从下一局开始验证。

### 领奖后余额刷新修正

- 背景：赢家确认领取奖池后，事件日志会显示已领取，但排行榜仍可能显示旧余额，例如 2 人局领取 200 后仍显示 2000。
- 改动：
  - 领奖入账改为 Firestore 原子增量，避免读取旧余额后再写回覆盖。
  - 当前账号资料和排行榜刷新优先从服务器读取，减少本地缓存显示旧余额的概率。
- 涉及文件：
  - `app.js`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 这次修正只影响新领取动作；已经领取但余额未正确变化的旧局不会自动补发。

### 本地打电脑不消耗欢乐豆

- 背景：欢乐豆机制只用于真人联机模式；玩家自己和电脑玩时不应消耗欢乐豆，也不应产生奖池派奖。
- 改动：
  - 本地开始游戏按钮恢复为普通“开始游戏”，不再展示门票。
  - 本地开始游戏不再调用门票扣除逻辑。
  - 本地开始游戏会清空当前 `beansRound`，避免上一局联机奖池状态影响单机局。
  - 余额卡中的门票文案改为“联机门票”，避免误解。
- 涉及文件：
  - `app.js`
- 验证：
  - `node --check app.js` 通过。
- 后续注意：
  - 联机房间的创建、加入、邀请仍然保留门票逻辑。
  - 后续如果增加充值或看广告得欢乐豆，也应只影响账号余额，不改变单机局免费规则。
