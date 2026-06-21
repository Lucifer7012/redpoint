# Changelog

本文件记录项目级变更摘要。更详细的功能背景、改动范围和验证记录继续保留在 `FEATURE_LOG.md`。

记录规则：

- 不记录 API Key、密码、Token、Cookie 或任何真实密钥。
- 每次代码或内容修改后，同步更新本文件。
- 如当前状态、测试方式或后续注意点发生变化，同时更新 `docs/PROJECT_STATUS.md`。
- 桌面总工作记录同步更新：`C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md`。

## 2026-06-21

### 回到大厅后不再自动展开上一局结算

- 根据用户最新截图，打完一把后点“回到大厅”，大厅里不应自动出现整块“上一局结算”面板；保留一个可手动点击的 `上一局结算` 按钮即可。
- 这轮把大厅结算历史改成显式展开：`returnToSetup()` 回大厅时会主动收起历史面板，`handleBackToSetup()` 也不再自动滚动到那一块。
- 上一局结果数据没有删，仍保留在 `state.lastFinishedResult`；只有当用户主动点 `上一局结算` 按钮时，才把 `history-panel` 展开并滚动过去。

Verification:

- `node --check app.js` passed.
- 人工复核 `handleBackToSetup()`、`handleViewLastResult()`、`returnToSetup()` 和大厅渲染条件，确认“回大厅默认收起，手动点按钮才展开”。

### 三张相同规则改正为 5 / 10 / J / Q / K

- 根据用户再次澄清，上一轮把“三张相同”收口到 `10 / J / Q / K` 仍然不完整；正确目标规则应为：只有 `5 / 10 / J / Q / K` 可以用手里 1 张同点牌，一次钓走台面 3 张同点牌。
- 这轮没有只改单个判断，而是把 `app.js` 里的三张相同资格集合单独拆开，保留 `TEN_RANKS` 继续处理 `10 / J / Q / K` 的同点单张钓牌，同时新增 `TRIPLE_CAPTURE_RANKS` 统一覆盖 `5 / 10 / J / Q / K` 的三张相同资格。
- 同步把对局中的目标提示、手动选牌报错文案、默认规则提示和 `index.html` 规则弹窗一起改正，避免代码允许 `5`，但界面仍写成只限 `10 / J / Q / K`。
- 额外补了 `app.js` 缓存参数到 `20260621-triple-capture-5`，减少线上复测时继续命中旧脚本缓存的概率。

Verification:

- `node --check app.js` passed.
- 人工复核 `canUseTripleCapture()`、目标提示文案和规则弹窗，确认 `5 / 10 / J / Q / K` 全部统一生效。

### 单机结算隐藏欢乐豆输赢与说明

- 根据用户最新截图，单机结算卡里的 `不输不赢` 和 `单机练习局不涉及欢乐豆` 在移动横屏里会白白占掉两行高度，挤压真正重要的 `得分牌` 区。
- 这轮把单机结算卡改成只展示玩家名、总分、身份和 `得分牌`；只有联机 / 欢乐豆相关对局才继续显示欢乐豆输赢和对应说明。
- 这次没有靠 CSS 视觉隐藏，而是直接在 `app.js` 的结算渲染阶段按是否存在 `beansRound` 决定是否输出这两行，避免单机结构里留下无意义占位。

Verification:

- `node --check app.js` passed.
- 人工复核单机结算渲染结构，确认无 `beansRound` 时不再输出 `settlement-card__beans` 与 `settlement-card__detail`。

### 三张相同规则收口到 10 / J / Q / K

- 说明：这是 2026-06-21 当天较早一轮的中间记录，现已被上方“`5 / 10 / J / Q / K`”的更正覆盖，保留这里只为追溯修正过程。
- 根据用户复核，当前项目把“三张相同”错误实现成了所有点数都可触发，这和目标规则不一致；正确规则应为：普通数字牌只按凑十，只有 `10 / J / Q / K` 才能触发“三张相同”。
- 这轮把相关逻辑一次性全部收口：AI 选牌、玩家手动判定、可点击高亮、规则提示文案和规则说明都统一改到同一套规则。
- 具体来说，`app.js` 里新增了专门的三张相同资格判断，只有 `TEN_RANKS` 内的牌才允许把台面 3 张同点牌当作候选解；普通数字牌即使看到台面有 3 张同点，也不会再亮起、不会再允许结算、AI 也不会再误判。
- 同步把对局里的目标提示从宽泛的“凑十 / 三张相同”收紧成更明确的 `凑十 / 三张相同(10/J/Q/K)`，规则弹窗也改成只对 `10 / J / Q / K` 生效的描述，避免继续误导玩家。

Verification:

- `node --check app.js` passed.
- 人工复核 `app.js` 中 AI、亮牌、高亮、结算判定和规则提示分支，确认三张相同现在都统一受 `10 / J / Q / K` 限制。

### 移动横屏结算卡改成名字右侧显示总分

- 根据用户最新真实 `915 x 412` 横屏截图反馈，继续优化移动横屏结算卡，但仍然不改变底部整体分区和卡片外框高度。
- 这轮把结算卡里的总分从单独一整行挪到了“玩家名字”右侧，改成同一行并排显示，优先把原来被总分占掉的竖向空间还给 `得分牌` 区。
- 对应渲染结构在 `app.js` 中新增了 `settlement-card__title-row`，样式在 `styles.css` 中补了桌面和移动横屏两套布局规则。
- 这次没有继续缩小左右分区，也没有再压缩结算卡外框，只是把卡内信息重新排布，让同样高度里能容纳更多 `得分牌` 标签。

Verification:

- 本地移动横屏模拟下复核结算 DOM，确认总分已移动到玩家名字右侧。
- 本地移动横屏模拟下复核高分场景结算卡，确认首张结算卡中 `8` 个 `得分牌` 标签可在同一卡片内完整显示，底部仍留有余量。

### 移动横屏结算区去重并补齐得分牌展示

- 根据用户在真实 GitHub Pages `915 x 412` 横屏截图的反馈，继续收紧移动横屏结算态，目标是不改变整体左右上下分区，只优化结算内容本身。
- `be3479a` 这一轮先把移动横屏小视口里桌面上的重复悬浮结算结果去掉，保留下方主结算区作为唯一结算入口，避免“桌面上一套 + 底部一套”信息重复。
- 同一轮还把下方每位玩家卡片里的得分内容从纯文字摘要改成 `得分牌` 小标签列表，便于直接看出本局是靠哪些红牌得分。
- 后续在 `ea52b05` 中继续把移动横屏结算卡里的 `得分牌` 标签压缩成更小的胶囊样式，只收紧标签本身的字号、内边距和间距，不改结算卡外框和底部整体布局。
- 这次修正的意图是优先保证第二张及之后的结算卡在 `915 x 412` 这类真实 Android 横屏小视口里也能完整露出 `得分牌` 一行，不再被底边裁掉。

Verification:

- `node --check app.js` passed.
- 本地移动端横屏模拟下复核了结算 DOM：移动横屏时只保留下方 `本局结算`，上方 `seat-result` 重复结果区不再渲染。
- 本地移动横屏模拟下复核了结算卡得分标签，确认收紧后 `得分牌` 一行留有底部余量，可完整显示。

### 移动横屏左侧牌堆区避让与贴底微调

- 根据用户在真实 GitHub Pages `915 x 412` 横屏截图的反馈，继续修正左侧 `状态提示 + 牌堆` 组合区。
- `982fd8d` 与 `69d9efc` 两轮先尝试通过下移底部带和减小牌堆内边距，让牌堆区更贴底，但真实页面仍会在状态提示文案变成两行时出现提示条压住牌堆框的问题。
- `d2bf719` 这轮改成更稳定的方案：给左侧提示条固定高度，避免它随着文案换行继续挤占下面牌堆区；同时把牌堆容器改成稳定的底部对齐，并收紧牌背尺寸、张数字号和内部间距。
- 这次调整只处理左侧内部排布，不改变底部三栏的整体分区关系，也不动中间手牌区和右侧最近动作/指标区的宽高结构。

Verification:

- 本地移动横屏模拟下复核左侧提示条与牌堆框的位置关系，确认两者不再重叠。
- 本地移动横屏模拟下复核牌堆内容位置，确认牌堆牌背和张数整体落在左侧卡片底部区域，不再明显悬空。

## 2026-06-17

### 大厅人数下拉层级修正

- 根据最新截图，定位到大厅单机模式里的自定义 `玩家人数` 下拉并不是尺寸问题，而是展开菜单被下面的 `开始游戏 / 查看规则` 操作条盖住。
- 将大厅中间模式卡 `.player-options-card` 的层级抬高到高于 `.lobby-actions-card`，保证人数菜单展开时不会落到按钮条后面。
- 额外给 `.lobby-player-count-select` 的展开态补了局部层级兜底，避免同卡片内其它元素再次压住菜单。
- 同步更新缓存版本到 `20260617-lobby-select-layer-fix`，确保 GitHub Pages 和本地浏览器拿到新的 `styles.css`。

Verification:

- `node --check app.js` passed.

## 2026-06-18

### 结算页底部区域和玩家结果卡防重叠

- 修复对局结束后结算态把中间手牌区域撑变形的问题：底部结算区继续沿用原手牌区固定高度，结算卡在同一行内自适应排列，超出时在区域内滚动，不再互相叠住。
- 桌面上的玩家结果卡改成紧凑展示，只保留名次、玩家、分数和红牌/赢牌数量；详细红牌列表和欢乐豆输赢保留在底部“本局结算”里，避免某个玩家红牌很多时把桌面中央撑成长条。
- 结算态的人类面板补上更明确的层级和不透明浅色背景，避免在桌面绿色背景上发灰、看不清。
- 新增结算布局预览页 `artifacts/layout-check/settlement-layout-preview.html`，并导出预览截图 `artifacts/layout-check/settlement-layout-preview-1280x720-after.png`。
- 同步修正 `artifacts/layout-check/public-area-preview.html` 的 CSS 缓存参数，避免预览辅助页继续指向旧版本样式。
- 同步更新缓存版本到 `20260618-settlement-layout-fix`。

Verification:

- `node --check app.js` passed.
- 本地静态服务 `http://127.0.0.1:4173/` 已启动并加载预览页。
- Chrome headless 导出 `artifacts/layout-check/settlement-layout-preview-1280x720-after.png`，确认底部 4 张结算卡同一行排列、无重叠，桌面玩家结果卡不再被红牌明细撑高。

### 大厅人数下拉样式统一

- 根据最新截图继续收紧大厅单机模式里的自定义 `玩家人数` 下拉，不再只修“别被挡住”，而是进一步修正“看起来不像同一个控件”的问题。
- 去掉了触发器和下拉菜单之间的可见缝隙：展开后触发器底边圆角会收平，菜单改为直接贴在触发器下缘，不再空出一条断层。
- 统一了展开态的视觉语言：菜单背景改回接近触发器本体的深色面板，边框、阴影和圆角收敛到同一套风格，不再像另一张独立卡片。
- 选项字体和尺寸也同步收紧：列表项高度、内边距和字号都比上一版更小，减少“菜单明显更大一号”的割裂感。
- 同步更新缓存版本到 `20260618-lobby-select-unified`。

Verification:

