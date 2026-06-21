# 功能记录

这个文件从 2026-05-18 开始记录项目后续新增功能和重要规则变更。每次增加新功能时，先写清楚目标、改动范围、验证方式和后续注意点，方便之后继续接手。

## 2026-06-18

## 2026-06-21

### 三张相同规则只保留给 10 / J / Q / K

- 背景：用户在复盘残局时指出，当前实现把“三张相同”做成了所有点数都能触发，这和目标玩法不符。目标规则应为：普通数字牌只按凑十处理；只有 `10 / J / Q / K` 才能用“三张相同”一次钓走台面 3 张同点牌。
- 改动：
  - 在 `app.js` 里把三张相同资格判断收口到 `TEN_RANKS`，只有 `10 / J / Q / K` 才会进入 triple 候选。
  - AI 选牌时不再把普通数字牌的“三张同点”当作候选最优解。
  - 玩家手动选牌判定时，普通数字牌选到 2 张或 3 张同点牌会直接判为无效，不再提示可继续构成“三张相同”。
  - 公共牌可点击高亮同步收口：普通数字牌不再因为台面有 3 张同点而整体亮起。
  - 对局规则提示和规则弹窗文案同步改成只对 `10 / J / Q / K` 生效，避免 UI 继续误导。
- 涉及文件：
  - `app.js`
  - `index.html`
  - `docs/CHANGELOG.md`
  - `docs/PROJECT_STATUS.md`
  - `docs/HANDOFF.md`
- 验证：
  - `node --check app.js` 通过。
  - 人工复核 AI、手动结算、可点亮目标、规则提示和规则说明，确认都统一收口到同一条规则。
- 后续注意：
  - 如果之后还有残局追查或加对局日志，关于普通数字牌残局必须按“只能凑十”去解释，不要再把“三张相同”作为默认可能性。

### 对局结束结算布局防重叠

- 背景：最新截图里，对局结束后桌面上的玩家结果卡被红牌明细撑得过高，底部“本局结算”区域也出现尺寸变化和结算卡互相叠住的问题。
- 改动：
  - 桌面玩家结果卡不再展开显示所有红牌，只保留名次、玩家、分数和红牌/赢牌数量，让它保持紧凑比分卡形态。
  - 底部结算区继续沿用原手牌区固定高度，结算卡改为同一行自适应排列；空间不足时在结算区内部滚动，不再把整个中间区域撑高。
  - 赢家结算卡里的“直接领取 / 看广告翻倍”按钮保留，但在横屏紧凑布局下同步压缩高度和字号，避免按钮把卡片撑爆。
  - 结算态手牌面板补上更明确的层级和浅色不透明背景，避免被绿色桌面底色压暗。
  - 同步把 `artifacts/layout-check/public-area-preview.html` 的 CSS 缓存参数改到当前版本，避免辅助预览页继续引用旧样式。
  - 缓存版本更新为 `20260618-settlement-layout-fix`。
