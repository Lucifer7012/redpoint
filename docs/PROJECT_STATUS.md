# Project Status

最新状态补充（2026-06-07）：
- 手机横屏真实对局页底部整行已压缩：共同高度从 `184px` 调整为 `160px`，中间手牌区上方空白减少，左侧牌堆区、中间手牌区、右侧最近动作/指标区仍保持同高对齐。
- 右侧最近动作的 JS 固定高度现在按 `.human-panel` 实际高度计算，避免底部压缩后动作框继续使用旧高度。
- 已修正三张指标卡压缩后被旧 `grid-area` 静态位置带偏的问题，指标卡重新贴住底部，不再被视口裁切。
- 当前缓存版本：`styles.css?v=20260607-bottom-band-compact`，`app.js?v=20260607-bottom-band-compact`。
- 最新真实页面验证截图：`artifacts/layout-check/real-index-bottom-band-compact-915x412.png`、`artifacts/layout-check/real-index-bottom-band-compact-844x390.png`。

历史状态补充（2026-06-04）：
- 真实 `index.html` 对局页右侧最近动作已改为 JS 固定：每次渲染后按右下三张指标卡位置，将 `.action-stage` 以内联 important 样式固定到指标卡上方；这次不再动公共牌、手牌、对手区等整体布局。
- 已补真实 `index.html` 正式回合验证：本机 Chrome + Playwright 触屏横屏 `915 x 412` 与 `844 x 390` 生成 `artifacts/layout-check/real-index-js-pin-active-915x412.png`、`artifacts/layout-check/real-index-js-pin-active-844x390.png`，两张图均确认右侧最近动作位于三张指标卡上方。内置浏览器也确认本地真实页面加载 `20260604-landscape-js-pin` 缓存版本。
- 已修正横屏兜底规则的最终覆盖顺序：上一版仍被后续触屏横屏规则覆盖，问题属于实现顺序，不是用户设备或尺寸设置；最终规则已放到 `styles.css` 文件末尾。
- 已清理此前误加的整套横屏强制布局，只保留右侧最近动作最小覆盖，避免预览图里公共牌和对手区被压坏。
- `915 x 412` 与 `844 x 390` 本机 Chrome + Playwright 触屏预览图已生成：`artifacts/layout-check/chrome-final-915x412.png`、`artifacts/layout-check/chrome-final-844x390.png`，两张图均确认右侧最近动作文字和动作牌可见，公共牌区正常。
- 已补横屏兜底规则，统一 Chrome 响应式预览和触屏横屏对局的右侧最近动作显示；`844 x 390` 本机 Chrome 截图 `artifacts/layout-check/chrome-after-landscape-fallback-844x390.png` 已确认右侧最近动作文字和动作牌可见。
- 手机横屏对局右侧最近动作框内部已锁成左文字、右动作牌的两列布局，并显式恢复内容可见性，修正外框出现但内容不见的问题。
- 手机横屏对局右侧最近动作已从底部网格中改为锁定右栏绝对定位：固定在三张指标卡上方，不再和中间手牌面板争同一块空间。
- 手机横屏对局右侧信息区继续修正：上一轮恢复了最近动作但仍被手牌面板压住；现在右侧层级提升、右栏加宽到 `244px - 278px`，中间手牌区让位，最近动作文字和动作牌应完整显示在右侧上半块。
- 手机横屏对局底部左右信息区已按最新截图继续微调：左侧牌堆视觉和张数整体下移一点；右侧恢复“最近动作”上半区，下方保留当前出牌、已选台面牌、判定目标三张指标卡，避免只剩 3 个框、最近动作消失。
- 手机横屏对局小视口已改成更接近真实手游牌桌的“四区布局”：中间大框为公共牌区，底部整条为手牌 + 3 个操作按钮，左下小框承载牌堆和状态提示，右下小框承载最近动作，不再使用“右侧长条信息栏”式挤压布局。
- 手机横屏对局的小视口牌面比例已重新收回到接近正常扑克牌比例；公共牌、最近动作展示牌和底部手牌都不再是扁胖卡面。
- 已补一轮底部手牌区高度，`915 x 412` 与 `844 x 390` 横屏视口下，底部按钮与整排手牌可在一屏内完整显示，不再被裁掉下半截。
- 横屏小视口公共牌区已改成内容自适应牌阵：公共牌区内部不再用整块 `1fr` 把两排牌硬撑开，而是改为固定行高、整体居中显示；同时右侧动作区继续放宽到 `220px - 236px`，公共牌区底边上收，整体不再是一大块空盒子。
- 横屏小视口牌桌已做第二轮定向修正：直接调整 `max-width: 960px` 横屏游戏布局，公共牌区为右侧动作栏让出固定间距，右侧 `center-stage` 宽度从固定 `174px` 改为弹性 `196px - 214px`，并同步压缩反馈条、最近动作卡和摸牌区字号与内边距，减少右侧文案重叠。
- 桌面牌桌公共牌区已进一步收紧：公共牌区宽度上限、保留给右侧动作区的固定空间、公共牌区 padding、高度和桌面卡牌间距都同步缩小，减少“公共牌区”和右侧 `center-stage` 贴边或视觉重叠。
- 对局页桌面窄窗口已改为继续使用完整桌面牌桌，并通过整桌等比例缩放收进视口；不再误切到手机横屏专用牌桌。
- 手机横屏触控场景仍保持原紧凑牌桌，桌面窄窗口缩放和移动端横屏布局已重新分流。
- 跨电脑开始同步脚本已补上旧结构回铺：legacy 模式下执行 `start-dev.cmd` / `tools/sync-start.ps1` 时，不仅会对 `_github_repo` 执行 `git pull --ff-only`，还会把跟踪文件同步回项目根目录和 `_github_upload`，避免工作目录停在旧版本。
- 手机横屏大厅右上角 `ID: 当前游戏ID` 已恢复账户信息入口；点击顶部 ID 会打开账号信息浮层，显示当前 ID 和三种模式战绩。
- 账号信息浮层已去掉联机门票说明，改为展示 2 / 3 / 4 人模式的累计积分、局数、胜场和单局最高。
- 邮箱登录 / 注册表单已改为深色半透明游戏面板，输入框、记住邮箱和登录/注册/收起按钮统一贴近大厅与欢乐豆中心画风。
- 顶部欢乐豆资源条已改成金豆图标 + 小 `+` + 紧凑数字的游戏资源样式；欢乐豆中心弹窗也已统一为深色半透明大厅风格，不再使用浅色网页式卡片。
- 手机横屏大厅顶部账号区已调整：左上角头像标题块保留“游戏大厅”，并承载“已进入游戏大厅，可以开始单机或好友房”等状态白字；右上角改为 `ID: 当前游戏ID` + “退出登录”的账号操作区，不再把状态文案挤在右上角。
- 左上角大厅标题块已恢复到更早的紧凑宽度，状态文案改为“可开始单机或好友联机”，保持单行显示，避免压住下方搜索框。
- 844 x 390 手机横屏下大厅中间模式卡和底部操作条已改为在左侧流程列与右侧好友/排行榜栏之间定位，避免好友房状态下向右重叠到好友列表。
- 房间邀请同步已补上兜底：进入大厅时会主动刷新一次社交数据，浏览器标签页回到前台或窗口重新聚焦时也会立即补刷；另外增加了轻量周期补刷，减少“邀请明明发了、对方隔一会儿才看到”的情况。
- 当前进行中的联机对局已改为“先进入大厅，再手动点返回对局”；刚登录、刚刷新或刚进入大厅时，不再被自动拉进当前对局。
- 规则弹窗已改为更紧凑的深色半透明面板，标题、按钮和规则块样式统一贴近当前大厅画风，不再使用尺寸很大的浅色说明页。
- 手机横屏大厅中间“单机 / 好友联机”模式卡已做一轮整体越界排查；标签、房间卡、创建房间按钮、右侧骰子框和右侧房间操作按钮都已收紧，并补上文本省略与内部 `overflow` 约束，减少超出底边的情况。
- “关闭房间 / 离开房间 / 关闭后退票”已改为优先使用大厅当前房间快照直接批量写回，不再依赖先对 `rooms/{roomId}` 做单文档读取；可规避部分 Firestore 规则下 `query` 能读、`doc.get()` 被拒导致无法关闭房间的问题。
- 手机横屏大厅中间“好友联机”模式卡已把房间操作按钮收纳到右侧竖向区域；“启用摇骰子定先手”下方现在可承载“关闭房间 / 离开房间 / 开始联机 / 返回对局”等按钮，避免按钮把左侧房间信息卡挤出边界。
- 房间邀请弹窗已改为只在真正进入游戏大厅后显示；登录成功但还停留在开始游戏/创建 ID 阶段时，不再提前弹出邀请。
- 新增 `docs/HANDOFF.md`，作为跨电脑开发和新 Codex 会话继续项目时的固定交接入口；新会话应先读 `docs/HANDOFF.md`、`docs/PROJECT_STATUS.md`、`docs/CHANGELOG.md`、`FEATURE_LOG.md` 和 `agent.md`。
- 新增 `tools/sync-start.ps1`、`tools/sync-finish.ps1` 及对应 `.cmd` 包装器；“开始前帮我同步最新代码 / 改完了，帮我检查并同步到 GitHub”已经固化成项目内固定脚本入口。
- 项目根目录新增 `start-dev.cmd`、`finish-dev.cmd`，可直接双击作为一键入口。
- 项目根目录新增 `enable-auto-start-sync.cmd`、`disable-auto-start-sync.cmd`；可把“开始前同步”安装为 Windows 登录后的自动启动动作。
- `tools/sync-finish.ps1` 已将 `start-dev.cmd`、`finish-dev.cmd` 纳入自动提交清单，后续这两个入口会随项目一起同步。
- `agent.md` 顶部已加入固定口令和新会话必读文件说明，作为项目内协作约定的一部分。
- 手机横屏大厅中间“单机 / 好友联机”模式卡已固定为同一高度，按好友联机状态锁定，切换时不再变高或变矮。
- 手机横屏大厅中间主入口已改为“单机 / 好友联机”切换；单机显示玩家人数和摇骰子，好友联机显示创建 2 / 3 / 4 人好友房卡片和摇骰子。
- 右侧“好友列表 / 排行榜”固定外框再次向下延长，手机横屏下可显示更多列表内容。
- 右侧“好友列表 / 排行榜”切换框已做二次固定高度修正，小屏和手机横屏大厅点击排行榜时不再撑高外框；排行榜和好友列表都在同一外框内滚动。
- 当前缓存版本：`styles.css?v=20260607-bottom-band-compact`，`app.js?v=20260607-bottom-band-compact`。