- `node --check app.js` passed.
- 本机 Edge headless 重新导出 `artifacts/layout-check/lobby-player-count-select-preview-after-unify.png`，确认展开态已无中间缝隙，菜单观感与触发器更统一。

## 2026-06-15

### 大厅人数下拉框改为自定义菜单

- 根据最新中断续做的需求，把大厅里 `玩家人数` 的原生 `select` 改成了轻量自定义下拉；根因不是文案或布局，而是 Windows/Chrome 的系统弹层仍会出现过大的展开项和右侧空白灰块，单靠 CSS 很难稳定修干净。
- 这次只替换大厅单机模式里的这一个控件，不改大厅整体布局，也不改单机 / 好友联机流程。
- 隐藏的原生 `#player-count` 仍保留为真实数据源；开始游戏、读写人数设置等原有逻辑继续走 `ui.playerCount.value`，避免把业务逻辑一起重写。
- 补齐了交互收口：按 `Escape`、点击外部、切去好友联机、离开大厅时都会自动收起；非大厅单机态下触发按钮会自动禁用。
- 更新预览页 `artifacts/layout-check/lobby-player-count-select-preview.html`，同时展示闭合态和展开态，并生成新截图 `artifacts/layout-check/lobby-player-count-select-preview.png`。
- 同步更新缓存版本为 `20260615-lobby-custom-select`。

验证：

- `node --check app.js` 通过。
- 内置 Browser 已确认 `artifacts/layout-check/lobby-player-count-select-preview.html` 闭合态 / 展开态渲染正常。
- 内置 Browser 已确认正式 `index.html?v=20260615-lobby-custom-select` 可正常加载，且没有新增 warn / error 日志。

## 2026-06-14

### 出牌钓牌的最近动作也只显示目标牌

- 根据最新截图继续补齐动作区：此前只修了“补枪成功”不再混入摸牌，但普通“出牌钓牌”这条链路里，AI 瞄准目标牌和钓牌成功时仍会把 `打出去的源牌 + 目标牌` 一起塞进右侧动作卡槽。
- 已统一收口到同一套规则：凡是动作文案表达的是“正在瞄准什么 / 成功钓走什么”，右侧最近动作就只显示目标牌，不再混入打出去的源牌。
- 具体覆盖了两段：
  - AI 出牌后 `正在瞄准 红桃6` 这类 `aim` 展示
  - 普通手牌钓牌成功后的 `collect` 展示和座位上的最近动作缩略牌
- 新增预览页 `artifacts/layout-check/action-stage-hand-capture-preview.html` 和截图 `artifacts/layout-check/action-stage-hand-capture-preview.png`，专门验证“瞄准目标牌 / 钓成功”两种状态都只剩单张目标牌。
- 同步更新缓存版本为 `20260614-hand-action-target-only`。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成 `artifacts/layout-check/action-stage-hand-capture-preview.png`，确认两种状态都只显示目标牌。

### 大厅人数下拉框尺寸收紧

- 根据最新截图继续收大厅 `玩家人数` 下拉框：当前问题不是卡片太大，而是原生 `select` 的闭合态和弹出项字号偏大，导致打开后列表显得过高，甚至会超出当前大厅面板的视觉范围。
- 已只针对大厅里的 `#player-count` 做样式收紧，保持现有布局和原生下拉交互不变：
  - 闭合态高度从 `32px` 收到 `30px`
  - 左右内边距减小
  - `select` 和 `option` 的字号、字重、行高统一压到更接近当前大厅面板尺度
- 新增预览页 `artifacts/layout-check/lobby-player-count-select-preview.html` 和截图 `artifacts/layout-check/lobby-player-count-select-preview.png`，辅助确认人数下拉框不会再大到顶出面板。
- 同步更新缓存版本为 `20260614-lobby-select-scale`。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成 `artifacts/layout-check/lobby-player-count-select-preview.png`，确认闭合态和列表态字号、行高都已收紧。

### 补枪成功的最近动作只显示目标牌

- 根据最新实机截图确认：补枪成功时，右侧“最近动作”里会出现一张完整目标牌外加半张别的牌，不是样式自己凭空多画了半张，而是补枪成功的动作数据本身把 `[摸到的牌, 被钓走的牌]` 两张都传进了动作区。
- 由于横屏对局里的动作牌卡槽只有 `48px` 宽，两张牌同时塞进去时就会自然露出“一张半”；这和用户想看的“补掉黑桃9就只显示黑桃9”不一致。
- 已把补枪成功后的动作区数据改成只保留真正被补掉的目标牌；如果是三张相同这类多目标补枪，仍会保留所有目标牌，不再混入补枪用掉的摸牌。
- 新增独立预览页 `artifacts/layout-check/action-stage-draw-capture-preview.html` 和截图 `artifacts/layout-check/action-stage-draw-capture-preview.png`，专门验证“补枪成功：成功钓走 黑桃9”时动作区只显示黑桃9。
- 同步更新缓存版本为 `20260614-draw-capture-target-only`，避免浏览器继续吃旧的 `app.js`。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成 `artifacts/layout-check/action-stage-draw-capture-preview.png`，确认动作区只显示单张黑桃9。

### 手牌随出牌逐步铺开

- 根据用户进一步要求，把手牌区从“只在几个状态间切换”继续收细成“随剩余手牌数量连续收放”的布局规则。
- 现在不是只区分“正常间距 / 贴边 / 重叠”三个离散结果，而是会在每次重算时先求当前宽度下的理想牌间距：
  - 如果还能保留原间距，就保持原样；
  - 如果放不下原间距，但还不需要重叠，就使用 `0 到原始 gap` 之间的动态间距；
  - 只有动态间距仍不够时，才进入重叠，并按剩余牌数重新计算更小的重叠量。
- 这样 `2 人 10 张` 在最挤时仍会重叠，但每出掉一张牌，剩余手牌都会自动再铺开一点；到足够宽松时，会先恢复成贴边，再恢复成正常间距。
- 同步更新缓存版本为 `20260614-hand-gap-relax`，让正式页和预览页都切到这一版 JS / CSS 引用。

验证：

- `node --check app.js` 通过。
- 预览页脚本已同步为与正式逻辑同一套“动态 gap -> 必要时才 overlap”的计算顺序。

### 真实对局页手牌重叠覆盖修复

- 根据用户最新反馈继续追查后确认：`2 人 10 张` 在真实对局页里最后两张仍被裁掉，不是手牌自适应算法没生效，而是后面的对局视图样式把通用重叠规则覆盖回去了。
- 具体根因是横屏对局专用块里存在 `body.is-game-view .hand-grid .card-btn { margin-left: 0; }`，会把前面 `.hand-grid.is-overlapped .card-btn` 的负间距抵消掉；结果就是 JS 已经算出应当重叠，但真实页面仍按不重叠排版，最后两张被裁切。
- 已在后面的 `body.is-game-view` 对局样式块里补齐更具体的 `.hand-grid.is-overlapped` / `.hand-grid.is-condensed` 规则，确保真实对局页也会保留负间距重叠、压缩态取消高低差、选中牌层级抬高。
- 同步更新了手牌布局预览页 `artifacts/layout-check/hand-layout-preview.html`，让它更贴近真实对局手牌区，并补出新的横屏预览截图 `artifacts/layout-check/hand-layout-preview-915x412.png`，方便直接看 `2 人 10 张自动重叠` 和 `3 人 7 张只贴边不重叠`。
- 更新缓存版本为 `20260614-hand-overlap-fix`；`index.html`、`artifacts/layout-check/public-area-preview.html`、`artifacts/layout-check/solo-resume-preview.html` 和 `artifacts/layout-check/hand-layout-preview.html` 都已切到新版本，避免设备继续吃旧 CSS。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 重新导出 `artifacts/layout-check/hand-layout-preview-915x412.png`。
- 预览确认：
  - `2 人 10 张` 已进入重叠展示，不再少最后两张
  - `3 人 7 张` 仍为贴边完整展示，不额外重叠

### 手牌区自动贴边 / 重叠适配

- 按最新反馈把手牌区改成了“能完整展示时不重叠，展示不下时再重叠”的自适应规则，而不是固定让 2 人局横向滚动。
- 具体逻辑是：先尝试保留原本间距；放不下时先把间距压到 0，让牌与牌贴边；如果贴边后仍放不下，再自动计算需要的重叠量。
- 只有在压到贴边或重叠后已经可以完整展示时，才会关闭横向滚动；如果极端宽度下即使重叠仍不够，才保留滚动作为兜底。
- 这套逻辑直接作用于共享的本地手牌区，所以单机 2 人、好友联机 2 人，以及其他模式下的本地手牌展示都会一起受益。
- 新增了手牌布局专用预览页 `artifacts/layout-check/hand-layout-preview.html`，用来并排验证 `2 人 10 张自动重叠` 和 `3 人 7 张只贴边不重叠` 两种场景。
- 更新缓存版本为 `20260614-hand-layout-auto-fit`；`index.html`、`artifacts/layout-check/public-area-preview.html`、`artifacts/layout-check/solo-resume-preview.html` 和新的 `artifacts/layout-check/hand-layout-preview.html` 都已切到新版本。

验证：

- `node --check app.js` 通过。
- 本地静态服务 `http://127.0.0.1:4173/` 可访问。
- 使用本机浏览器预览页导出 `artifacts/layout-check/hand-layout-preview.png`，确认：
  - `2 人 10 张` 为自动重叠且无需横向滚动
  - `3 人 7 张` 为贴边完整展示且不重叠

### 道风轻量视觉美化

- 按用户要求保持布局和功能不变，只对整体视觉皮肤做了一轮轻量道风美化，方向参考 `daoist_poker_deck`，但避免走重特效。
- 全局主题色调整为更克制的 `深青 + 暖金 + 米纸 + 少量朱砂`；统一了标题字体气质、面板层次、按钮质感和牌桌底色。
- 扑克牌继续保持当前 CSS 牌结构，没有重新接入图片牌，只把牌面调成更接近米纸卡、细边框、暖色阴影的质感。
- 社交区、规则弹窗、欢乐豆弹窗、骰子结果卡等共享面板同步收口到同一套视觉语言。
- 更新缓存版本为 `20260614-daoist-ui-polish`；`artifacts/layout-check/public-area-preview.html` 和 `artifacts/layout-check/solo-resume-preview.html` 同步切到新缓存版本。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成：
  - `artifacts/layout-check/daoist-ui-id-setup-preview.png`
  - `artifacts/layout-check/daoist-ui-lobby-preview.png`
  - `artifacts/layout-check/daoist-ui-table-preview.png`

## 2026-06-10

### 创建游戏 ID 页面统一到登录 / 大厅风格

- 原来的 `创建游戏 ID` 页面还停留在旧的浅色 setup 样式，和已经更新过的登录页 / 大厅风格割裂。
- 为 `setup-panel.is-id-setup-mode` 补上深色半透明卡片、深色输入框、金色主按钮和统一的顶部账号区样式。
- 在 `max-width: 960px` 横屏场景下，创建 ID 页改成与大厅同语言的全屏布局：左上标题说明、左侧输入卡与主按钮、右上退出登录 / 状态说明。
- 这轮没有改 `创建 ID` 流程逻辑，只统一界面表现。
- 更新缓存版本为 `20260610-id-setup-ui`；`artifacts/layout-check/solo-resume-preview.html` 同步使用新缓存版本。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成 `artifacts/layout-check/id-setup-ui-preview.png`（`915 x 412`，触屏横屏）和 `artifacts/layout-check/id-setup-ui-desktop-preview.png`（`1366 x 768`），确认创建 ID 页已切到新的视觉风格。