- 涉及文件：
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/settlement-layout-preview.html`
  - `artifacts/layout-check/settlement-layout-preview-1280x720-after.png`
- 验证：
  - `node --check app.js` 通过。
  - 本地静态服务打开结算预览页，Chrome headless 导出 `settlement-layout-preview-1280x720-after.png`，确认底部 4 张结算卡无重叠，桌面玩家结果卡不再被红牌明细撑高。
- 后续注意：
  - 如果之后还要展示每名玩家完整红牌列表，优先放在底部结算卡或“查看详情”里，不要再放回桌面浮动玩家结果卡。

## 2026-06-15

### 大厅人数下拉框改为轻量自定义菜单

- 背景：上次把大厅 `玩家人数` 的原生 `select` 只做了字号和行高收紧，但这轮继续接着看用户反馈时，问题并没有真正消失。Windows/Chrome 的原生弹层仍会出现展开项过大、右侧空白灰块、视觉风格和大厅不一致的问题，这一层基本不受我们自己的 CSS 稳定控制。
- 改动：
  - 只替换大厅单机模式里的 `玩家人数` 控件，不动大厅整体布局，也不改单机 / 好友联机流程。
  - 在 `index.html` 里新增：
    - `#player-count-select`
    - `#player-count-trigger`
    - `#player-count-display`
    - `#player-count-menu`
    - `.lobby-select-option`
  - 原生 `<select id="player-count">` 继续保留，但改成视觉隐藏；它仍然是实际数据源，现有逻辑继续读取 `ui.playerCount.value`。
  - `app.js` 新增并接通：
    - `syncLobbyPlayerCountMenu()`
    - `toggleLobbyPlayerCountMenu(force)`
    - `handleLobbyPlayerCountTrigger(event)`
    - `handleLobbyPlayerCountOption(event)`
  - 补了完整收口逻辑：
    - 按 `Escape` 收起
    - 点击组件外部收起
    - 切到 `好友联机` 自动收起
    - 离开大厅或回到未登录 / 创建 ID 阶段时自动收起
    - 非大厅单机态下触发按钮自动禁用
  - `styles.css` 新增大厅自定义下拉的触发器、箭头、浮层和激活态样式，并把大厅玩家卡片在单机态改成允许浮层外溢；好友联机态仍保持 `overflow: hidden`。
  - 预览页 `artifacts/layout-check/lobby-player-count-select-preview.html` 改成使用和正式页一致的自定义结构，同时展示闭合态和展开态。
  - 缓存版本更新为 `20260615-lobby-custom-select`，并同步更新正式页和相关预览页引用。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/lobby-player-count-select-preview.html`
  - `artifacts/layout-check/action-stage-draw-capture-preview.html`
  - `artifacts/layout-check/action-stage-hand-capture-preview.html`
  - `artifacts/layout-check/hand-layout-preview.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置 Browser 打开 `artifacts/layout-check/lobby-player-count-select-preview.html`，已确认闭合态和展开态都走自定义样式。
  - 重新生成 `artifacts/layout-check/lobby-player-count-select-preview.png` 作为这轮预览图。
  - 内置 Browser 打开正式 `index.html?v=20260615-lobby-custom-select`，已确认页面可正常加载，`#player-count-trigger` / `#player-count` 结构存在，且无新增 warn / error 日志。
- 后续注意：
  - 后面如果继续微调这块，优先只动自定义下拉的视觉细节和展开位置，不要把大厅人数逻辑再改回系统原生弹层。
  - 既然隐藏的 `#player-count` 还是唯一真实值，后续任何新逻辑都继续从它读写，避免 UI 状态和业务状态分叉。

## 2026-06-14

### 出牌钓牌动作区也改成只显示目标牌

- 背景：用户继续给出实机截图，指出“出牌钓牌的时候也有这个问题，跟之前补枪的一样”。排查后确认，这次不是 `capturePendingDraw()`，而是普通手牌钓牌链路里的 `stageAiHandTurn()` 和 `captureHandCard()` 还在把源牌和目标牌一起塞进动作区。
- 改动：
  - 新增共享 helper `getActionTargetCards(targets, fallbackCard)`，统一把“动作区应该显示哪些牌”从结算数据里剥离出来。
  - AI 普通出牌钓牌时，`正在瞄准 XXX` 这类 `aim` 展示现在只显示目标牌，不再显示打出去的源牌。
  - 普通手牌钓牌成功后，`captureHandCard()` 里的右侧最近动作和座位最近动作缩略牌也统一改成只显示目标牌。
  - 之前已经修过的补枪成功展示同步切到同一个 helper，避免后面 снова 分叉。
  - 新增独立预览页 `artifacts/layout-check/action-stage-hand-capture-preview.html`，同时展示：
    - `正在瞄准 红桃6`
    - `成功钓走 红桃6`
  - 生成截图 `artifacts/layout-check/action-stage-hand-capture-preview.png` 作为这轮预览图。
  - 缓存版本更新为 `20260614-hand-action-target-only`。