更新时间：2026-06-04

项目：钓红点 / redpoint

本地路径：`C:\Users\OgCloud\Desktop\redpoint`

GitHub：`https://github.com/Lucifer7012/redpoint`

最近同步提交：以 GitHub `main` 最新提交为准。

## 当前状态

- 项目是静态前端游戏，核心文件为 `index.html`、`app.js`、`styles.css`、`favicon.png`。
- 当前可通过本地 HTTP 服务测试：`http://127.0.0.1:4173/`。
- 上传 GitHub 的暂存目录为 `_github_upload`。
- 本机当前工作目录已和 `_github_repo` 同步一致，可直接在项目根目录继续开发。
- 详细功能记录保留在 `FEATURE_LOG.md`，跨电脑和跨会话交接入口为 `docs/HANDOFF.md`，本目录下 `CHANGELOG.md` 只写摘要。

## 当前功能

- 支持 2 / 3 / 4 人钓红点规则、发牌、摸牌、补枪、红牌计分和结算。
- 支持单机打电脑，单机模式不消耗欢乐豆。
- 支持账号登录、唯一游戏 ID、云端玩家资料和排行榜；排行榜现位于社交区右侧，与好友列表并列切换。
- 支持欢乐豆余额展示、每日福利、模拟广告奖励。
- 支持好友搜索、好友申请、好友列表。
- 支持创建联机等待房、邀请好友、被邀请人居中弹窗处理邀请。
- 支持邀请拒绝原因、房主侧邀请反馈、过期房间邀请过滤。
- 支持联机门票、奖池、等待房退款、赢家领奖确认；赢家可选择直接领取或看广告翻倍领取奖池。
- 登录页、创建 ID 页和大厅页已拆分：未登录只显示邮箱登录 / Google 账号登录入口；邮箱登录会先弹出邮箱/密码小窗，新账号注册或登录后如果还没有游戏 ID，会先进入创建 ID 步骤；绑定 ID 后才进入大厅选择单机、好友房或查看排行。
- 页面不会因为 Firebase 上次登录态自动进入大厅；登录页提供“记住邮箱”勾选项，密码交给浏览器密码管理器，必须点击“登录账号”或完成 Google 登录后才出现“开始游戏”入口。
- 登录后的大厅会隐藏顶部简介；“启用摇骰子定先手”并入玩家人数卡片，“开始游戏 / 查看规则”移动到设置区第 4 个卡片，“退出登录 / 已登录账号”移动到大厅标题右侧，并压缩设置卡片高度、去掉大厅外层顶部留白，以减少 100% 缩放下的垂直占用。
- 已开始移动端 H5 适配：手机横屏登录页已改为类似手游入口的上下布局，上方是游戏名和玩法简介，下方是邮箱 / Google 登录方式；点击邮箱登录后弹出居中表单，登录成功后显示“开始游戏”和右上角 ID / 退出；手机横屏大厅已按斗地主/王者大厅参考图重排已有模块，复用项目背景图，顶部展示账号/欢乐豆/退出，中间展示玩家人数、摇骰子、开始游戏和规则，左侧保留好友搜索、好友申请、房间邀请、创建好友房，右侧保留好友列表 / 排行榜切换；右侧好友列表和排行榜共用固定高度外框，切换时外框大小不变，内容过长时在框内滚动；手机对局页参考手机斗地主牌桌层级，竖屏保持固定一屏压缩牌桌，横屏新增独立的一屏游戏桌布局，顶部是紧凑功能按钮，中间大框为公共牌主区域，左下为牌堆 + 状态提示，右下为最近动作，底部整条为手牌与 3 个操作按钮，弹窗内容过长时在内部滚动。
- 账号 ID 详情改为点击“当前账号已绑定唯一 ID”里的 ID 胶囊按钮后弹出小浮层，联机门票和当前模式战绩默认不再占用大厅下方空间；战绩资料未同步或暂无正式战绩时也会兜底显示当前账号信息。
- 对局结束后可查看结算榜单，再选择再来一局或回到大厅。
- 对局中已加入基础过程引导：当前操作提示会随阶段变化；未选手牌时公共牌保持正常显示，选中手牌或摸到牌后才高亮可钓目标、变淡其他公共牌；补枪阶段不可补的公共牌不会因为刚落台的新牌动画而显得可点；按钮禁用时显示原因；首个本地回合只显示一次轻量新手提示。
- 对局结束后桌面保留每名玩家的得分卡，原手牌区改为显示本局欢乐豆输赢明细，房主、赢家和输家都会显示净赢/输结果；赢家需要在结算卡里手动选择直接领取或看广告翻倍领取，领奖按钮已做高对比度显示；结算状态会隐藏手牌区顶部说明和身份框，让结果卡上移以适配 100% 缩放。
- 牌桌布局已按测试反馈首轮调整：3 / 4 人对手席位排到上方，公共牌区居中，最近动作区固定在右侧；手机横屏对局页已改为固定一屏桌面，避免像压缩网页一样依赖整页滚动。
- 宽屏牌桌下底部手牌面板会让出右侧动作通道，绿色桌面继续显示最近动作；底部重复“重新开局”隐藏，使用右上角“再来一局”。
- 宽屏牌桌右侧“桌面中央 / 最近动作 / 判定目标”区域已整体下移，并提升文字字号、字重和对比度，减少与上方玩家动作文字重叠。
- 社交面板已按当前测试需求改为顶部标题、左侧流程区、右侧好友/排行榜切换区；左侧保留搜索、好友申请/房间邀请、房间卡片的原有排列。
- 左侧流程列保持自然高度；右侧好友/排行榜框会动态跟随左侧实际高度，左右底边对齐。
- 好友列表固定约 5 条可见，列表过长时区域内滚动。
- 右侧“好友列表 / 排行榜”区域有统一外框并跟随左侧高度；切换好友列表与排行榜时高度保持一致，内容在框内滚动。
- 点击右侧“排行榜”后展示单个榜单，通过 2人榜 / 3人榜 / 4人榜按钮切换；榜单固定约 5 条可见并使用滚动条查看更多，已取消可见排行榜区域的页数跳转，分数下方显示“单局最高”。
- 顶部项目介绍默认收起为紧凑栏，点击“玩法简介”后展开当前版本说明；未登录手机横屏下不再自动弹出规则弹窗，避免遮挡登录入口。