### 单机局支持从大厅返回或关闭

- 给本地单机对局补上了可挂起状态：从对局点击“回到大厅”后，不再只能丢失现场，而是会在大厅单机模式里保留一个可恢复入口。
- 大厅右侧动作区现在会在单机模式下显示 `返回对局` 和 `关闭对局`，表现方式与好友房的返回入口保持同一块区域，避免用户切换心智模型。
- 当存在未结束的单机对局时，大厅主按钮会显示为 `单机进行中` 并禁用，防止用户误点“开始游戏”直接覆盖当前单机局。
- 继续补齐联机侧限制：如果当前还有未关闭的单机对局，现在也不能切到 `好友联机`、不能创建好友房、不能接受好友房邀请，规则与“好友房未关闭时不能开单机”保持对称。
- 好友联机标签、创建好友房按钮、房间邀请接受按钮都会显示对应的锁定状态文案，避免看起来像“按钮失灵”。
- 恢复逻辑覆盖了 `human-turn`、`ai-turn`、`dice-rolling`、`dice-result` 和 `opening-deal`；关闭逻辑会清空当前挂起的本地单机对局状态。
- 修正了首版动作区高度不够导致 `关闭对局` 被裁掉的问题：单机提示压缩为一行，`返回对局` / `关闭对局` 改成并排显示。
- 修复了一个后续回归：关闭单机对局后，右侧社交面板里的好友房邀请按钮有时还停留在 `先关闭单机对局`。现在社交面板缓存签名会纳入单机挂起状态，同时在挂起状态切换时主动清空社交缓存，邀请列表会立即刷新回可接受状态。
- 更新缓存版本为 `20260610-solo-lock-refresh`。

验证：

- `node --check app.js` 通过。
- 使用本机 Chrome headless 模拟“大厅内存在好友邀请 + 当前有挂起单机局”，确认点击 `关闭对局` 后，邀请按钮会立即从 `先关闭单机对局` 切回 `查看邀请`。
- 新增本地预览辅助页：`artifacts/layout-check/solo-resume-preview.html`，可直接复现“单机开局 -> 回到大厅 -> 大厅显示返回/关闭入口”的界面状态。

## 2026-06-07

### 扑克牌内部图案分离

- 按用户补充说明修正牌面内部布局：这次重点不是牌与牌之间，而是左上角点数/小花色和右下角大花色不要挤在一起。
- `.card-corner` 改为绝对定位贴近牌面左上角，`.card-center-suit` 继续固定在右下角；公共牌和手牌尺寸略放大，同时缩小小牌上的点数、角标花色和右下大花色，避免小视口里三组图案互相覆盖。
- 触屏横屏下公共牌宽度调整为 `clamp(44px, 4.8vw, 48px)`，手牌宽度调整为 `clamp(54px, 5.7vw, 62px)`；2 人局 10 张手牌仍通过横向滚动容纳。
- 缓存版本更新为 `20260607-card-symbol-spacing`；`artifacts/layout-check/public-area-preview.html` 同步使用新缓存版本。
验证：
- `node --check app.js` 通过。
- 内置浏览器确认真实页面加载 `styles.css?v=20260607-card-symbol-spacing` 与 `app.js?v=20260607-card-symbol-spacing`，`.card-face` 数量为 0。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 4 人 `915 x 412`、4 人 `844 x 390`、2 人 `915 x 412`；三组均为 `tableMetrics.overlap: false`、`handMetrics.overlap: false`、`symbolMetrics.tableOverlap: false`、`symbolMetrics.handOverlap: false`。截图为 `artifacts/layout-check/real-index-card-symbol-spacing-4p-915x412.png`、`artifacts/layout-check/real-index-card-symbol-spacing-4p-844x390.png`、`artifacts/layout-check/real-index-card-symbol-spacing-2p-915x412.png`，记录为 `artifacts/layout-check/card-symbol-spacing-check.json`。

## 2026-06-09

### 公共牌区多牌自动扩宽

- 按用户对红框两侧留白的反馈，继续优化四人横屏对局里的公共牌区，不再让 13 张以上公共牌白白挤成更高的三行。
- 公共牌布局改为按数量自动扩宽：
  - `13-14 张` 自动按 7 列展开
  - `15 张及以上` 自动按 8 列展开
  - 只有 `17 张及以上` 真正进入 3 行时，才切换为贴顶排布，避免第一行被裁掉
- 这次没有继续缩小牌面，也没有往公共牌区两侧塞额外文案或按钮，只利用原本浪费掉的横向空间。
- 缓存版本更新为 `20260609-public-area-columns`；`artifacts/layout-check/public-area-preview.html` 同步使用新缓存版本。

验证：

- `node --check app.js` 通过。
- 本地静态服务 `http://127.0.0.1:4173/` 已确认可访问。
- 使用本机 Chrome 触屏横屏 `915 x 412` 对预览页做真实截图验证：
  - `artifacts/layout-check/public-area-13-expanded-915x412.png`
  - `artifacts/layout-check/public-area-15-expanded-915x412.png`
- 两张图分别确认了 `13 张 = 7 + 6`、`15 张 = 8 + 7` 的排布，公共牌确实开始利用左右留白扩宽，而不是继续向上堆第三行。

### 简洁斗地主式 CSS 扑克牌面

- 按用户参考图继续优化原本 CSS 牌面：牌面只保留点数/字母和红黑花色图案，去掉“钓牌 / 计分”等说明文字，说明信息保留在按钮 `aria-label` 中。
- 牌面改为白色扑克牌底、细边框、小圆角、轻微阴影和大号花色角标；红桃/方块使用红色，黑桃/梅花使用深色。
- 手牌取消负间距重叠，能排开时完整排开；2 人局 10 张手牌在手机横屏中放不下时改为横向滚动，不再互相压住。
- `artifacts/layout-check/public-area-preview.html` 同步更新为新牌面结构；缓存版本更新为 `20260607-clean-poker-cards`。
验证：
- `node --check app.js` 通过。
- 内置浏览器确认真实页面加载 `styles.css?v=20260607-clean-poker-cards` 与 `app.js?v=20260607-clean-poker-cards`，入口页无 `.card-face` / `.card-top` 旧牌元素。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 4 人 `915 x 412`、4 人 `844 x 390`、2 人 `915 x 412`；三组截图均为 `cardFaceCount: 0`，4 人手牌 `overlap: false`，2 人 10 张手牌 `overlap: false` 且通过横向滚动容纳。截图为 `artifacts/layout-check/real-index-clean-poker-cards-4p-915x412.png`、`artifacts/layout-check/real-index-clean-poker-cards-4p-844x390.png`、`artifacts/layout-check/real-index-clean-poker-cards-2p-915x412.png`，记录为 `artifacts/layout-check/clean-poker-cards-check.json`。

### 恢复原本 CSS/文字扑克牌面

- 按用户要求撤回 `2f6a179 Add daoist card faces` 的图片牌接入，当前对局牌面回到原本的 CSS/文字扑克牌样式，不再加载 `assets/cards/daoist/`。
- `createCardButton()` 已恢复为花色符号、点数、钓牌值和计分值的原结构；`.card-face` 图片元素和对应样式已移除。
- 删除此前道风图片牌资源、道风牌验证 JSON 和对应截图，避免当前版本继续被误认为使用新设计牌面。
- 缓存版本更新为 `20260607-original-card-faces`；同步脚本继续跟踪 `artifacts/layout-check`，方便后续预览截图随 GitHub 同步，但不再把 `assets/cards/daoist` 作为当前发布资源。
验证：
- `node --check app.js` 通过。
- 内置浏览器确认真实页面加载 `styles.css?v=20260607-original-card-faces` 与 `app.js?v=20260607-original-card-faces`，且入口页 `.card-face` 数量为 0。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 4 人横屏 `915 x 412` 与 `844 x 390`，两次均为 `cardFaceCount: 0`、`cardButtonCount: 17`、阶段进入 `human-turn`；截图为 `artifacts/layout-check/real-index-original-cards-4p-915x412.png`、`artifacts/layout-check/real-index-original-cards-4p-844x390.png`，记录为 `artifacts/layout-check/original-card-faces-check.json`。

### 四人横屏骰子布局修正

- 新增 `is-dice-view` 页面状态，只在 `dice-rolling` / `dice-result` 阶段启用骰子专用布局，避免影响发牌后正常牌桌。
- 手机横屏骰子阶段隐藏空的公共牌外框，避免 4 人模式骰子压在“公共牌区暂时没有明牌”提示上。
- 将骰子压缩为更小的徽章式显示：上方三名对手各自贴近自己的玩家卡，本地玩家骰子居中放在下方但不压到底部手牌面板。
- 骰子阶段底部手牌区空状态文案改为“等待摇骰子结果”，不再显示“你的手牌已经出完”。
- 缓存版本更新为 `20260607-dice-layout-4p`。
验证：
- `node --check app.js` 通过。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 4 人 `915 x 412`、4 人 `844 x 390`、2 人 `915 x 412` 骰子结果阶段；截图为 `artifacts/layout-check/real-index-dice-layout-4p-915x412.png`、`artifacts/layout-check/real-index-dice-layout-4p-844x390.png`、`artifacts/layout-check/real-index-dice-layout-2p-915x412.png`。
- 额外验证 4 人 `915 x 412` 发牌完成后公共牌外框恢复可见，截图为 `artifacts/layout-check/real-index-dice-layout-4p-active-915x412.png`。

### 手机横屏公共牌外框收窄

- 将手机横屏对局页公共牌大外框的左右安全边距从 `clamp(88px, 10.8vw, 102px)` 加大到 `clamp(144px, 17vw, 170px)`，让 4 人模式左右/上方玩家座位有独立空间，不再被公共牌外框抢占。
- 公共牌本体 `.table-cards` 仍保持居中排布，只收窄承载背景大框，不改变底部三块对齐结构。
- 缓存版本更新为 `20260607-public-frame-narrow`。
验证：
- `node --check app.js` 通过。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 2 人 `915 x 412`、4 人 `915 x 412`、4 人 `844 x 390`；截图为 `artifacts/layout-check/real-index-public-frame-narrow-2p-915x412.png`、`artifacts/layout-check/real-index-public-frame-narrow-4p-915x412.png`、`artifacts/layout-check/real-index-public-frame-narrow-4p-844x390.png`。

### 手机横屏对局底部整行压缩

- 将手机横屏真实对局页的底部共同高度从 `184px` 压缩到 `160px`，减少中间手牌区上方空白，同时继续让左侧牌堆区、中间手牌区、右侧最近动作/指标区保持同高对齐。
- 右侧最近动作的 JS 固定高度改为按实际手牌面板高度计算，不再沿用上一轮较高的动作框高度。
- 修正三张指标卡在压缩后被旧 `grid-area` 静态位置带偏的问题，显式让它贴住底部，避免被视口裁掉。
- 缓存版本更新为 `20260607-bottom-band-compact`。
验证：
- `node --check app.js` 通过。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 验证 `915 x 412` 与 `844 x 390`；截图为 `artifacts/layout-check/real-index-bottom-band-compact-915x412.png`、`artifacts/layout-check/real-index-bottom-band-compact-844x390.png`。
- 内置浏览器打开本地真实页面，确认加载 `styles.css?v=20260607-bottom-band-compact` 与 `app.js?v=20260607-bottom-band-compact`。

