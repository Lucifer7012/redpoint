# Handoff

本文件用于在不同电脑、不同 Codex 会话之间交接 `redpoint` 项目进度。这里不记录 API Key、密码、Token、Cookie 或任何真实密钥。

## 2026-07-06 Lobby Focus Warning + Metrics Rect Follow-up

- 最新补充问题：用户在 Edge 控制台里看到大厅自定义人数下拉的 `Blocked aria-hidden ... descendant retained focus` 告警；同时右下三张状态小框虽然已经缩小，但边角还是显得发怪，希望改成长方形一点。
- 实际修法：`toggleLobbyPlayerCountMenu(false)` 关闭菜单时，如果当前焦点仍停在 `#player-count-menu` 内的选项按钮上，会先把焦点移回 `#player-count-trigger`，再走隐藏逻辑。
- 视觉收口：横屏右下三张 `selection-metrics` 小框继续保持在原位置和原宽度，只把圆角压低、整体高度再收一点，改成更规整的矮长方形；`最近动作` 区块不动。
- 当前缓存版本：`styles.css?v=20260706-focus-metrics-rect`，`app.js?v=20260706-focus-metrics-rect`。
- 本轮校验：`node --check app.js` 通过。
- 下一步如果用户还说“没变化”，先检查是否已经硬刷新到 `20260706-focus-metrics-rect`，再看是否还需要继续把这三张小框压得更扁。

## 2026-07-06 Settlement Score Chip + Metrics Follow-up

- 最新问题定位：用户实机截图确认，结算区 `得分牌` 的花色标签整列都在走深色文本，红桃 / 方块没有沿用牌面的红色语义；同时右下角三张状态小框在横屏结算态里仍然略高，底边会顶出容器。
- 实际修法：`renderSetupHistory()` 和 `renderRoundSettlementSummary()` 的标签渲染都已补上按 `isRedCard(card)` 输出的红 / 黑类名；对应 CSS 已补齐红黑花色颜色。
- 布局收口：保持右侧 `最近动作` 卡片完全不动，只缩小 `selection-metrics` 这三张小框的高度、间距、圆角、内边距和字号，避免再次把底边挤出去。
- 当前缓存版本：`styles.css?v=20260706-settlement-chip-metrics`，`app.js?v=20260706-settlement-chip-metrics`。
- 本轮校验：`node --check app.js` 通过；本地静态页 `http://127.0.0.1:4173/` 返回 `200`。
- 下一步如果还要继续跟：先让用户硬刷新或走最新 GitHub Pages 版本，再看真实结算截图里这两处是否还有残留问题；优先微调这三个小框，不要再去动 `最近动作` 区块尺寸。

## 2026-06-21 Mobile Draw Pile + Settlement Follow-up