- 涉及文件：
  - `app.js`
  - `index.html`
  - `artifacts/layout-check/action-stage-hand-capture-preview.html`
  - `artifacts/layout-check/action-stage-draw-capture-preview.html`
  - `artifacts/layout-check/lobby-player-count-select-preview.html`
  - `artifacts/layout-check/hand-layout-preview.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - `artifacts/layout-check/action-stage-hand-capture-preview.png` 已确认瞄准和钓成功都只显示单张目标牌。
- 后续注意：
  - 以后只要动作文案说的是“目标牌”，就优先走 `getActionTargetCards()`，不要再把源牌原样塞进动作区卡槽。

### 大厅人数下拉框缩小到和面板同一尺度

- 背景：用户最新截图指出大厅里 `玩家人数` 的下拉框展开后太大，甚至会顶出当前界面范围。问题集中在原生 `select/option` 的显示尺寸，不是大厅主卡片布局本身。
- 改动：
  - 继续沿用原生下拉框，不改成交互更重的自定义菜单，避免把大厅这块越改越复杂。
  - 只针对 `body.is-lobby-setup .setup-panel.is-lobby-mode #player-count` 收紧尺寸：
    - `min-height` 从 `32px` 调成 `30px`
    - 减小左右内边距
    - 明确设置 `font-size: 14px`、更稳的 `font-weight` 和 `line-height`
    - 同步给 `#player-count option` 指定字号和行高，让展开项也跟着缩小
  - 新增 `artifacts/layout-check/lobby-player-count-select-preview.html`，用同一套样式展示闭合态和列表态，方便后续单独验证这块。
  - 生成 `artifacts/layout-check/lobby-player-count-select-preview.png` 作为这一轮预览图。
  - 缓存版本更新为 `20260614-lobby-select-scale`。
- 涉及文件：
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/lobby-player-count-select-preview.html`
  - `artifacts/layout-check/hand-layout-preview.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
  - `artifacts/layout-check/action-stage-draw-capture-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - `artifacts/layout-check/lobby-player-count-select-preview.png` 已确认列表态不再出现过大的行高和字号。
- 后续注意：
  - 这轮优先保留原生下拉框；如果后续 Windows/Chrome 真机上原生弹层仍有平台级放大问题，再考虑改为自定义大厅下拉组件。

### 补枪成功的最近动作不再混入摸牌

- 背景：用户给了实机截图，指出“补枪补掉黑桃9的话，只显示黑桃9不就行了吗？怎么还出现半张别的牌”。继续排查后确认，不是动作区布局突然坏了，而是 `capturePendingDraw()` 在补枪成功后把 `drawCard` 和 `targets` 一起传给了最近动作。
- 改动：
  - 保持现有右侧最近动作面板布局不动，只修补枪成功这一个数据入口，避免误伤普通出牌、弃牌和其他动作展示。
  - `capturePendingDraw()` 里新增 `displayCards`，补枪成功后优先只显示 `targets`；只有极端兜底情况下目标为空时，才退回显示 `drawCard`。
  - 这样像“补枪成功：成功钓走 黑桃9”时，动作区只会显示黑桃9，不会再把补枪用掉的摸牌塞进同一个 48px 卡槽里。
  - 新增独立预览页 `artifacts/layout-check/action-stage-draw-capture-preview.html`，直接复现这条文案和动作牌展示。
  - 使用本机 Chrome headless 导出 `artifacts/layout-check/action-stage-draw-capture-preview.png`，作为这一轮的对照图。
  - 缓存版本更新为 `20260614-draw-capture-target-only`。
- 涉及文件：
  - `app.js`
  - `index.html`
  - `artifacts/layout-check/action-stage-draw-capture-preview.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
  - `artifacts/layout-check/hand-layout-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - `artifacts/layout-check/action-stage-draw-capture-preview.png` 已确认动作区只显示单张目标牌。
- 后续注意：
  - 如果后面还要继续调整“最近动作”显示，优先先区分“动作文本想表达的目标牌”和“内部结算用的源牌 + 目标牌”这两套数据，不要直接把结算数组原样喂给右侧卡槽。

### 手牌会随着出牌逐步铺开

- 背景：用户继续明确了想要的细节，不只是“10 张能显示全”，而是希望 `10 张手牌每出掉一张，手牌就铺开一点，重叠的部分少一点`。
- 改动：
  - 在 `syncResponsiveHandLayout()` 里把原本偏离散的判断进一步改成连续收放逻辑。
  - 现在每次渲染都会先根据 `当前可用宽度 / 当前手牌张数 / 单张牌宽 / 原始 gap` 反推一个理想牌间距：
    - 理想间距大于等于原始 gap：保持原样；
    - 理想间距在 `0 ~ 原始 gap` 之间：直接用这个动态 gap，让手牌随着张数减少逐步铺开；
    - 理想间距小于 0：说明光靠压 gap 还不够，这时才进入 overlap，并用负 gap 的绝对值计算当前真正需要的重叠量。
  - 这样不是只会在“重叠”和“非重叠”之间跳，而是会在剩余手牌减少时连续变松：先减少重叠、再恢复贴边、最后恢复正常间距。
  - `artifacts/layout-check/hand-layout-preview.html` 里的演示脚本也同步切到同一套连续计算逻辑，避免预览和正式页再分叉。
  - 缓存版本更新为 `20260614-hand-gap-relax`。
- 涉及文件：
  - `app.js`
  - `index.html`
  - `artifacts/layout-check/hand-layout-preview.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 预览页脚本与正式逻辑已保持一致，后续再验 `10 -> 9 -> 8` 张时会按剩余手牌数量连续放宽。