## 2026-06-04

### 真实对局页右侧最近动作改为 JS 固定

- 用户清空缓存并硬性重新加载后，真实 `index.html` 对局页仍未显示右侧最近动作；确认此前截图验证用的是 `public-area-preview.html`，不能完全代表真实对局页。
- 新增 `syncLandscapeActionPanel()`：在每次游戏渲染和窗口尺寸变化后，直接按右下三张指标卡的位置，把 `.action-stage` 以内联 important 样式固定到指标卡上方。
- 这次不再改公共牌、手牌、对手区等整体布局，只对最近动作框、文字区和动作牌区做显示与定位修正，避免再次把牌桌上方压坏。
- 缓存版本更新为 `20260604-landscape-js-pin`。
验证：
- `node --check app.js` 通过。
- 使用真实 `index.html`、本机 Chrome + Playwright、`isMobile: true`、`hasTouch: true` 分别验证 `915 x 412` 与 `844 x 390`；开局动画结束后的正式回合截图为 `artifacts/layout-check/real-index-js-pin-active-915x412.png`、`artifacts/layout-check/real-index-js-pin-active-844x390.png`，两张图均确认右侧最近动作固定在三张指标卡上方。
- 内置浏览器打开本地真实页面，确认当前加载 `styles.css?v=20260604-landscape-js-pin` 与 `app.js?v=20260604-landscape-js-pin`。

### 横屏右侧最近动作最终覆盖顺序修正

- 确认上一轮兜底规则仍放在后续触屏横屏规则之前，导致在 `915 x 412` 这类预览尺寸里继续被后面的 `.action-stage` 规则覆盖；这是实现顺序问题，不是用户设备或操作问题。
- 将最终覆盖规则补到 `styles.css` 文件末尾，确保普通横屏和触屏横屏都不会再覆盖右侧最近动作显示。
- 清理掉此前误加的整套横屏强制布局，避免预览图里公共牌和对手区被压坏；只保留文件末尾针对右侧最近动作的最小覆盖。
- 缓存版本更新为 `20260604-landscape-preview-verified`。
验证：
- `node --check app.js` 通过。
- 使用本机 Chrome + Playwright 系统浏览器、`isMobile: true`、`hasTouch: true` 生成并检查 `artifacts/layout-check/chrome-final-915x412.png` 与 `artifacts/layout-check/chrome-final-844x390.png`，两张图里右侧最近动作文字和动作牌均可见，公共牌区未被压坏。

### 横屏预览模式兜底显示右侧最近动作

- 确认 Chrome 响应式预览和真实触屏横屏会命中不同媒体条件；之前主要改了触屏专用分支，导致用户当前电脑 DevTools 的 `844 x 390` 响应式预览看起来几乎没变化。
- 在 CSS 文件末尾新增 `body.is-game-view` 横屏兜底规则，统一普通横屏和触屏横屏下的底部三栏牌桌：左侧牌堆、中间手牌、右侧最近动作 + 三张指标卡。
- 右侧最近动作强制显示文字区和动作牌区，并固定为左文字、右牌两列，避免再次出现空框。
- 缓存版本更新为 `20260604-landscape-action-visible`。
验证：
- `node --check app.js` 通过。
- 使用本机 Chrome headless 生成 `artifacts/layout-check/chrome-after-landscape-fallback-844x390.png`，确认 `844 x 390` 预览里右侧最近动作和动作牌可见。

### 横屏小视口右侧最近动作内容锁定

- 继续修正右侧最近动作外框有了但内容不可见的问题：右侧动作框内部不再使用上下自动网格，而是固定为左侧文字、右侧动作牌的两列布局。
- 显式重置最近动作文字区和牌区的 `visibility`、`opacity`、`transform`，并把牌区固定到右列，避免内容被裁到不可见区域。
- 缓存版本更新为 `20260604-right-panel-content-locked`。
验证：
- `node --check app.js` 通过。

### 横屏小视口右侧最近动作锁定到右栏

- 针对再次实机反馈，确认问题不是最近动作内容本身，而是它仍参与底部网格排版时会被中间手牌面板覆盖/错位到手牌上方。
- 现在在触屏横屏对局布局里，`action-stage` 改为绝对定位：固定贴在右侧栏，位于三张指标卡上方，不再参与中间手牌区网格挤压，避免文字和动作牌跑到手牌面板上。
- 缓存版本更新为 `20260604-right-panel-locked`。
验证：
- `node --check app.js` 通过。

### 横屏小视口右侧最近动作避免被手牌面板裁切

- 继续根据实机截图修正上一轮不足：右侧“最近动作”虽然恢复，但左侧文字和动作牌仍被中间手牌面板压住，视觉上像只露出半块。
- 现在右侧信息层在触屏横屏牌桌里提升到手牌面板之上，右侧栏宽度放大到 `244px - 278px`，中间手牌区相应让位；最近动作内容改为左上正常排版，动作牌缩小一点，底部三张指标卡仍固定在右侧底部。
- 更新 `index.html` 和预览页缓存版本为 `20260604-right-panel-unclipped`。
验证：
- `node --check app.js` 通过。
- 由于本机内置浏览器不能命中真实手机的 `(pointer: coarse)` 条件，本轮最终视觉仍以手机横屏实机截图为准。

### 横屏小视口恢复右侧最近动作并下沉左侧牌堆

- 根据实机截图反馈，调整手机横屏对局底部三分区：左侧牌堆视觉和张数整体下移一点，避免贴近上方状态文案；右侧重新为“最近动作”保留上半块空间，下方继续保留当前出牌、已选台面牌、判定目标三张指标卡。
- 右侧动作面板从被底部指标卡挤没的状态改为固定占用右侧栏上方空间，三张指标卡固定在右侧栏底部，确保类似图三的最近动作、说明文字和动作牌仍可显示。
- 更新 `index.html` 和 `artifacts/layout-check/public-area-preview.html` 的样式 / 脚本缓存版本为 `20260604-right-action-restored`，避免继续命中旧缓存。
验证：
- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/` 已启动；内置浏览器确认新版预览页加载 `styles.css?v=20260604-right-action-restored`。内置浏览器无法模拟 `(pointer: coarse)`，所以本轮触屏横屏视觉仍需以真机截图最终确认。

### 横屏小视口对局改为“四区牌桌”并恢复正常牌型比例

- 按最新要求重做了 `max-width: 960px`、横屏、触屏场景下的对局布局，不再沿用“公共牌区 + 右侧长条信息栏”的挤压结构。
- 现在手机横屏对局改成四块更明确的区域：中间大框只放公共牌区；最下方整条面板放手牌和 3 个操作按钮；左下小框承载状态提示和牌堆；右下小框承载最近动作。
- 同时把公共牌、最近动作展示牌和手牌都改回接近正常扑克牌比例，不再出现“又矮又胖”的卡面；公共牌区标题在该模式下隐藏，让中间大框优先让给牌面本身。
- 底部手牌区同步补了一轮高度回收，确保 `915 x 412` 和 `844 x 390` 这类安卓横屏视口下，三按钮和整排手牌都能完整出现在一屏里，不再出现下半截被裁掉。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260604-game-four-box`，并同步更新 `artifacts/layout-check/public-area-preview.html` 的样式引用，避免继续命中旧缓存。
验证：
- `node --check app.js` 通过。
- 使用 Chromium DevTools Protocol 真移动端仿真验证 `matchMedia('(hover: none)')`、`matchMedia('(pointer: coarse)')`、`(orientation: landscape)`、`(max-width: 960px)` 均命中。
- 导出并检查了 `artifacts/layout-check/mobile-layout-915x412.png` 和 `artifacts/layout-check/mobile-layout-844x390.png`。

### 横屏小视口公共牌区改为内容自适应牌阵

- 在继续看实机截图后，确认“畸形感”的核心不是公共牌区单纯偏大，而是横屏小视口里公共牌网格被写成了 `1fr` 式的整块拉伸，两排牌被硬拽到上下两层，中间空出大块无意义留白。
- 现在把对应布局改成内容自适应牌阵：公共牌区本身不再一路拉到底，公共牌区内部改为 `auto + 1fr`，牌区主体使用居中容器，公共牌网格改回固定 `44px` 行高并使用 `align-content: center`，让两排牌作为一个整体自然聚在桌面中部，而不是被撑散。
- 同时把横屏小视口右侧动作区继续放宽到 `clamp(220px, 25vw, 236px)`，并把公共牌区底边上收、两栏间距扩大到 `14px`，让公共牌区和右侧动作区的关系更接近正常牌桌。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260604-game-public-grid`，强制浏览器拉取这一轮修正后的样式。
验证：
- `node --check app.js` 通过。
- 按当前样式公式估算，`915px` 横屏宽度下右侧动作区约为 `228.75px`，公共牌区约为 `558.25px`，两栏固定间距为 `14px`。

### 横屏小视口牌桌继续收紧公共牌区，放大右侧动作区

- 根据后续截图确认，上一次调整主要落在桌面牌桌基线样式，而用户实际测试的是 `915 x 412` 这类横屏小视口牌桌；这次继续改到对应的 `max-width: 960px` 横屏游戏布局本身。
- 现在横屏小视口牌桌内，公共牌区会为右侧动作栏预留 `12px` 固定间距，并把右侧 `center-stage` 宽度从原来的固定 `174px` 放大为 `clamp(196px, 23vw, 214px)`；公共牌区同步缩窄、头部字号略缩、公共牌网格行高和内边距也一并收紧，减少右侧“最近动作”文案挤压和重叠。
- 同步压缩右侧反馈条、最近动作卡和摸牌区的字体、padding 与动作卡尺寸，避免单条中文提示在窄横屏里把整个右侧面板挤坏。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260604-game-side-lane`，强制浏览器重新拉取这轮样式。
验证：
- `915px` 宽度下，横屏小视口牌桌的右侧动作区理论宽度由 `174px` 提升到约 `210px`，公共牌区宽度相应由约 `615px` 收到约 `579px`，两者之间固定保留 `12px` 间距。
- 本地静态预览已生成 `artifacts/layout-check/public-area-915x412-after.png` 用于人工检查。

### 桌面牌桌公共牌区收紧，给右侧动作区留白

- 根据最新反馈继续微调桌面牌桌：把公共牌区宽度从 `min(560px, calc(100% - 680px))` 收紧为 `min(520px, calc(100% - 720px))`，让右侧 `center-stage` 在较窄桌面窗口下也能稳定留出固定间距，减少和“桌面中央 / 最近动作 / 判定目标”区域贴边甚至视觉重叠。
- 同步收紧公共牌区内边距、最小高度和桌面端公共牌网格的最小行高与卡牌间距，避免公共牌区在桌面缩放场景里显得过大、继续把右侧信息区压得很紧。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260604-game-public-area`，避免浏览器继续使用旧样式缓存。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/` 返回 200。
- 按当前桌面牌桌样式公式验算，窗口宽度为 `1121 / 1163 / 1240 / 1280px` 时，公共牌区与右侧 `center-stage` 的水平间距分别为 `16 / 16 / 16 / 36px`，不再像之前那样在临界宽度下贴边。

