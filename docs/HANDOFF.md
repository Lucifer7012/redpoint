# Handoff

本文件用于在不同电脑、不同 Codex 会话之间交接 `redpoint` 项目进度。这里不记录 API Key、密码、Token、Cookie 或任何真实密钥。

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
- 当前缓存版本：`styles.css?v=20260614-hand-overlap-fix`，`app.js?v=20260614-hand-overlap-fix`
- 最近主要改动：已补上真实对局页里把手牌重叠覆盖回去的后置 CSS，`2 人 10 张` 不会再在正式页里少最后两张；手牌区自适应规则和轻量道风视觉美化仍保留。此前补上的“单机局从大厅返回/关闭”以及“单机未关闭时锁好友联机”逻辑也仍保留。

## 当前接力状态

- 上次做到哪里：已经把“真实对局页里重叠规则被覆盖”这个问题补上，正式页会保留负间距重叠；并重新导出了 `artifacts/layout-check/hand-layout-preview-915x412.png` 作为这轮验图。当前没有改玩法和整体布局框架。
- 下一步准备做什么：优先让用户在真实设备上再看一轮 `2 人 10 张` 和 `3 人 7 张` 的正式效果；如果用户继续抠手牌细节，再微调“最小可见牌宽”和重叠阈值。
- 当前先别动什么：不要重新接入 `assets/cards/daoist/`；不要把手牌排布再改回按模式写死；跨电脑同步入口和邀请弹窗展示时机也不要改，除非本轮任务明确要求。

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