- 用户继续跟进大厅里的 `上一局结算`，指出这块 UI 既不像当前牌桌风格，又容易在横屏小视口里过高、超出画面。当前已经按这个方向重做：不再是旧的大段文本白卡，而是更贴当前大厅 / 牌桌语气的紧凑排行卡。
- 实现上，`renderSetupHistory()` 已改成“名次 + 玩家名 + 大分数 + 两枚统计胶囊 + 得分牌标签区”的结构；红牌明细不再用长段中文句子，而是用和底部结算区接近的小标签。
- 样式上，`history-panel` 现在有最大高度兜底，内部 `result-grid` 与 `result-score-chips` 可各自滚动；移动横屏下会自动改单列并进一步收紧高度，优先保证不冲出画面。
- 这轮同时把缓存版本一起抬到了 `styles.css?v=20260621-history-ui-refresh` 和 `app.js?v=20260621-history-ui-refresh`，避免线上继续吃到旧的历史结算样式或结构。
- 用户又补了一条大厅体验要求：打完一把后点击“回到大厅”，大厅里不要自动铺开整块“上一局结算”；那块只应在用户主动点击 `上一局结算` 按钮时才出现。
- 当前实现已经按这个要求收口：`returnToSetup()` 会把大厅历史结算显式收起，`handleBackToSetup()` 也不再自动滚动到历史结算区域。
- 这次没有删除上局数据，`state.lastFinishedResult` 仍然保留；只是把展示时机从“回大厅自动展开”改成“用户主动查看时展开”。
- 另外补一条实际联测结论：上一轮虽然逻辑已经改进 `app.js`，但忘了同步抬 `index.html` 里的脚本缓存参数，所以线上可能继续命中旧 JS。当前已补到 `app.js?v=20260621-lobby-history-collapse`，如果公司电脑看到旧行为，先确认是不是还在跑更早缓存。
- 用户随后又把“三张相同”规则纠正了一次：不是只针对 `10 / J / Q / K`，而是只针对 `5 / 10 / J / Q / K`。上一轮把 `5` 漏掉了，所以如果公司电脑拉到较早的 2026-06-21 提交，会看到一段已经过时的“只限 10 / J / Q / K”描述。
- 当前正确规则已经再次统一到代码和文案里：`5` 既可以像普通数字牌那样单张钓 `5`，也可以在台面正好有 3 张 `5` 时，用手里 1 张 `5` 一次钓走那 3 张；其他普通数字牌仍然不能触发三张相同。
- 这次修正依然不是只改一个函数，而是一起改了三张相同资格判断、默认目标提示、手动选牌报错文案和 `index.html` 规则弹窗；另外把 `app.js` 缓存参数更新到了 `20260621-triple-capture-5`，方便线上重新联测时避开旧缓存。
- 单机结算卡又补了一轮收口：用户明确要求单机局里不要再出现 `不输不赢` 和 `单机练习局不涉及欢乐豆` 这两行，单纯展示 `得分牌` 即可。当前实现已经按 `beansRound` 是否存在来分流，单机不输出、欢乐豆局保留。
- 如果后续公司电脑继续优化结算卡空间，单机和欢乐豆局要区别看待：单机优先保留 `得分牌`，不要再把无意义的欢乐豆文案塞回来。
- 之后用户继续核对玩法，指出当前实现把“三张相同”错误放宽到了所有点数。现在已确认并收口为目标规则：普通数字牌只按凑十，只有 `5 / 10 / J / Q / K` 才能触发“三张相同”。
- 这次修正不是单点补丁，而是一起改了 AI、玩家手动选择判定、可点击高亮、规则提示和规则说明文案；如果公司电脑继续跟进玩法问题，先默认这些入口已经重新统一，不要只盯某一个函数。
- 因此像“最后桌面剩 4 张 4”这种残局，之后不能再用“三张相同也许能吃掉其中 3 张”去解释；按当前目标规则，它们仍然只能靠 `6` 去凑十。
- 这一轮之后又补了一次移动横屏结算卡内部重排：用户要求“不动左右上下整体布局，只把总分移到名字右边，好给得分牌让空间”。对应实现是在结算卡里新增 `settlement-card__title-row`，把玩家名和总分放进同一行。
- 这次不是继续压缩外框，而是用结构换空间：原来总分单独占一行，现在那一行被释放给 `得分牌`，所以高分场景下能多显示几张标签。
- 如果之后公司电脑继续跟进结算卡空间问题，优先沿着“卡内结构重排”思路改，不要第一反应又去动底部整条高度或左右三栏宽度。
- 最新用户反馈来自真实 GitHub Pages `915 x 412` Android 横屏截图，不是预览页想象问题：左侧提示条会压住下面牌堆框，牌堆内容看起来也没真正贴到底；另外结算态第二张卡里的 `得分牌` 一行会被底边裁掉。
- 这轮实际分成 4 次线上提交，顺序如下：
  - `be3479a Refine compact settlement display`
  - `69d9efc Tighten mobile draw pile bottom alignment`
  - `d2bf719 Stabilize mobile draw pile panel spacing`
  - `ea52b05 Compact settlement score chips on mobile`
- 真实结论是：前两次牌堆贴底微调还不够，真正把左侧重叠问题兜住的是 `d2bf719`。它把左侧提示条改成固定紧凑高度，并把牌堆区改成稳定底部对齐，所以后续如果再遇到左侧重叠，不要只回退/微调 `bottom` 或 `padding`，优先保住这套固定高度思路。
- 结算区这边，`be3479a` 已经把移动横屏上方重复悬浮结算去掉，只保留下方 `本局结算`，并把结算卡里的得分改成 `得分牌` 标签。`ea52b05` 进一步只缩小这些标签本身，不改结算卡外框和底部三栏整体布局。
- 这几轮没有改 `app.js` 缓存版本，也没有改整体底部三栏结构；主要都是 `styles.css` 的移动横屏微调。
- 本地已做的关键校验：
  - `node --check app.js`
  - 移动横屏模拟下确认左侧提示条与牌堆框不再重叠
  - 移动横屏模拟下确认结算卡第二列的 `得分牌` 一行可完整显示
  - 人工复核 `5 / 10 / J / Q / K` 三张相同资格、默认提示和规则弹窗文案已经一致