- 后续注意：
  - 如果后面还要继续调这块，优先只改“理想 gap”和“最小可见牌宽”的边界，不要退回到按固定档位写死的铺牌方式。

### 真实对局页补上手牌重叠覆盖修复

- 背景：上一轮已经把手牌区改成按宽度自动选择“正常间距 / 贴边 / 重叠”，但用户在真实 `915 x 412` 对局页里反馈 `2 人模式 10 张手牌还是没重叠，而且少了 2 张`。继续排查后确认，不是算法判断错，而是正式对局页里后置的横屏 CSS 把重叠样式顶回去了。
- 改动：
  - 保留上一轮的自适应逻辑，不回退到“2 人局固定重叠”这种硬编码。
  - 在正式对局使用的后置 `body.is-game-view` 样式块里补齐：
    - `body.is-game-view .hand-grid.is-overlapped .card-btn`
    - `body.is-game-view .hand-grid.is-overlapped .card-btn:first-child`
    - `body.is-game-view .hand-grid.is-condensed .card-btn:nth-child(...)`
    - `body.is-game-view .hand-grid.is-overlapped .card-btn.source-selected`
  - 这样真实对局页就不会再被通用的 `margin-left: 0` 规则把负间距重叠覆盖掉；JS 算出的 `--hand-overlap` 会在正式页真正生效。
  - 同步把 `artifacts/layout-check/hand-layout-preview.html` 调整为更适合验图的预览页，只保留手牌区相关排布规则，并新增 `artifacts/layout-check/hand-layout-preview-915x412.png` 作为这一轮的清晰预览图。
  - 缓存版本更新为 `20260614-hand-overlap-fix`，避免用户设备继续拿到旧的 `styles.css` / `app.js` 资源引用。
- 涉及文件：
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/hand-layout-preview.html`
  - `artifacts/layout-check/hand-layout-preview-915x412.png`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 使用本机 Chrome headless 导出 `artifacts/layout-check/hand-layout-preview-915x412.png`。
  - 预览页确认：
    - `2 人 10 张` 为自动重叠且无需横向滚动
    - `3 人 7 张` 为贴边完整展示且不重叠
- 后续注意：
  - 这一轮真正修的是“真实对局页的样式覆盖顺序”，不是重新设计手牌算法；后面如果再出现“预览对、正式页不对”，优先先查是否又被后续 `body.is-game-view` 规则覆盖。
  - 如果后续继续微调，只优先动“最小可见牌宽 / 重叠阈值”，不要把规则重新改回按模式写死。

### 手牌区按可用宽度自动选择“正常间距 / 贴边 / 重叠”

- 背景：用户先提出 2 人模式下的 10 张手牌希望像参考图那样叠起来，一次性全部展示，不要再靠左右拖动；随后又补充了更精确的规则：如果像 3 人模式那样，牌和牌贴着就已经能完整展示，那就不需要重叠，只有展示不下时才重叠。
- 改动：
  - 这轮不再把“2 人模式固定重叠”写死，而是把手牌区改成按当前容器宽度动态判断。
  - `render()` 之后新增 `syncResponsiveHandLayout()`，并在窗口缩放时同步重算，避免只在首次渲染时生效。
  - 判断顺序改为三档：
    - 能保留原有手牌间距完整展示：保持原样；
    - 放不下，但牌贴着牌就能完整展示：压成 `gap: 0`，不重叠；
    - 贴边后仍放不下：自动计算需要的重叠量，再把整排手牌压进当前区域。
  - 当压到贴边或重叠后已经可以完整展示时，会自动关闭横向滚动并居中显示；如果极端小宽度下即使重叠仍放不下，才保留滚动兜底，避免把最后几张牌直接裁掉。
  - 为了避免压缩态下视觉上下错落，`.hand-grid.is-condensed` 会取消原本奇偶手牌的轻微高低差；进入重叠态后则按 `--card-index` 重新设定层级，保证后面的牌自然压在前面上方，被选中的手牌继续抬起。
  - 这套逻辑是绑在共享的本地手牌区上，所以单机 / 好友联机共用；2 / 3 / 4 人模式都会按“能否完整展示”自动切换，不再按模式硬编码。
  - 新增手牌布局专用预览页 `artifacts/layout-check/hand-layout-preview.html`，内置与正式逻辑同顺序的演示脚本，用来快速看 `2 人 10 张` 与 `3 人 7 张` 两种场景。
  - 缓存版本更新为 `20260614-hand-layout-auto-fit`。
- 涉及文件：
  - `app.js`
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
  - `artifacts/layout-check/hand-layout-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本地静态服务 `http://127.0.0.1:4173/` 可访问。
  - 导出 `artifacts/layout-check/hand-layout-preview.png`，确认：
    - `2 人 10 张` 命中 `is-condensed + is-overlapped + is-fit`
    - `3 人 7 张` 命中 `is-condensed + is-fit`，但不命中 `is-overlapped`