## 测试方式

常规语法检查：

```powershell
node --check app.js
```

本地服务：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

本地访问：

```text
http://127.0.0.1:4173/
```

每次修改后建议验证：

- `node --check app.js`
- 浏览器打开本地地址，确认页面加载和控制台无错误
- 涉及邀请、房间、欢乐豆时，用两个账号做联机流程测试

## 上传范围

当前 GitHub 上传暂存目录应包含：

- `index.html`
- `app.js`
- `styles.css`
- `favicon.png`
- `FEATURE_LOG.md`
- `agent.md`
- `enable-auto-start-sync.cmd`
- `disable-auto-start-sync.cmd`
- `start-dev.cmd`
- `finish-dev.cmd`
- `tools`
- `docs/HANDOFF.md`
- `docs/CHANGELOG.md`
- `docs/PROJECT_STATUS.md`

GitHub 仓库根目录不应放置 `CHANGELOG.md` 或 `PROJECT_STATUS.md` 的副本；这两个文件应位于 `docs/` 目录内。

桌面总工作记录 `C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md` 不属于项目发布文件，不放入 `_github_upload`。

## 已知限制

- 真实充值未接入，当前保留为“支付待接入”。
- 模拟广告奖励只是测试入口，接入真实广告 SDK 后应由可信回调入账。
- 联机、好友、排行榜依赖 Firebase/Firestore 权限规则；记录中不保存任何密钥或真实敏感值。
- `app.js` 仍是较大的单文件实现，后续继续加功能前适合逐步拆分模块。
- 旧交接文档可能包含更早阶段的问题描述；当前社交、欢乐豆和邀请相关状态以 `FEATURE_LOG.md`、`docs/CHANGELOG.md`、本文件为准。