- 注意：这几轮为了快速核对，生成过一些本地临时截图放在 `artifacts/layout-check/`，但没有一并提交；公司电脑同步代码后，不会自动拿到这些临时验图，只会拿到代码和文档记录。

## 2026-06-15 Lobby Custom Select Follow-up

- 最新问题定位：上次只把大厅 `玩家人数` 的原生 `select` 做了尺寸收紧，但这轮继续跟进时确认，Windows/Chrome 的系统弹层仍然会出现展开项过大、右侧空白灰块、画风不统一的问题，单靠 CSS 很难稳定修干净。
- 实际修法：只把大厅单机模式里的 `玩家人数` 控件换成轻量自定义下拉；隐藏的原生 `<select id="player-count">` 继续保留为真实数据源，所以现有开始游戏和人数读取逻辑不需要重写。
- 交互收口：按 `Escape`、点击外部、切去 `好友联机`、离开大厅时都会自动收起；非大厅单机态下触发按钮会禁用。
- 当前缓存版本：`styles.css?v=20260615-lobby-custom-select`，`app.js?v=20260615-lobby-custom-select`。
- 本轮预览辅助页：`artifacts/layout-check/lobby-player-count-select-preview.html`。
- 本轮预览截图：`artifacts/layout-check/lobby-player-count-select-preview.png`。
- 已做校验：`node --check app.js`；内置 Browser 已确认预览页闭合态 / 展开态渲染正确；正式 `index.html?v=20260615-lobby-custom-select` 页面可正常加载，且无新增 warn / error 日志。

## 2026-06-14 Hand Action Target Only Follow-up

- 最新问题定位：用户实机截图确认，普通“出牌钓牌”时右侧“最近动作”也和之前补枪一样，把源牌和目标牌一起塞进了卡槽。
- 实际修法：新增 `getActionTargetCards()` 统一动作区展示牌；普通钓牌的 `aim` 和 `collect` 展示现在也只显示目标牌。
- 当前缓存版本：`styles.css?v=20260614-hand-action-target-only`，`app.js?v=20260614-hand-action-target-only`。
- 本轮预览辅助页：`artifacts/layout-check/action-stage-hand-capture-preview.html`。
- 本轮预览截图：`artifacts/layout-check/action-stage-hand-capture-preview.png`。
- 已做校验：`node --check app.js`；本机 Chrome headless 已确认“瞄准目标牌 / 钓成功”两种状态都只剩目标牌。

## 2026-06-14 Lobby Select Scale Follow-up

- 最新问题定位：用户实机截图确认大厅 `玩家人数` 下拉框的展开项太大，甚至会顶出当前界面；问题集中在原生 `#player-count` 的字号和行高，而不是大厅卡片布局本身。
- 实际修法：保留原生下拉交互，只把大厅里的 `#player-count` 和 `#player-count option` 字号、行高、内边距收紧到更贴近当前大厅 UI 的尺度。
- 当前缓存版本：`styles.css?v=20260614-lobby-select-scale`，`app.js?v=20260614-lobby-select-scale`。
- 本轮预览辅助页：`artifacts/layout-check/lobby-player-count-select-preview.html`。
- 本轮预览截图：`artifacts/layout-check/lobby-player-count-select-preview.png`。
- 已做校验：`node --check app.js`；本机 Chrome headless 已确认闭合态和列表态都比上一版更紧凑。

## 2026-06-14 Draw Capture Target Only Follow-up

- 最新问题定位：用户实机截图确认，补枪成功时右侧“最近动作”不该出现半张别的牌；根因是 `capturePendingDraw()` 把 `drawCard` 和 `targets` 一起传进了动作区，而右侧卡槽只有 `48px` 宽。
- 实际修法：保持动作区布局不动，只把补枪成功后的展示牌改成优先显示 `targets`；像“补枪成功：成功钓走 黑桃9”这种情况，现在只会显示黑桃9。
- 当前缓存版本：`styles.css?v=20260614-draw-capture-target-only`，`app.js?v=20260614-draw-capture-target-only`。
- 本轮预览辅助页：`artifacts/layout-check/action-stage-draw-capture-preview.html`。
- 本轮预览截图：`artifacts/layout-check/action-stage-draw-capture-preview.png`。
- 已做校验：`node --check app.js`；本机 Chrome headless 已确认动作区只显示单张目标牌。