- 后续注意：
  - 后面如果继续调整这块，优先只改“最小可见牌宽”和“压缩阈值”，不要再回到按模式写死的手牌排列规则。
  - 预览页里的演示脚本只是为了快速看效果；正式逻辑以 `app.js` 里的 `syncResponsiveHandLayout()` 为准。

### 大厅 / 创建 ID / 对局道风轻量视觉美化

- 背景：用户希望在不改布局、不改功能的前提下，把现有 UI 再做得更好看一点；参考 `C:\Users\HOUSE\Documents\Codex\2026-06-04\apikey-gpt-image-2\outputs\daoist_poker_deck`，但明确说如果风格太重就收一点。
- 改动：
  - 这轮没有重新接入图片扑克牌资源，也没有改大厅、创建 ID、对局、弹窗的结构和交互；只做轻量视觉升级。
  - `:root` 主题变量统一到更克制的 `深青 + 暖金 + 米纸 + 少量朱砂` 方向，补上共享的 `--ink`、`--paper`、`--gold`、`--seal` 等色值。
  - 标题字族切到偏书卷气的中文 serif / 楷体栈，正文保留更稳妥的系统 sans 栈，避免为了风格牺牲可读性。
  - 大厅、创建 ID、历史区、手牌区、结果区、规则弹窗、欢乐豆弹窗、社交区等共享面板统一为更温润的纸面渐变、细描边和暖色阴影。
  - 主按钮改成偏金色压印质感，次按钮维持更素一点的米纸按钮，保持原本信息层级不变。
  - 对局牌桌底色从单纯绿色桌布收成更深的青绿色，骰子结果卡、座位标签和最近动作等细部同步统一到同一套语气。
  - 当前 CSS 扑克牌继续保留原结构，只把牌面调成更接近米纸卡、细边框、暖色阴影和更稳妥的红黑花色，不重新引入图片牌。
  - 修了一处顺手发现的细节：大厅社交区搜索按钮在较窄宽度下会换行，现在已强制保持单行。
  - 缓存版本更新为 `20260614-daoist-ui-polish`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本地静态服务 `http://127.0.0.1:4173/` 可访问。
  - 使用本机 Chrome headless 生成：
    - `artifacts/layout-check/daoist-ui-id-setup-preview.png`
    - `artifacts/layout-check/daoist-ui-lobby-preview.png`
    - `artifacts/layout-check/daoist-ui-table-preview.png`
- 后续注意：
  - 后续如果继续调这套风格，优先沿着颜色、材质、阴影和字体细节继续微调，不要反手把布局和功能一起动掉。
  - 暂时不要重新接入 `assets/cards/daoist/` 一整套图片牌；当前方向是借道风气质，不回到重素材方案。

## 2026-06-10

### 创建游戏 ID 页面统一到登录 / 大厅风格