### 对局页桌面窄窗口改为整桌等比例缩小

- 修正桌面浏览器在较窄横向窗口下，对局页误切到“手机横屏专用牌桌”布局的问题；之前会把桌面牌桌压成一套过于拥挤的紧凑布局，观感接近你截图里的图1。
- 现在把这套紧凑横屏牌桌限制为真正的移动端触控场景使用；桌面窄窗口则继续沿用图2那种完整桌面牌桌，并通过 `updateGameLayoutScale()` 做整桌等比例缩小。
- 同时放开对局页自动缩放在桌面窄窗口下的生效条件，让桌面牌桌在较小可视区也能整体收进视口，而不是提前切成手机布局。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260604-game-desktop-scale`，避免浏览器继续使用旧缓存。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/` 返回 200。
- 使用 Edge 无头浏览器验证：
  - 桌面窄窗口 `930 x 560` 下，对局页 `#play-stage` 缩放为 `0.56`，`status-strip` 仍为 `grid`，顶部标题区仍显示，说明使用的是“桌面牌桌 + 等比例缩小”。
  - 手机横屏 `844 x 390` 触控上下文下，对局页不再使用桌面缩放，`status-strip` 为 `none`，仍保持原手机横屏紧凑牌桌。

## 2026-06-03

### 开始同步脚本补上工作目录回铺

- 修正旧结构跨电脑协作里 `start-dev.cmd` / `tools/sync-start.ps1` 只会对 `_github_repo` 执行 `git pull --ff-only`、却不会把最新文件同步回当前工作目录的问题。
- 现在在 legacy 模式下，开始同步除了拉取 GitHub 最新提交，还会把跟踪文件从 `_github_repo` 回铺到项目根目录，并同步刷新 `_github_upload`，避免“看起来已经同步，其实工作目录仍是旧版本”。
- 这次同步后，本机工作目录已确认和 `_github_repo` 一致，可直接继续在根目录开发。
验证：
- 运行 `start-dev.cmd` 后，`_github_repo` 已从 `46d4f2b` 快进到 `849d1fc`。
- 对比 `app.js`、`styles.css`、`index.html`、`docs/`、`FEATURE_LOG.md` 的文件摘要，项目根目录与 `_github_repo` 已一致。

## 2026-06-01

### 跨电脑开发交接文档

- 新增 `docs/HANDOFF.md`，作为公司电脑、家里电脑和新 Codex 会话之间的固定交接入口。
- 新增 `tools/sync-start.ps1`、`tools/sync-finish.ps1` 及对应 `.cmd` 包装器，把“开始前同步最新代码 / 改完后检查并同步到 GitHub”固化为两台电脑都能直接复用的脚本入口。
- 新增项目根目录一键入口 `start-dev.cmd`、`finish-dev.cmd`，可直接双击运行，不需要再手动 `cd` 到项目目录或进入 `tools/`。
- 新增 `enable-auto-start-sync.cmd`、`disable-auto-start-sync.cmd` 以及对应 PowerShell 脚本，可把“开始前同步”注册为 Windows 登录后的自动启动动作。
- 文档内记录了新会话必读文件、固定口令、GitHub 跨电脑同步流程、脚本入口、当前项目快照、可继续方向和测试方式。
- 更新 `docs/PROJECT_STATUS.md`，把 `docs/HANDOFF.md`、`tools/` 和 `agent.md` 纳入上传范围和后续记录规则；同时把固定口令写进 `agent.md` 顶部，作为项目内协作约定。
- `tools/sync-finish.ps1` 的提交清单已补充 `start-dev.cmd`、`finish-dev.cmd`，确保根目录一键入口本身也会跟着自动同步到 GitHub。
验证：
- `node --check app.js` 通过。
- `tools/sync-start.ps1` 实际执行 `git pull --ff-only` 通过。
- `start-dev.cmd` 成功调用开始同步脚本。
- 自动开始同步安装脚本可正常创建和移除启动项快捷方式。
- 确认交接文档和脚本未记录 API Key、密码、Token、Cookie 或真实密钥。

## 2026-06-02

### 手机横屏大厅顶部账号区调整

- 账号信息浮层去掉“联机门票”说明，改为展示 2 / 3 / 4 人三种模式的战绩摘要：累计积分、局数、胜场和单局最高；底部保留当前榜单模式的上一局分数。
- 恢复移动端大厅右上角 `ID: 当前游戏ID` 的账户信息入口：点击顶部 ID 会复用旧的账号信息浮层，显示当前 ID 和三种模式战绩；横屏大厅下浮层固定在右上角 ID 下方，并改为深色半透明面板。
- 邮箱登录 / 注册表单改为和大厅、欢乐豆中心一致的深色半透明游戏面板；输入框、记住邮箱行、登录/注册/收起按钮统一为深色金边风格。
- 顶部欢乐豆资源条改为更接近斗地主的金豆样式：左侧显示金豆圆标和小 `+`，右侧只显示紧凑数字，不再显示一长串“欢乐豆”文字。
- 欢乐豆中心弹窗改为深色半透明游戏面板，使用金色标题、金豆余额条和深色奖励卡片，画风更贴近大厅与规则弹窗；手机横屏下同步压缩弹窗尺寸，避免内容显得像独立浅色网页。
- 按当前测试截图调整手机横屏大厅顶部信息层：左上角保留“游戏大厅”头像标题块，并把“已进入游戏大厅，可以开始单机或好友房”等状态白字移到该标题块下方，不再占用右上角空间。
- 右上角改为更接近参考图的账号区，新增 `ID: 当前游戏ID` 文本位，并与“退出登录”按钮横向排列；大厅横屏下隐藏原右上角状态文案。
- 同步放大左上角头像圆徽和“游戏大厅”标题，右上角退出按钮改成金边深色胶囊风格。
- 修正 844 x 390 手机横屏下中间“好友联机”模式卡和底部“好友联机 / 查看规则”操作条向右侧好友列表重叠的问题；中间区域现在按左侧流程列和右侧好友/排行榜栏之间的可用通道定位，不再按整屏居中。
- 修正左上角大厅状态白字被单行省略号截断的问题；标题块略微加宽加高，状态文案允许最多两行显示。
- 根据实测反馈回收左上角标题块高度，避免两行状态文案压住下方搜索框；大厅状态改为更短的“可开始单机或好友房”，保持单行显示。
- 按测试反馈恢复左上角标题块到更早的紧凑宽度，只把下方状态文案改为“可开始单机或好友联机”。
- 更新 `index.html` 中 `styles.css` / `app.js` 缓存版本为 `20260602-id-stats-modes`。
- 同步补充项目协作约定：后续 Codex 每次改完按公司电脑格式补齐记录文档，并自动检查、提交、推送到 GitHub。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/` 页面可加载新版 `styles.css?v=20260602-id-stats-modes` 和 `app.js?v=20260602-id-stats-modes`，控制台无错误。

### 邀请同步补刷与前台恢复兜底

- 针对“房间邀请已经发出，但被邀请人要隔一段时间才看到”的问题，补了一层邀请同步兜底。
- 社交区原本主要依赖 Firestore `onSnapshot` 实时监听；这条链路正常时很快，但在页面刚从登录入口切进大厅、浏览器标签页切到后台再回来，或监听偶发慢半拍时，体感上会像“邀请迟到”。
- 现在进入大厅时会立刻主动刷新一次社交数据；页面回到前台或窗口重新聚焦时，也会马上补刷邀请、好友申请和当前房间状态。
- 同时新增轻量级周期补刷，并把并发的 `refreshSocialData()` 调用做了合并，避免多个监听同时触发时互相堆积，让邀请列表和邀请弹窗更快收敛到最新状态。
- 更新 `index.html` 中 `app.js` 版本参数为 `20260602-social-refresh-fallback`，避免浏览器继续使用旧缓存。
验证：
- `node --check app.js` 通过。

### 当前对局改为大厅后再手动进入

- 修正“刚登录或刚刷新时，还没真正进入游戏大厅，就被自动拉进当前联机对局”的问题。
- 原因和之前邀请弹窗类似：`refreshSocialData()` 只要发现当前房间 `status === "playing"`，就会直接 `applyMultiplayerRoomState(...)`，没有区分“只是刚登录”还是“已经在大厅准备返回对局”。
- 现在只有当玩家本来就已经处于联机对局同步状态时，才允许自动同步回对局；刚登录、刚刷新、刚进入大厅时，只保留“返回对局”入口，不再强制跳进游戏。
- 更新 `index.html` 中 `app.js` 版本参数为 `20260602-lobby-room-gate`，避免浏览器继续使用旧逻辑缓存。
验证：
- `node --check app.js` 通过。

### 规则弹窗缩小并统一成大厅画风

- 修正大厅里点击“查看规则”后弹出的规则面板过大、且与当前深色大厅画风差异明显的问题。
- 规则弹窗改为更紧凑的深色半透明面板，边框、阴影、按钮和标题配色统一向大厅与房间邀请弹窗靠拢，不再使用大面积浅色卡片风格。
- 将英文 `Quick Guide` 改为中文“规则说明”，底部按钮文案改为“我知道了”，减少出戏感。
- 规则条目改为更紧凑的两列布局，并同步下调内边距、字号和块间距，避免弹窗像整页说明面板一样铺满屏幕。
- 更新 `index.html` 中 `styles.css` 版本参数为 `20260602-rules-modal-unified`，避免浏览器继续使用旧样式缓存。
验证：
- 本地 `http://127.0.0.1:4173/` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260602-rules-modal-unified` 和 `app.js?v=20260602-room-close-fix`，控制台无错误。

### 大厅中间模式卡越界排查与收紧