## 2026-06-14 Hand Gap Relax Follow-up

- 最新补充需求：用户希望 `2 人 10 张` 不只是“能显示全”，而是要随着每次出牌，剩余手牌逐步铺开，重叠越来越少。
- 当前最新实现：手牌区已经从固定档位切换改成连续收放逻辑；每次渲染会先反推当前理想 gap，gap 压到 0 还不够时才进入 overlap，所以 10 -> 9 -> 8 张时会自然变松。
- 当前缓存版本：`styles.css?v=20260614-hand-gap-relax`，`app.js?v=20260614-hand-gap-relax`。

## 2026-06-14 Hand Overlap Fix Follow-up

- 最新问题定位：用户在真实 `915 x 412` 对局页里看到 `2 人 10 张` 仍没重叠，而且最后两张被裁掉；根因不是算法没算出来，而是后面的 `body.is-game-view` 样式把通用重叠规则覆盖回去了。
- 实际修法：在横屏对局专用的后置样式块里补齐 `.hand-grid.is-overlapped`、`.hand-grid.is-condensed` 和选中牌层级规则，确保正式对局页也会保留负间距重叠。
- 当前规则仍是上一轮那套：先保留正常间距；放不下先贴边；贴边还放不下才自动重叠；只要已经完整显示，就关闭横向滚动。
- 当前缓存版本：`styles.css?v=20260614-hand-overlap-fix`，`app.js?v=20260614-hand-overlap-fix`。
- 本轮预览辅助页：`artifacts/layout-check/hand-layout-preview.html`。
- 本轮预览截图：`artifacts/layout-check/hand-layout-preview-915x412.png`。
- 已做校验：`node --check app.js`；本机 Chrome headless 已重新导出 `915 x 412` 预览图；`2 人 10 张` 已完整显示，`3 人 7 张` 仍只贴边不重叠。

## 2026-06-14 Hand Layout Auto Fit Follow-up

- 最新方向：对局手牌区不再按模式硬编码滚动或重叠，而是改成按当前宽度自动判断。
- 当前规则：先尝试保留原间距；放不下就先贴边；贴边还放不下才自动重叠；只要已经能完整展示，就关闭横向滚动。
- 作用范围：共享本地手牌区，所以单机 / 好友联机共用；2 / 3 / 4 人模式都会按当前手牌数和容器宽度切换。
- 这轮没有改玩法逻辑，没有改手牌区按钮和整体布局，只改手牌排布策略。
- 当前缓存版本：`styles.css?v=20260614-hand-layout-auto-fit`，`app.js?v=20260614-hand-layout-auto-fit`。
- 本轮预览辅助页：`artifacts/layout-check/hand-layout-preview.html`。
- 本轮预览截图：`artifacts/layout-check/hand-layout-preview.png`。
- 已做校验：`node --check app.js`；本地 `http://127.0.0.1:4173/` 可访问；预览页已确认 `2 人 10 张自动重叠`、`3 人 7 张只贴边不重叠`。

## 2026-06-14 Daoist UI Polish Follow-up

- 最新方向：按用户要求保持布局和功能不变，只对 `创建游戏 ID`、大厅、对局和共享弹窗做了一轮轻量视觉美化。
- 风格约束：只借 `daoist_poker_deck` 的气质，不重新接入整套图片牌；当前方向是 `深青 + 暖金 + 米纸 + 少量朱砂`，偏克制、偏干净，不走重特效。
- 这轮重点：统一了标题字族、共享面板材质、按钮质感、牌桌底色、扑克牌纸面感、骰子结果卡和社交区弹窗风格。
- 这轮没有改动布局、交互和玩法逻辑；大厅结构、创建 ID 流程、单机/联机规则、当前 CSS 牌结构都保持原样。
- 当前缓存版本：`styles.css?v=20260614-daoist-ui-polish`，`app.js?v=20260614-daoist-ui-polish`。
- 本轮预览截图：`artifacts/layout-check/daoist-ui-id-setup-preview.png`、`artifacts/layout-check/daoist-ui-lobby-preview.png`、`artifacts/layout-check/daoist-ui-table-preview.png`。
- 已做校验：`node --check app.js`；本地 `http://127.0.0.1:4173/` 可访问；本机 Chrome headless 已导出三张预览图。