- 背景：用户追问“注册 ID 的 UI 是不是没有一起改”；排查后确认 `is-id-setup-mode` 仍停留在旧的浅色 setup 面板，和已经改完的登录页 / 大厅风格不一致。
- 改动：
  - 为 `.setup-panel.is-id-setup-mode` 补上深色半透明卡片、深色输入框、金色主按钮、金色边线 / 阴影，统一到账户体系 UI 语言。
  - 手机横屏 `body.is-lobby-setup .setup-panel.is-id-setup-mode` 改成和大厅同源的全屏背景布局：左上标题说明、左侧输入卡与主按钮、右上退出登录和状态说明。
  - 顶部账户区在创建 ID 阶段收窄为“退出登录 + 状态说明”，隐藏不适用的 ID 胶囊与登录方式按钮，避免和创建 ID 主流程抢空间。
  - `artifacts/layout-check/solo-resume-preview.html` 同步切换到新缓存版本，避免继续使用旧资源。
  - 这轮没有改动 `创建 ID` 的绑定逻辑，只做 UI 一致性修正。
  - 缓存版本更新为 `20260610-id-setup-ui`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 使用本机 Chrome headless + Playwright 生成：
    - `artifacts/layout-check/id-setup-ui-preview.png`
    - `artifacts/layout-check/id-setup-ui-desktop-preview.png`
  - 其中 `915 x 412` 触屏横屏截图确认移动端创建 ID 页已切到游戏化全屏布局；`1366 x 768` 桌面截图确认基础深色卡片样式已生效。
- 后续注意：
  - 当前如果还要继续抠细节，优先看桌面端右侧空白感是否要再收一轮；若用户不继续提，这一版已经达到“和登录 / 大厅同风格”的目标。

### 单机从大厅返回对局 / 关闭对局

- 背景：用户指出当前“好友联机”从大厅可以回到进行中的对局，但“单机”从对局返回大厅后没有同类入口，导致一旦点了“回到大厅”，只能默认丢掉现场。
- 改动：
  - 新增本地单机挂起状态 `soloResume`，用于记录从单机局退回大厅时的可恢复阶段。
  - 挂起范围覆盖 `human-turn`、`ai-turn`、`dice-rolling`、`dice-result`、`opening-deal` 五种阶段。
  - `returnToSetup()` 现在会在“非联机、且仍是未结束单机局”时保留必要对局状态，而不是一律清空。
  - 大厅 `renderLobbyModeControls()` 新增单机专用动作渲染：在单机模式右侧动作区显示一条“单机对局中”说明，以及 `返回对局`、`关闭对局` 两个按钮。
  - 跟进修正了首版动作区高度不够的问题：提示压缩为一行，`返回对局` / `关闭对局` 改成并排，避免 `关闭对局` 被裁出面板。
  - 补上和好友房相对称的锁定规则：只要当前还有未关闭的单机对局，就不能切到 `好友联机`，也不能创建好友房或接受好友房邀请。
  - 大厅好友联机标签、社交面板创建房间按钮、房间邀请弹窗和邀请列表里的接受入口，都会显示“先返回或关闭当前单机对局 / 先关闭单机对局”之类的锁定状态。
  - 修复后续回归：关闭单机对局后，社交面板里的好友房邀请按钮不会再因为旧的渲染缓存而继续停留在 `先关闭单机对局`。现在缓存签名会纳入单机挂起状态，并且在单机挂起状态切换时主动清空社交缓存。
  - `返回对局` 会根据挂起阶段恢复：
    - `human-turn`：直接回到当前本地玩家操作阶段；
    - `ai-turn`：恢复后重新挂起一次 AI 步骤定时器；
    - `dice-rolling` / `dice-result`：重新播放一轮开局骰子动画；
    - `opening-deal`：先清空半发牌状态，再从干净的开局发牌动画重新播放，避免重复发牌。
  - `关闭对局` 会清空当前本地单机局的牌桌、牌堆、日志、开局动画状态和挂起标记，彻底回到大厅待开局状态。
  - 大厅主按钮在这类挂起单机局存在时会显示 `单机进行中` 并禁用，避免用户误点“开始游戏”直接覆盖当前单机局。
  - 一旦开始新单机局、结束当前对局、切入联机对局或登出账号，旧的 `soloResume` 都会被清空，避免状态串线。
  - 缓存版本更新为 `20260610-solo-lock-refresh`。