## 后续记录规则

- 每次修改代码或内容后，更新 `docs/CHANGELOG.md`。
- 当前状态、测试方式、上传范围或已知限制变化时，更新 `docs/PROJECT_STATUS.md`。
- 当前正在做的事、下一步、跨电脑同步流程或交接注意事项变化时，更新 `docs/HANDOFF.md`。
- 同步脚本入口或提交流程变化时，更新 `tools/` 和相关文档说明。
- 同步更新桌面总工作记录 `C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md`。
- 不记录 API Key、密码、Token、Cookie 或任何真实密钥。

## 2026-06-04 Update

- Cache version: `styles.css?v=20260604-game-bottom-side-panels`, `app.js?v=20260604-game-bottom-side-panels`
- Current focus: mobile landscape in-game table layout.
- Latest completed adjustment: the bottom composition is now split into three zones for touch landscape play:
  - left bottom box = draw pile + status prompt
  - center bottom box = hand cards + 3 action buttons
  - right bottom box = recent action + selection/rule info
- Root cause fixed: `.play-stage` now stretches to the full mobile viewport, so the public-card zone no longer collapses when the right/bottom mobile layout is active.
- Latest preview artifacts:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

Testing used this round:

- `node --check app.js`
- Local static server: `http://127.0.0.1:4173/`
- Real touch/mobile emulation for Android-like landscape viewports (`844 x 390`, `915 x 412`)