## 2026-06-10 ID Setup UI Follow-up

- 最新新增界面：`创建游戏 ID` 页面已经补齐为和登录页 / 大厅一致的深色游戏 UI，不再保留旧的浅色网页式面板。
- 改动范围：基础 `is-id-setup-mode` 现在使用深色半透明卡片、深色输入框、金色主按钮；手机横屏下进一步改成和大厅同一套全屏背景语言，左上标题说明、左侧创建卡片、右上退出/状态说明分区清晰。
- 这轮只动了 UI，没有改 `创建 ID` 本身的绑定逻辑；原有“登录后先建 ID，再进大厅”的流程保持不变。
- 当前缓存版本：`styles.css?v=20260610-id-setup-ui`，`app.js?v=20260610-id-setup-ui`。
- 本轮预览截图：`artifacts/layout-check/id-setup-ui-preview.png`、`artifacts/layout-check/id-setup-ui-desktop-preview.png`。
- 已做校验：`node --check app.js`；本机 Chrome headless 已验证 `915 x 412` 触屏横屏与 `1366 x 768` 桌面视口。

## 2026-06-10 Solo Resume Follow-up

- 最新新增功能：单机局现在也支持像好友联机那样，从大厅 `返回对局`，并额外支持 `关闭对局`。
- 入口位置：大厅单机模式右侧动作区；未结束单机局存在时，会显示一行说明和两个并排按钮 `返回对局` / `关闭对局`。
- 防误覆盖：这类挂起中的单机局存在时，大厅主按钮会改成 `单机进行中` 并禁用，必须先返回或关闭，才允许重新开新单机局。
- 对称限制也已补上：只要当前单机局还没关闭，就不能切去 `好友联机`，也不能创建好友房或接受好友房邀请。
- 恢复范围：`human-turn`、`ai-turn`、`dice-rolling`、`dice-result`、`opening-deal` 都做了处理；其中开局发牌中途返回大厅后，恢复时会从干净的开局动画重新播，不会重复发牌。
- 最新补丁：修复了关闭单机对局后，右侧社交面板里的邀请按钮还停留在 `先关闭单机对局` 的刷新问题。现在社交面板缓存会跟踪单机挂起状态，并在关闭/挂起切换时主动失效。
- 当前缓存版本：`styles.css?v=20260610-solo-lock-refresh`，`app.js?v=20260610-solo-lock-refresh`。
- 本轮预览辅助页：`artifacts/layout-check/solo-resume-preview.html`。
- 已做校验：`node --check app.js`。
- 注意：Codex 内置 Browser 当前被本地 URL 策略拦截，不能直接在这里打开 `localhost`/`file://` 预览；如果下轮需要人工看图或手动确认，用普通浏览器打开上面的预览辅助页即可。

## 新会话先读

在新电脑或新聊天里，先让 Codex 读取这些文件：

- `docs/HANDOFF.md`
- `docs/PROJECT_STATUS.md`
- `docs/CHANGELOG.md`
- `FEATURE_LOG.md`
- `agent.md`

可直接复制这句话作为开场：

```text
请先读取 docs/HANDOFF.md、docs/PROJECT_STATUS.md、docs/CHANGELOG.md、FEATURE_LOG.md 和 agent.md，然后继续这个项目的最新进度。不要记录任何 API Key、密码、Token。
```

## 固定口令

以后在任一电脑的新会话里，可以直接把这两句当成固定口令：

- `开始前帮我同步最新代码`
- `改完了，帮我检查并同步到 GitHub`

对应的本地脚本入口：

- `enable-auto-start-sync.cmd`
- `disable-auto-start-sync.cmd`
- `start-dev.cmd`
- `finish-dev.cmd`
- `tools\sync-start.cmd`
- `tools\sync-finish.cmd`

如果想手动运行 PowerShell 版本：

```powershell
.\tools\sync-start.ps1
.\tools\sync-finish.ps1 -Message "简短说明这次改动"
```

如果你不想敲命令，直接在项目根目录双击：

- `start-dev.cmd`
- `finish-dev.cmd`