- 涉及文件：
  - `app.js`
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/solo-resume-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 使用本机 Chrome headless 模拟“大厅内存在好友邀请 + 当前有挂起单机局”，确认点击 `关闭对局` 后，邀请按钮会立即从 `先关闭单机对局` 切回 `查看邀请`。
  - 新增 `artifacts/layout-check/solo-resume-preview.html` 作为本轮手动预览辅助页，可复现“单机开局 -> 回到大厅 -> 大厅显示返回/关闭”的状态。
- 后续注意：
  - Codex 当前会话内置 Browser 被本地 URL 策略拦截，无法直接在这里打开 `localhost` / `file://` 预览页；若下轮要继续做这一块的视觉微调，请直接在普通浏览器打开预览辅助页或真实 `index.html` 做人工确认。

## 2026-06-09

### 公共牌区多牌自动扩宽

- 背景：用户指出四人横屏公共牌大框左右两边留白明显浪费；当公共牌超过 12 张时，不该这么快堆到第三行，更不该把第一行挤出可视区。
- 改动：
  - `renderTableCards()` 现在会按公共牌数量动态切换类名：
    - `13-14 张` 挂 `is-expanded-7`
    - `15 张及以上` 挂 `is-expanded-8`
    - `17 张及以上` 才挂 `is-overflowing-rows`
  - 触屏横屏公共牌区默认仍是 6 列上限，但 `is-expanded-7` / `is-expanded-8` 会把公共牌容器 `max-width` 分别放宽到 7 列和 8 列，优先吃掉左右空白。
  - 只有真的进入 3 行时才切换到贴顶排布，避免 13 张这种场景因为内容垂直居中而把第一行顶出可视区。
  - 这轮没有继续缩小公共牌尺寸，也没有在左右空白区增加提示文字或别的面板，保持牌桌主视觉干净。
- 涉及文件：
  - `app.js`
  - `styles.css`
  - `index.html`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 本地静态服务 `http://127.0.0.1:4173/` 可访问。
  - 本机 Chrome 触屏横屏 `915 x 412` 截图验证：
    - `artifacts/layout-check/public-area-13-expanded-915x412.png`
    - `artifacts/layout-check/public-area-15-expanded-915x412.png`
  - 两张图分别确认了 `13 张 = 7 + 6`、`15 张 = 8 + 7`，公共牌开始利用左右留白扩宽。

## 2026-06-07

### 扑克牌内部图案分离

- 背景：用户补充说明“不要把牌堆在一起”指的是牌面内部图案不要堆叠，而不是牌与牌之间的排列；参考图希望左上角是点数和小花色，右下角是独立的大花色。
- 改动：
  - `.card-corner` 从普通文本流改成绝对定位，固定在牌面左上角，避免被按钮文本居中规则带到牌面中间。
  - 右下大花色继续使用 `.card-center-suit`，但在触屏横屏小牌上进一步缩小，和左上角组拉开。
  - 公共牌宽度从 `clamp(38px, 4.3vw, 42px)` 调整为 `clamp(44px, 4.8vw, 48px)`，手牌宽度从 `clamp(48px, 5.1vw, 56px)` 调整为 `clamp(54px, 5.7vw, 62px)`。
  - 触屏横屏下公共牌、手牌、最近动作小牌分别使用更保守的点数/小花色/大花色字号，保证小牌里三组图案不互相压住。
  - 缓存版本更新为 `20260607-card-symbol-spacing`。
- 涉及文件：
  - `index.html`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-card-symbol-spacing` 与 `app.js?v=20260607-card-symbol-spacing`，入口页 `.card-face` 数量为 0。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-card-symbol-spacing-4p-915x412.png`
    - `artifacts/layout-check/real-index-card-symbol-spacing-4p-844x390.png`
    - `artifacts/layout-check/real-index-card-symbol-spacing-2p-915x412.png`
  - `artifacts/layout-check/card-symbol-spacing-check.json` 记录三种视口均命中触屏横屏媒体规则，公共牌/手牌之间不重叠，牌内部 `rank / smallSuit / centerSuit` 也无重叠。

### 简洁斗地主式 CSS 扑克牌面