- 针对手机横屏大厅中间“单机 / 好友联机”模式卡继续做了一轮整体越界排查，不再只修单个按钮。
- 收紧了模式卡内部的高度预算：标签按钮、左右列间距、右侧“启用摇骰子定先手”框、右侧房间操作按钮、左侧房间信息卡内边距、创建房间按钮高度与字号都同步下调。
- 补充了大厅模式卡内部的 `overflow` 约束与文本省略规则，避免“当前成员”和“创建 2 / 3 / 4 人房”这类较长内容把卡片底边撑破。
- 更新 `index.html` 中 `styles.css` 版本参数为 `20260602-lobby-overflow-audit`，避免浏览器继续使用旧样式缓存。
验证：
- 本地 `http://127.0.0.1:4173/` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260602-lobby-overflow-audit` 和 `app.js?v=20260602-room-close-fix`，控制台无错误。

### 关闭房间改为不依赖单文档读取

- 修正“大厅里能看到自己是房主，但点击关闭房间无效”的一类问题。
- 原因是关闭/退票流程之前依赖对 `rooms/{roomId}` 做单文档读取；在部分 Firestore 规则配置下，列表查询能拿到房间，但 `doc(roomId).get()` 会被 `permission-denied` 拦住，导致关闭房间卡在中途。
- 现在关闭房间、离开房间、关闭后当前用户退票这几步都改为基于大厅里已经拿到的房间快照直接批量写回，不再额外先读一次房间文档。
- 更新 `index.html` 中 `app.js` 版本参数为 `20260602-room-close-fix`，避免浏览器继续使用旧逻辑缓存。
验证：
- `node --check app.js` 通过。

### 好友联机模式卡收纳房间操作按钮

- 修正手机横屏大厅里，中间“好友联机”模式卡的房间操作按钮可能顶出卡片边界的问题。
- 现在好友联机模式改为右侧竖向操作区：上方保留“启用摇骰子定先手”，下方单独承载“关闭房间 / 离开房间 / 开始联机 / 返回对局”等按钮；左侧房间卡只显示房间信息，不再被操作按钮撑宽。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260602-lobby-room-actions`，避免继续命中旧布局缓存。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260602-lobby-room-actions` 和 `app.js?v=20260602-lobby-room-actions`。

### 房间邀请弹窗改为大厅后再显示

- 修正登录成功后、尚未真正进入游戏大厅时就提前弹出房间邀请的问题。
- 现在房间邀请弹窗只会在“已登录、已绑定游戏 ID、已经进入大厅”这三项都满足时显示；若邀请更早到达，会先保留，等玩家进入大厅后再弹出。
- 更新 `index.html` 中 `app.js` 版本参数为 `20260602-lobby-invite-gate`，避免浏览器继续使用旧逻辑缓存。
验证：
- `node --check app.js` 通过。

## 2026-05-28

### 手机横屏大厅模式卡高度固定

- 固定中间“单机 / 好友联机”模式卡片高度，按当前“好友联机”的尺寸锁定为 146px，避免切换到“单机”时卡片变矮、再切回时跳动。
- 单机模式内容继续在同一固定框内居中显示；好友联机模式继续显示创建 2 / 3 / 4 人房与摇骰子开关。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260528-lobby-mode-fixed`。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/index.html?verify=lobby-mode-fixed-local` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260528-lobby-mode-fixed` 和 `app.js?v=20260528-lobby-mode-fixed`。
- Edge 844×390 安卓横屏预览测量：单机和好友联机两个状态的中间模式卡均为 412×146，切换前后不再改变大小。

### 手机横屏大厅模式切换

- 右侧“好友列表 / 排行榜”固定外框向下延长，手机横屏 844×390 下高度从 238px 增至约 304px，更接近右侧可用空间底部。
- 中间主入口新增“单机 / 好友联机”切换：单机显示“玩家人数”和“启用摇骰子定先手”；好友联机显示创建 2 / 3 / 4 人好友房卡片，并保留“启用摇骰子定先手”。
- 手机横屏下左侧不再重复展示“还没有等待中的房间”卡片，该卡片移到中间“好友联机”模式里，左侧保留好友搜索、好友申请和房间邀请。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260528-lobby-mode-switch`。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/index.html?verify=lobby-mode-switch-local` 返回 200。
- Edge 844×390 安卓横屏预览确认：好友联机模式可显示创建房间卡和摇骰子开关，右侧好友/排行榜框向下延长并保持框内滚动。

### 好友列表 / 排行榜固定框二次修正

- 修正小屏和手机横屏大厅中，点击“排行榜”后右侧外框可能被榜单头部和内容重新撑高的问题。
- 好友列表和排行榜现在都锁在同一个 `.social-side-column` 内容格内；外框高度固定，切换时不变，超出的好友或榜单条目只在框内滚动。
- 更新 `index.html` 中 `styles.css` 版本参数为 `20260528-social-fixed-pane`，避免继续命中旧样式缓存。
验证：
- `node --check app.js` 通过。
- 本地 `http://127.0.0.1:4173/index.html?verify=social-fixed-pane-local` 返回 200，并加载 `styles.css?v=20260528-social-fixed-pane`。
- 内置浏览器使用 844×390 安卓横屏尺寸验证：好友页和排行榜页切换前后右侧外框高度均为 238px，排行榜内容在框内滚动。

### 手机横屏游戏大厅

- 按斗地主/王者大厅参考图调整已有模块的手机横屏大厅布局，不新增商城、邮件、英雄、皮肤等当前项目没有的功能入口。
- 手机横屏登录后大厅改为一屏游戏大厅：复用项目现有 `favicon.png` 作为沉浸背景，顶部展示大厅账号区、欢乐豆资源条和退出登录。
- 中央保留已有“玩家人数 / 启用摇骰子定先手 / 开始游戏 / 查看规则 / 上一局结算”功能，并改成更接近游戏大厅主入口的横向按钮组。
- 左侧保留已有好友搜索、好友申请、房间邀请、创建好友房；右侧保留已有好友列表 / 排行榜切换，列表内容仍在框内滚动查看。
- 修正右侧“好友列表 / 排行榜”切换时排行榜把外框撑高的问题；两个列表现在共用同一个固定高度外框，排行榜超出部分在框内滚动。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260528-lobby-pane`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=lobby-landscape-final` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260528-lobby-pane` 和 `app.js?v=20260528-lobby-pane`，样式表包含 `body.is-lobby-setup` 横屏大厅规则，控制台无错误。
- Edge 844×390 安卓横屏模拟截图确认顶部资源条、左右好友/排行榜区域、中间主入口可在一屏内展示；好友列表与排行榜切换前后右侧外框高度一致，排行榜内容在框内滚动。

## 2026-05-27

### 手游式登录入口

- 登录页改为更接近横屏手游入口的上下布局：上方保留游戏名、版本说明和“玩法简介”，下方只放“邮箱登录 / Google 账号登录”两个入口按钮。
- 邮箱登录不再常驻表单；点击“邮箱登录”后才弹出居中的邮箱/密码输入框，登录或注册按钮放在弹窗底部，支持收起。
- 新增 Google 账号登录按钮，接入 Firebase `GoogleAuthProvider`；如果 Firebase 控制台未启用 Google 登录，会给出明确提示。
- 邮箱或 Google 登录成功后先停留在入口页，收起输入框，显示“开始游戏”；右上角显示当前游戏 ID 和“退出登录”，点击“开始游戏”后再进入创建 ID 或大厅。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260527-auth-entry`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=auth-entry-final` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260527-auth-entry` 和 `app.js?v=20260527-auth-entry`，未登录状态为 `body.is-login-view`，邮箱/Google 两个入口按钮可见，控制台无错误。
- Edge 844×390 安卓横屏尺寸导出截图，确认初始入口、邮箱弹窗、登录后开始游戏入口三种状态均在一屏内展示。

### 登录页手机横屏入口

- 新增未登录状态 `body.is-login-view`，让登录页可以单独做手机横屏布局，不影响后续大厅重做和已完成的对局横屏牌桌。
- 手机横屏下登录页改为左右双栏：左侧为游戏标题和玩法入口，右侧为登录/注册面板，邮箱、密码、记住邮箱和登录按钮在一屏内完整展示。
- 修正登录按钮在横屏小宽度下被旧登录规则挤成窄按钮并换行的问题，按钮改为两列等宽。
- 默认不再打开规则弹窗，避免玩家进入页面时登录入口被遮挡；仍可通过“玩法简介”和规则按钮手动打开。
- 登录页规则弹窗在横屏下同步压缩为横向网格，打开后也尽量保持在横屏视口内。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260527-login-landscape`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=login-landscape-final` 返回 200。
- Chrome 横屏尺寸预览确认登录页为左右双栏、登录按钮等宽、无整页滚动。
- 内置浏览器确认页面加载 `styles.css?v=20260527-login-landscape` 和 `app.js?v=20260527-login-landscape`，`body` 含 `is-login-view`，规则弹窗默认隐藏，控制台无错误。

## 2026-05-25

### 手机横屏斗地主式牌桌

- 为手机横屏单独增加 `body.is-game-view` 横屏牌桌规则，不影响桌面版、大厅页和现有竖屏移动端布局。
- 横屏对局页改为一屏式游戏桌：顶部只保留紧凑功能按钮，对手席位压到桌面上沿，公共牌区作为中间主区域，最近动作和牌堆信息固定在右侧。
- 底部手牌区改为贴底牌架，操作按钮放在手牌上方，并隐藏底部重复的“重新开局”，继续使用右上角“再来一局”入口。
- 横屏下公共牌最多按 6 列网格展示，底部手牌横向叠放，结算卡也做了横屏压缩，尽量保持手机横屏一屏内可操作。
- 修正横屏顶部按钮被旧小屏规则挤成竖排的问题，并关闭底部手牌面板入场动画，避免刚进入牌桌时手牌区域临时下移被裁切。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-landscape-table`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=landscape-table-final` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-landscape-table` 和 `app.js?v=20260525-landscape-table`，控制台无错误。
- Chrome 横屏尺寸预览确认顶部按钮、公共牌区、右侧动作区和底部手牌区可在一屏内展示。

### 移动端 H5 一屏牌桌适配

- 不新增单独文件夹，继续使用同一套 `index.html`、`app.js`、`styles.css`，通过响应式 CSS 自动适配手机宽度。
- 手机宽度下登录、创建 ID、大厅设置和社交区改为单列布局；好友申请、房间邀请、好友列表和排行榜继续在区域内滚动。
- 手机牌桌压缩顶部玩家席位、公共牌区和中央动作区；公共牌改为更稳定的网格排列，减少横向溢出。
- 手机对局页底部固定自己的手牌和操作按钮，按钮改为更适合手指点击的两列布局；底部预留空间只在对局页生效，不影响登录页和大厅。
- 第二轮将手机对局页改为固定一屏牌桌：对局页禁用整页滚动，保留顶部操作、状态、公共牌、最近动作和底部手牌按钮；次要的牌堆视觉、摸牌预览和判定指标在手机对局页收起，避免撑出一屏。
- 第三轮参考手机斗地主牌桌的信息层级：手机对局页收起状态条，顶部操作压成小按钮条，中间公共牌作为主区域，最近动作压成窄提示条，底部改成操作按钮在手牌上方。
- 规则、欢乐豆、房间邀请弹窗限制最大高度，手机上内容过长时在弹窗内滚动；规则说明文字补充强制换行，避免横向溢出。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-mobile-pass3`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=mobile-pass3` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-mobile-pass3` 和 `app.js?v=20260525-mobile-pass3`，控制台无错误。
- Chrome 手机尺寸截图确认规则弹窗文字已正常换行。

### 注册后先创建游戏 ID

- 将新账号流程调整为“注册/登录 -> 创建游戏 ID -> 游戏大厅”：账号登录成功但还没有绑定 ID 时，不再直接展示大厅、好友房和排行榜。
- 新增独立的创建 ID 状态，只显示游戏 ID 输入框和“创建 ID，进入大厅”按钮；创建成功后才进入大厅。
- 创建 ID 这一步会继续沿用原有唯一性校验、初始欢乐豆和 2/3/4 人空战绩初始化，不改变账号数据规则。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-register-id`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=register-id` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-register-id` 和 `app.js?v=20260525-register-id`，控制台无错误。

### 补枪阶段公共牌亮度修正

- 修复“先弃牌到桌面，再摸到一张不能钓它的牌时，刚弃的公共牌仍然看起来很亮”的误导。
- 公共牌在补枪判断中如果不是可补目标，不再播放新牌亮起动画，只保留变淡状态；绿色高亮只留给真正可补的目标。
- 补枪阶段不可点公共牌的提示文案改为说明“不能和摸到的牌组成补枪”，避免继续显示“当前手牌”造成混淆。
- 摸牌后如果暂无可补目标，动作提示和反馈会直接说明“暂无可补目标 / 可以让摸牌落台”，不再笼统提示“可以立刻补枪”。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-draw-targets`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=draw-targets` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-draw-targets` 和 `app.js?v=20260525-draw-targets`，控制台无错误。