如果你希望 Windows 登录后自动执行“开始前同步”，每台电脑各运行一次：

- `enable-auto-start-sync.cmd`

如果想取消自动开始同步：

- `disable-auto-start-sync.cmd`

## 跨电脑同步流程

推荐把 GitHub 仓库作为两台电脑之间的唯一同步源：

```powershell
git clone https://github.com/Lucifer7012/redpoint.git
cd redpoint
```

平时优先使用脚本入口。每次开始工作前：

```powershell
.\start-dev.cmd
```

如果已经运行过 `enable-auto-start-sync.cmd`，那么每次 Windows 登录后会自动执行这一动作，不需要你手动点。

每次结束工作前：

```powershell
.\finish-dev.cmd
```

结束同步仍建议手动触发，不默认做成开机或关机自动执行。原因很简单：自动 `commit` / `push` 很容易把半完成状态也推上去。

脚本会自动兼容两种结构：

- 新结构：项目根目录本身就是 Git 仓库。
- 旧结构：`C:\Users\OgCloud\Desktop\redpoint` 不是 Git 仓库，实际提交目录是 `_github_repo`，上传暂存目录是 `_github_upload`。

从 2026-06-03 起，旧结构下执行开始同步时，除了对 `_github_repo` 执行 `git pull --ff-only`，还会把跟踪文件回铺到项目根目录和 `_github_upload`，避免只更新隐藏仓库、工作目录仍停在旧版本。

## 每次交接要更新

每次修改代码或文档后，至少更新：

- `docs/CHANGELOG.md`：写本次改了什么、怎么验证。
- `docs/PROJECT_STATUS.md`：当前状态、缓存版本、测试方式、上传范围有变化时更新。
- `docs/HANDOFF.md`：如果当前正在做的事、下一步、已知风险或跨电脑流程有变化，更新本文件。
- `tools/`：如果同步脚本逻辑有变化，同步更新这里的脚本文件。
- `C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md`：仅限本机总工作记录，不放进 GitHub 项目。

当前 Codex 收尾约定：每次改完后按公司电脑的格式自动完成文档记录、检查、提交并同步到 GitHub；优先使用 `tools\sync-finish.cmd` 或 `.\tools\sync-finish.ps1 -Message "本次改动说明"`。

## 当前项目快照

- 项目：钓红点 / redpoint
- GitHub：`https://github.com/Lucifer7012/redpoint`
- 线上测试链接：`https://lucifer7012.github.io/redpoint/`
- 本地测试地址：`http://127.0.0.1:4173/`
- 当前缓存版本：`styles.css?v=20260618-settlement-layout-fix`，`app.js?v=20260621-triple-capture-5`
- 最近主要改动：移动横屏结算卡已收紧为“名字左边 + 总分右边 + 单机局只保留得分牌”的结构；左下 `状态提示 + 牌堆` 区也已经按固定紧凑高度稳定避让，不再互相压住。玩法规则方面，`三张相同` 当前只允许 `5 / 10 / J / Q / K` 触发，其中 `5` 既保留普通 `5 钓 5`，也保留“三张 5”一次钓走的特殊规则；普通出牌钓牌和补枪两条链路的右侧“最近动作”仍统一为只显示目标牌。

## 当前接力状态

- 上次做到哪里：已经把移动横屏结算卡、左下牌堆区和单机结算信息占位收紧完，并继续把“三张相同”规则纠正到 `5 / 10 / J / Q / K`。当前代码、默认提示和规则弹窗已经一致，不再停留在之前错误的“只限 10 / J / Q / K”版本。
- 下一步准备做什么：优先让用户在真实设备上复测 `5` 的两种玩法是否都符合预期。
  - 单张 `5` 钓单张 `5`
  - 台面 `3 张 5` 时，手里 `1 张 5` 一次钓走
- 当前先别动什么：不要把“三张相同”再放宽到其他普通数字牌；也不要回退已经完成的移动横屏结算压缩和左下牌堆固定高度方案，除非本轮任务明确要求。

## 当前可继续方向

- 继续验证不同手牌数量下的自适应排布，尤其是 2 人 10 张、3 人 7 张和后期手牌减少时是否会自然恢复非重叠状态。
- 继续测试登录 -> 创建 ID -> 大厅 -> 单机/好友联机 -> 对局 -> 结算循环，确认新手牌策略下没有出现横向滚动、裁切或选中层级异常。
- 如果要在另一台电脑继续开发，优先确认 `git pull --ff-only` 已拿到 GitHub `main` 最新提交。