- 背景：恢复原本牌后，用户反馈当前 CSS 牌仍然太丑，并给出斗地主手牌参考；随后明确补充“能不用重叠的时候还是不要重叠，单纯颜色图案和数字就行”。
- 改动：
  - `createCardButton()` 改为只渲染 `.card-corner` 和 `.card-center-suit`，牌面可见内容只剩点数/字母与花色图案。
  - “钓牌值 / 计分值 / 牌名”等说明保留在 `aria-label`，不再占用视觉牌面。
  - `.card-btn` 改为白色扑克牌底、细边框、小圆角、轻微内阴影和投影，红黑花色直接用牌面颜色区分。
  - 取消手牌和公共牌的负间距重叠；`.hand-grid` 改为有小间距的安全居中，超宽时横向滚动。
  - 手机横屏牌宽略微放大：公共牌宽度更新为 `clamp(38px, 4.3vw, 42px)`，手牌宽度更新为 `clamp(48px, 5.1vw, 56px)`。
  - 本地手牌不再使用旧 `hidden-zone` 深色底，始终显示为白色扑克牌。
  - `artifacts/layout-check/public-area-preview.html` 同步为新 CSS 牌结构。
  - 缓存版本更新为 `20260607-clean-poker-cards`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-clean-poker-cards` 与 `app.js?v=20260607-clean-poker-cards`，入口页无 `.card-face` / `.card-top` 旧牌元素。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-clean-poker-cards-4p-915x412.png`
    - `artifacts/layout-check/real-index-clean-poker-cards-4p-844x390.png`
    - `artifacts/layout-check/real-index-clean-poker-cards-2p-915x412.png`
  - `artifacts/layout-check/clean-poker-cards-check.json` 记录三种视口均命中触屏横屏媒体规则，`cardFaceCount` 为 0；4 人手牌不重叠，2 人 10 张手牌也不重叠，超出中心手牌区时使用横向滚动。

### 恢复原本 CSS/文字扑克牌面

- 背景：用户确认当前版本仍在显示其重新设计的扑克牌，但这次实际希望回到使用该牌面之前的原本牌样式。
- 改动：
  - 反向撤回 `2f6a179 Add daoist card faces` 中的图牌接入。
  - 删除 `CARD_FACE_BASE_PATH`、`CARD_FACE_SUIT_SUFFIX`、`getCardFaceSrc()` 等图牌路径逻辑。
  - `createCardButton()` 恢复为 `.card-top` / `.card-bottom` 的文字牌结构，显示花色符号、点数、钓牌值和计分值。
  - `.card-btn` 恢复原本的 CSS 牌面尺寸、内边距、圆角、选中态和可钓目标背景，不再使用 `<img class="card-face">`。
  - `artifacts/layout-check/public-area-preview.html` 恢复为文字牌预览，并更新缓存号。
  - 删除 `assets/cards/daoist/` 52 张 WebP、道风牌验证 JSON 和道风牌截图，避免当前版本继续引用或同步这套牌。
  - 同步脚本保留 `artifacts/layout-check` 跟踪，后续预览图仍会随 GitHub 同步；不再把 `assets` 作为当前必传项。
  - 缓存版本更新为 `20260607-original-card-faces`。
- 涉及文件：
  - `index.html`
  - `app.js`
  - `styles.css`
  - `artifacts/layout-check/public-area-preview.html`
  - `tools/sync-start.ps1`
  - `tools/sync-finish.ps1`
  - `assets/cards/daoist/`（删除）
  - `artifacts/layout-check/daoist-card-faces-check.json`（删除）
  - `artifacts/layout-check/real-index-daoist-cards-*.png`（删除）
- 验证：
  - `node --check app.js` 通过。
  - 内置浏览器确认真实页面加载 `styles.css?v=20260607-original-card-faces` 与 `app.js?v=20260607-original-card-faces`，入口页 `.card-face` 数量为 0。
  - 真实 `index.html` 在本机 Chrome + Playwright 触屏横屏下截图验证：
    - `artifacts/layout-check/real-index-original-cards-4p-915x412.png`
    - `artifacts/layout-check/real-index-original-cards-4p-844x390.png`
  - `artifacts/layout-check/original-card-faces-check.json` 记录两种视口均命中触屏横屏媒体规则，`cardFaceCount` 为 0，`cardButtonCount` 为 17，阶段进入 `human-turn`。

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