## 2026-06-04 Mobile Side Box Cleanup

- Current cache version: `styles.css?v=20260604-mobile-side-box-fix`, `app.js?v=20260604-mobile-side-box-fix`
- Latest mobile-landscape bottom structure:
  - left side box = status prompt + draw pile
  - center = action buttons + hand cards
  - right side box = recent action only
- Mobile landscape `selection-metrics` is intentionally hidden in this mode to avoid the right-side box being clipped again.
- Latest preview screenshots refreshed:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

## 2026-06-04 Mobile Side Panels Expanded

- Current cache version: `styles.css?v=20260604-mobile-side-panels-expanded`, `app.js?v=20260604-mobile-side-panels-expanded`
- Landscape touch layout now uses enlarged side panels modeled after the desktop/web structure:
  - left panel = status prompt + draw pile
  - center = action buttons + hand cards
  - right panel = recent action + three metric cards
- Preview helper was rebuilt with clean content and refreshed screenshots:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

## 2026-06-04 Mobile Bottom Band Alignment

- Current cache version: `styles.css?v=20260604-mobile-bottom-band-aligned`, `app.js?v=20260604-mobile-bottom-band-aligned`
- The touch-landscape in-game table now uses one shared bottom-band height so the three lower regions line up:
  - left = status prompt + draw pile
  - center = action buttons + hand cards
  - right = recent action + three metric cards
- The public-card area has been reduced vertically and tightened slightly so it no longer feels oversized against the lower panels.
- Latest preview screenshots refreshed:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`