### 公共牌提示时机调整

- 调整对局过程引导的公共牌状态：玩家还没选手牌时，公共牌保持正常显示，不再提前变淡。
- 选中一张手牌后，才高亮可钓公共牌，并将其他暂时不能钓的公共牌变淡。
- 摸牌补枪阶段沿用同一逻辑：摸到的牌作为当前牌，可补目标亮起，其他公共牌变淡。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-guidance-targets`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=guidance-targets` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-guidance-targets` 和 `app.js?v=20260525-guidance-targets`。

### 对局过程基础引导

- 增加轻量过程引导：轮到本地玩家时，中央提示会根据当前阶段动态说明“先选手牌 / 选择亮起公共牌 / 可弃到台面 / 补枪目标”等。
- 首个本地回合显示一次新手提示，说明可钓公共牌会亮起、暂时不能钓的牌会变淡；提示记录在本地浏览器，后续不重复弹出。
- 手牌和公共牌增加可操作状态：当前可点的牌更突出，不可点或暂时不能钓的牌变淡；选中手牌后，系统自动高亮可钓公共牌。
- “尝试钓牌 / 弃到台面 / 清空选择”根据当前选择状态禁用，并写入禁用原因；按钮下方显示简短原因，避免玩家只能靠试错理解规则。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-guidance`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=guidance` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-guidance` 和 `app.js?v=20260525-guidance`，页面存在 `#control-hint`、`#selection-hint`，并读取到 `.dimmed-card` 样式。

### 账号 ID 默认提示按钮修复

- 修复登录大厅里“当前账号已绑定唯一 ID：wilson3”仍显示成普通文字的问题。
- 原因是部分账号资料加载流程会把默认 ID 提示写入 `playerIdHintMessage`，渲染时被误判为自定义提示，导致跳过按钮渲染。
- 现在只有真正的错误/状态提示才按普通文字显示；默认 ID 提示会正常渲染为可点击按钮，并继续打开账号信息小浮层。
- 将 ID 按钮样式调整为更明显的圆角胶囊按钮，避免看起来像普通文本。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-id-button`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=id-button` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-id-button` 和 `app.js?v=20260525-id-button`，并读取到 `.player-id-details-toggle` 的圆角按钮样式。

### 领奖按钮可读性修复

- 修复赢家结算卡左侧“直接领取”按钮文字几乎看不见的问题：补上全局 `--green-dark` 颜色变量，让主按钮绿色背景正常生效。
- 增强领奖按钮边框和阴影，对比度更明确；右侧“看广告翻倍”按钮也同步获得稳定的绿色文字颜色。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-claim-button`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=claim-button` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-claim-button` 和 `app.js?v=20260525-claim-button`，并能读取 `--green-dark: #0f4f39`。

### 赢家奖励手动领取与广告翻倍

- 恢复赢家手动领奖流程：结算完成后不再自动写入奖池奖励，赢家需要在自己的结算卡里点击领取。
- 赢家结算卡新增“直接领取”和“看广告翻倍”两个按钮；直接领取按奖池原额入账，看广告翻倍按奖池 2 倍入账。
- 领取成功后会记录实际到账金额、翻倍倍数和领奖人信息，联机房其他玩家会同步看到奖池已领取状态。
- 已领取过的同一局仍通过 `lastBeanRoundAwarded` 防重复入账，避免重复点击或多端操作造成重复发奖。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-manual-claim`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=manual-claim` 返回 200。
- 页面源码包含 `20260525-manual-claim`，结算卡源码包含 `data-claim-multiplier="1"` 和 `data-claim-multiplier="2"` 两个领奖入口。

### 账号 ID 信息弹窗兜底修复

- 修复点击“当前账号已绑定唯一 ID”里的 ID 后可能没有弹出账号信息的问题：弹窗不再强依赖本地战绩对象已存在。
- 当云端/本地战绩资料还在同步或暂未产生正式战绩时，仍会展示当前 ID、联机门票和当前模式空战绩，并提示正在同步或暂无正式战绩。
- 将 ID 从普通下划线文字优化为更明确的可点击小按钮，并提高账号信息小浮层层级、位置稳定性和滚动可用性。
- 更新 `index.html` 中 `styles.css` / `app.js` 版本参数为 `20260525-id-popover`，避免浏览器继续使用旧缓存。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=id-popover` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-id-popover` 和 `app.js?v=20260525-id-popover`。

### 社交区右侧高度跟随左侧

- 撤销上一版把左侧流程列固定为右侧高度的处理，左侧搜索、申请/邀请和房间卡片恢复自然高度。
- 右侧“好友列表 / 排行榜”框改为读取左侧流程列实际高度并动态对齐，内容超出时仍在右侧框内滚动。
- 小屏单列布局下取消右侧动态高度，避免移动端被桌面高度规则限制。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=social-right-align` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-social-right-align` 和 `app.js?v=20260525-social-right-align`，左侧没有固定高度规则，右侧通过 `--social-side-height` 跟随左侧高度。

### 牌桌动作区留白

- 确认顶部“再来一局”和底部“重新开局”绑定同一个重开逻辑。
- 宽屏牌桌下隐藏底部重复的“重新开局”，保留右上角“再来一局”。
- 宽屏牌桌下将底部手牌白色面板右侧让出动作通道，让右侧最近动作区域继续显示绿色桌面背景，身份框随手牌面板右边界向左移动。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=action-lane` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-action-lane` 和 `app.js?v=20260525-action-lane`，宽屏规则包含手牌面板右侧让位和底部重复重开按钮隐藏。

### 牌桌右侧动作区可读性

- 宽屏牌桌下将右侧“桌面中央 / 最近动作 / 判定目标”区域整体下移，减少与右侧玩家动作文字重叠。
- 提高右侧区域标题、提示、最近动作和牌堆文字的字号、字重和对比度，绿色桌面背景上更清楚。
- 判定信息卡片文字同步加粗放大，避免“当前出牌 / 已选台面牌 / 判定目标”读起来发虚。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=action-readability` 返回 200。
- 内置浏览器确认页面加载 `styles.css?v=20260525-action-readability`，右侧区域顶部为 `252px`，标题与最近动作文字已应用更大字号和浅色高对比样式。

### 对局结束欢乐豆结算区

- 对局结束后不再弹出遮挡桌面的结算遮罩，桌面上的每名玩家得分卡保持可见。
- 原手牌区改为显示“本局结算”，逐个展示玩家排名、身份、分数、净赢/输欢乐豆，以及奖池和门票拆分。
- 房主、赢家和输家都会显示本局欢乐豆变化；赢家领奖流程已恢复为手动点击，支持直接领取或看广告翻倍。
- 游戏内底部旧结算榜单默认隐藏，上一局结算仍可回到大厅查看。
- 100% 缩放下结算状态会隐藏原手牌区顶部标题、说明和身份框，并收起结算摘要栏，让玩家结果卡整体上移；结果卡同步压缩高度，减少被底部遮挡。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=settlement-hand` 返回 200。
- 页面加载 `styles.css?v=20260525-settlement-hand` 和 `app.js?v=20260525-settlement-hand`。
- 本地服务 `http://127.0.0.1:4173/index.html?verify=settlement-compact` 返回 200，页面加载 `styles.css?v=20260525-settlement-compact` 和 `app.js?v=20260525-settlement-compact`。

## 2026-05-21

### 大厅压缩布局

- 登录后的游戏大厅隐藏顶部“钓红点”简介区，登录页继续保留简介和玩法入口。
- “启用摇骰子定先手”合并到“玩家人数”卡片里，减少大厅顶部设置区横向换行概率。
- “退出登录 / 已登录账号”挪到大厅标题右侧，不再占用设置卡片下方的一整行高度。
- “开始游戏 / 查看规则”移动到设置区第 4 个卡片中；前三个设置卡片缩小为“欢乐豆余额 / 玩家人数+摇骰子 / 游戏 ID”，帮助 100% 缩放下展示更多内容。
- 设置区卡片取消拉伸等高，卡片最小高度和内边距继续压缩，摇骰子选项紧跟玩家人数下方，减少第一行高度。
- 修正大厅压缩样式误作用到内层摇骰子 label 的问题，确保“启用摇骰子定先手”真正上移到人数下拉框下方。
- 登录后的大厅新增专用 body 状态，外层 `.app-shell` 顶部留白压到 0；同时给 `styles.css` 和 `app.js` 引用加版本参数，避免浏览器缓存旧布局。
- 将左侧底部的账号/门票/战绩统计卡改为点击“当前账号已绑定唯一 ID”里的 ID 后弹出的小浮层，默认不再占用社交区域高度。
- 好友搜索区移入社交面板左列并限制宽度，好友列表右列上移，与左侧搜索区域顶部对齐。
- 右侧社交区新增“好友列表 / 排行榜”并列切换；好友列表固定约 5 条可见，超出后在列表内滚动。
- 排行榜从大厅底部移入右侧社交区，保留单榜单视图，通过 2人榜 / 3人榜 / 4人榜按钮切换；榜单约 5 条可见并用滚动条查看更多，取消可见区域里的页数跳转。
- 恢复社交面板左侧原有排列，标题仍在面板顶部，左列只保留搜索、好友申请/房间邀请、房间卡片。
- 排行榜条目去掉名字下方重复的“单局最高 121”文案，只在右侧分数列显示最高分，压缩条目空白。
- 去掉右侧单榜单内部的“2/3/4 人榜 · 单局最高”标题行，分数下方直接显示“单局最高”。
- 右侧“好友列表 / 排行榜”区域增加统一外框和固定高度，好友列表与排行榜切换时保持同一高度，内容在框内滚动。
- 左侧流程列同步使用右侧固定高度，最后的房间卡片填满剩余空间，让左侧底边与右侧好友/排行榜框底边对齐。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html` 返回 200。
- 内置浏览器确认按钮卡片已在设置网格内，未登录状态下仍隐藏，控制台无错误。
- 内置浏览器确认页面加载 `styles.css?v=20260521-lobby-spacing` 和 `app.js?v=20260521-lobby-spacing`，并包含 `body.is-lobby-setup .app-shell { padding-top: 0px; }` 样式规则。
- 内置浏览器确认页面加载 `styles.css?v=20260521-account-popover` 和 `app.js?v=20260521-account-popover`，统计卡已移动到游戏 ID 卡片内并默认隐藏，好友搜索区位于左列。
- 内置浏览器确认页面加载 `styles.css?v=20260521-social-leaderboard` 和 `app.js?v=20260521-social-leaderboard`，右侧存在“好友列表 / 排行榜”切换、2 / 3 / 4 三个小榜单，并包含旧底部排行榜隐藏和五条滚动样式规则。
- 内置浏览器确认页面加载 `styles.css?v=20260521-social-rank-tabs` 和 `app.js?v=20260521-social-rank-tabs`，社交面板标题回到顶部，左列恢复为搜索/申请邀请/房间卡片；右侧排行榜只渲染 1 个榜单，并提供 2人榜 / 3人榜 / 4人榜切换。
- 内置浏览器确认页面加载 `styles.css?v=20260521-social-score-label` 和 `app.js?v=20260521-social-score-label`，榜单内部标题行已移除，分数标签改为“单局最高”。
- 内置浏览器确认页面加载 `styles.css?v=20260521-social-side-frame` 和 `app.js?v=20260521-social-side-frame`，右侧区域具有固定高度、外框边线，好友列表和排行榜 pane 共用统一高度并在内部滚动。
- 内置浏览器确认页面加载 `styles.css?v=20260521-social-column-align` 和 `app.js?v=20260521-social-column-align`，左右两列同为固定高度，左侧房间卡片填满剩余高度并对齐右侧底边。

### 登录改为手动确认

- 禁用 Firebase 持久自动登录，刷新或重新打开页面时不会因为上次登录态直接进入大厅。
- 登录页新增“记住邮箱”勾选项，记录上次使用的邮箱并在登录页预填；密码不写入项目存储，继续交给浏览器密码管理器自动填充。
- 点击“登录账号”或“注册账号”后才确认本次登录并进入游戏大厅。
- 未登录状态不清空密码输入框，避免浏览器刚自动填充又被脚本抹掉。

验证：

- `node --check app.js` 通过。
- 本地服务 `http://127.0.0.1:4173/index.html` 返回 200。
- 内置浏览器确认“记住邮箱 / 密码由浏览器保存”显示正常，邮箱预填后仍停留在登录页，隐藏开局和游戏区，控制台无错误。