## 测试方式

常规语法检查：

```powershell
node --check app.js
```

启动本地静态服务：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4173/
```

涉及界面布局时，优先验证：

- 桌面浏览器 100% 缩放。
- 安卓横屏模拟尺寸，例如 844 x 390。
- 手机横屏下登录页、大厅页、对局页是否仍能一屏操作。

## 注意事项

- 不要把桌面总工作记录 `C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md` 上传进项目仓库。
- 不要把 API Key、密码、Token、Cookie 或 Firebase 敏感配置写入记录文件。
- `docs/CHANGELOG.md` 和 `docs/PROJECT_STATUS.md` 应保留在 `docs/` 目录，不要传到仓库根目录。
- `tools/` 和 `agent.md` 也应随 GitHub 同步，这样两台电脑上的固定口令和项目上下文才一致。
- 当前 `app.js` 是较大的单文件，实现新功能前尽量小步修改，避免顺手大重构。

## 2026-06-04 Mobile Layout Follow-up

- Latest user correction for the in-game mobile landscape layout was very specific: do not place the status/action blocks above the hand area. Keep the hand area in the middle, and place the two small information zones on the left and right sides of that hand area.
- This has now been implemented at the CSS level in the touch-landscape game media query. The current structure is:
  - large middle public-card area
  - center-bottom hand panel with 3 action buttons
  - left-bottom side box for draw pile + status prompt
  - right-bottom side box for recent action + selection/rule info
- The main bug discovered during verification was not only styling: `.play-stage` was failing to stretch to the full viewport height in the preview/mobile scenario, which collapsed the public-card area. That stretching bug is now fixed.
- Preview helper also now includes the right-side metrics block so screenshots are closer to the real layout.
- Latest cache version is `20260604-game-bottom-side-panels`.
- Latest verification screenshots:
  - `artifacts/layout-check/mobile-layout-844x390.png`
  - `artifacts/layout-check/mobile-layout-915x412.png`

Suggested next step if the user keeps iterating on this area:

- Use the new screenshots as the visual baseline and only micro-adjust spacing, text density, and box balance instead of changing the three-part bottom structure again.

## 2026-06-04 Mobile Side Box Cleanup

- The prior mobile landscape version was still unacceptable in the real online viewport: the left and right bottom boxes looked clipped and overloaded.
- The current direction is now intentionally simpler and closer to the user request:
  - left box only handles status + draw pile
  - right box only handles recent action
  - no extra rule/selection metrics are shown in the right box on touch-landscape mode
- Cache version for this follow-up is `20260604-mobile-side-box-fix`.
- If more tweaks are needed next, keep working from the current three-part bottom structure and only adjust spacing, typography, and box sizing.

## 2026-06-04 Mobile Side Panels Expanded

- Latest direction for the mobile landscape in-game layout is no longer “compress side boxes until they fit”. It now explicitly follows the older web layout structure and gives both side panels dedicated space.
- Left panel is enlarged for status + draw pile. Right panel is enlarged for recent action + metric cards. The center hand area is narrowed accordingly.
- `artifacts/layout-check/public-area-preview.html` was rebuilt cleanly so future layout checks are easier to trust.
- Latest cache version is `20260604-mobile-side-panels-expanded`.

## 2026-06-04 Mobile Bottom Band Alignment

- Latest user request: make the public-card area smaller and make the three lower regions align in height.
- Implemented by introducing `--game-bottom-band-height` in the touch-landscape game CSS and using it for `.center-stage`, `.human-panel`, and the public-area clearance.
- The public-card container now sits higher, uses slightly tighter padding, and uses slightly smaller public cards so the table center no longer looks oversized.
- Latest cache version: `20260604-mobile-bottom-band-aligned`
- Latest verification:
  - `node --check app.js`
  - real touch/mobile emulation confirmed `(hover: none)`, `(pointer: coarse)`, landscape orientation, and `max-width: 960px`
  - refreshed screenshots:
    - `artifacts/layout-check/mobile-layout-844x390.png`
    - `artifacts/layout-check/mobile-layout-915x412.png`
- If the user keeps iterating here, stay on the current three-region structure and only micro-tune spacing, card density, or typography.