## 2026-05-20

### 测试反馈前 3 点首轮调整

- 登录区拆成“登录钓红点”和“游戏大厅”两种状态：未登录只显示邮箱/密码和登录注册；登录后再显示大厅、开局、好友房、排行榜等内容。
- 对局结束后“查看结果”会真正展示结算榜单，并滚动到结算区域，流程更接近“登录 → 大厅/游戏 → 结算 → 再来一局/回大厅”。
- 牌桌 100% 视口下自动缩放下限从 0.62 调整到 0.56，减少游戏页在普通浏览器缩放下显示不全的问题。
- 3 / 4 人对手席位改为上方排列，公共牌区改为居中主区域，最近动作面板放到右侧，减少公共牌偏左和玩家动作被遮挡的问题。
- 小屏和横屏布局改为可滚动、公共牌区与动作区纵向排布，避免 `overflow: hidden` 导致 H5 内容被裁掉。

验证：

- `node --check app.js` 通过。
- 本地浏览器打开 `http://127.0.0.1:4173/`，确认未登录页只显示登录入口，隐藏开局、社交和排行榜内容，控制台无错误。

### 顶部介绍区默认收起

- 顶部大介绍区改为紧凑栏，默认只显示“钓红点”、测试版摘要和“玩法简介”按钮。
- 点击“玩法简介”后展开当前版本说明，再次点击“收起简介”可收回。
- 版本说明文案改为面向测试者：单机/好友房、联机门票退款、邀请回复、欢乐豆测试入口。

验证：

- `node --check app.js` 通过。
- 本地浏览器确认默认收起、点击展开、再次收起均正常，控制台无错误。

### GitHub 文档路径修正

- 修正手动上传时把 `CHANGELOG.md`、`PROJECT_STATUS.md` 放到仓库根目录的问题。
- GitHub 仓库应保留根目录 `FEATURE_LOG.md`，并把项目摘要文档放到 `docs/CHANGELOG.md`、`docs/PROJECT_STATUS.md`。

验证：

- 将通过临时 git 克隆推送远端结构修正。

### 排行榜默认折叠

- 云端排行榜默认收起，只显示标题说明和“查看排行”按钮。
- 点击“查看排行”后展示模式切换、刷新按钮、排行榜列表和分页。
- 展开后按钮变为“收起排行”，可再次隐藏排行榜内容。

验证：

- `node --check app.js` 通过。
- 本地浏览器确认默认折叠、点击展开、再次收起均正常，控制台无错误。

### 文档与工作记录

- 新增 `docs/CHANGELOG.md`，作为项目内精简变更记录。
- 新增 `docs/PROJECT_STATUS.md`，记录当前功能、测试方式、上传范围和已知限制。
- 将项目摘要追加到桌面总工作记录 `WORKLOG.md`。
- 保留 `FEATURE_LOG.md` 作为详细功能记录，避免在 changelog 里重复粘贴同样内容。

验证：

- 文档内容未写入任何 API Key、密码、Token 或真实密钥。

## 2026-05-19

### 好友与邀请

- 房间邀请改为居中弹窗，可同意、忽略、拒绝。
- 拒绝邀请时支持快捷原因和自定义文字，并把拒绝原因写入邀请记录。
- 房主侧新增“邀请反馈”，可看到等待回复、已加入、已拒绝和拒绝原因。
- 被邀请人刷新邀请时会校验房间仍为等待中且未满员；房间已关闭、已开局或已满的旧邀请不会再弹窗或显示。
- 社交面板改为左右布局，好友申请、房间邀请、好友列表、邀请反馈均支持区域内滚动，避免撑大整体区域。

验证：

- `node --check app.js` 通过。
- 本地浏览器验证页面加载无控制台错误。

### 欢乐豆与联机房

- 新增欢乐豆中心：每日福利、模拟广告奖励、真实充值入口保留为“支付待接入”。
- 联机房等待阶段支持门票退款，使用 `refundedUids` 避免重复退款。
- 联机开局前补充门票校验，避免未扣门票的奖池状态。
- 联机赢家领奖改为显式确认后入账。
- 单机打电脑不消耗欢乐豆，也不产生联机奖池。

验证：

- `node --check app.js` 通过。

### 账号、排行榜与布局

- 登录区域和欢乐豆余额布局调整。
- 排行榜不再展示欢乐豆余额，余额统一在顶部余额卡展示。
- 玩家统计卡移动到社交面板左侧流程下方。

验证：

- `node --check app.js` 通过。

## 2026-05-18

### 基础联机与经济规则整理

- 完成账号区、云端排行榜、欢乐豆余额、联机门票、领奖确认等多项基础调整。
- 详细记录见 `FEATURE_LOG.md` 的 `2026-05-18` 章节。

## 2026-06-04

### Mobile Landscape Layout Follow-up

- Reworked the small-screen landscape in-game layout again to match the latest request: keep the hand area in the middle, and reserve one region on each side of the hand area.
- Left-side bottom region now carries the draw pile plus status prompt, while the right-side bottom region carries recent action plus selection/rule info.
- Fixed the root cause where `.play-stage` was not stretching to the full mobile viewport, which had been collapsing the public-card area and pinning the bottom layout halfway up the screen.
- Kept the public-card area as the large middle table zone, restored more normal card proportions, and reduced the bottom hand panel height so the lower composition fits better in one landscape screen.
- Added the missing right-side metrics block to `artifacts/layout-check/public-area-preview.html` so preview screenshots reflect the intended three-part bottom composition.
- Bumped cache references to `20260604-game-bottom-side-panels` in `index.html` and the preview helper page.

Verification:

- `node --check app.js` passed.
- Verified under real mobile emulation where `(hover: none)`, `(pointer: coarse)`, landscape orientation, and the `max-width: 960px` media query all matched.
- Refreshed preview screenshots:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

### 2026-06-04 Mobile Side Box Cleanup

- Followed up on the touch-landscape in-game layout again after the user confirmed the previous version still looked wrong on the real `915 x 412` Android landscape viewport.
- Simplified the bottom side regions to better match the requested structure:
  - left bottom box now focuses only on status prompt + draw pile
  - right bottom box now focuses only on recent action
  - mobile landscape `selection-metrics` is hidden instead of being squeezed into the right box
- Reworked the left box from two stacked mini-cards into one combined region so the status text and draw pile stop fighting for vertical space.
- Compressed the left-box typography and draw-pile visuals, brightened the status text, and adjusted spacing so the side boxes no longer look cut off.
- Bumped cache references to `20260604-mobile-side-box-fix` in `index.html` and the preview helper page.

Verification:

- `node --check app.js` passed.
- Re-exported mobile landscape preview screenshots for `844 x 390` and `915 x 412` under real touch/mobile emulation.

### 2026-06-04 Mobile Side Panels Expanded

- Reworked the touch-landscape in-game side regions again based on the desktop/web layout structure instead of continuing to compress them.
- The left side region is now intentionally larger and restores the desktop-style split of status prompt above and draw pile below.
- The right side region is also enlarged and restores the desktop-style composition of recent action above plus three compact metric cards below.
- The center hand area now yields more width to the two side regions so they can exist as real panels instead of clipped slivers.
- Rebuilt `artifacts/layout-check/public-area-preview.html` with clean preview content so layout verification is no longer distorted by broken placeholder text.
- Bumped cache references to `20260604-mobile-side-panels-expanded`.

Verification:

- `node --check app.js` passed.
- Re-exported landscape touch previews for `844 x 390` and `915 x 412`.

### 2026-06-04 Mobile Bottom Band Alignment

- Tuned the touch-landscape in-game layout again so the public-card area no longer dominates the viewport.
- Introduced a shared `--game-bottom-band-height` and bound the left info rail, center hand panel, and right info rail to the same bottom height so the three lower regions align cleanly.
- Raised the bottom edge of `.table-public-area`, reduced its padding, and slightly tightened public-card sizing so the center board reads shorter and less swollen.
- Bumped cache references to `20260604-mobile-bottom-band-aligned` in `index.html` and the preview helper page.

Verification:

- `node --check app.js` passed.
- Verified under real touch/mobile emulation that `(hover: none)`, `(pointer: coarse)`, landscape orientation, and `max-width: 960px` all matched.
- Refreshed mobile preview screenshots:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

### 2026-06-09 Waiting Friend Room Blocks Solo

- Added a shared waiting-room guard in `app.js` so a pending friend room now locks the lobby away from solo play.
- Clicking the `单机` tab while a friend room is still `waiting` now keeps the user in `好友联机` and shows a prompt to close or leave that room first.
- The lobby `开始游戏` path now re-checks the same rule before starting a solo round, so the user cannot bypass the lock through stale UI state.
- Social data refresh now forces the lobby back to `好友联机` when a waiting room is restored from cloud state, and the solo tab is visibly disabled.
- Updated cache references to `20260609-waiting-room-solo-lock`.

Verification:

- `node --check app.js` passed.

### 2026-06-10 Open Friend Room Blocks Solo

- Tightened the solo-play guard again so it now applies to both `waiting` and `playing` friend rooms instead of only pending rooms.
- Renamed the helper logic in `app.js` around the broader “open friend room” rule and kept the lobby pinned to `好友联机` whenever such a room exists.
- Added the same guard to the lower-level `startGame()` entry point so solo mode is blocked even if another flow bypasses the lobby tab state.
- Updated cache references to `20260610-open-room-solo-lock`.

Verification:

- `node --check app.js` passed.

### 2026-06-10 Open Friend Room Lobby Sync

- Added `syncLobbyModeWithOpenFriendRoom()` in `app.js` so returning to the lobby now immediately forces the mode back to `好友联机` whenever the current friend room is still open.
- Hooked that sync into both `renderAuthControls()` and `returnToSetup()` to cover the “对局中点回到大厅” path that could still show the solo tab as active.
- Synced the latest root `app.js`, `index.html`, and `styles.css` into `_github_upload/` and `_github_repo/` so local testing and upload bundles stop drifting apart.
- Updated cache references to `20260610-open-room-solo-lock-sync`.

Verification:

- `node --check app.js` passed.
