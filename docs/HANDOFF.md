# Handoff

本文件用于在不同电脑、不同 Codex 会话之间交接 `redpoint` 项目进度。这里不记录 API Key、密码、Token、Cookie 或任何真实密钥。

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
- 当前缓存版本：`styles.css?v=20260607-daoist-card-faces`，`app.js?v=20260607-daoist-card-faces`
- 最近主要改动：对局牌面已从旧文字/CSS 扑克牌切换为道风图片牌面。52 张 256 x 384 WebP 位于 `assets/cards/daoist/`，显示比例固定为 2:3；`.card-btn` 已改为小边角图片框，手机横屏公共牌、最近动作牌和手牌均缩小一档。同步脚本已补上 `assets` 和 `artifacts/layout-check`，后续新资源和截图会随 GitHub 同步。

## 当前接力状态

- 上次做到哪里：横屏小视口对局已经完成结构性重排、真实对局页 JS 固定右侧最近动作、底部整行高度压缩、公共牌大外框收窄、4 人骰子阶段专用布局，以及道风图片扑克牌接入。已用真实 `index.html` 生成 4 人 `915 x 412`、4 人 `844 x 390`、2 人 `915 x 412` 新牌面截图：`artifacts/layout-check/real-index-daoist-cards-4p-915x412.png`、`artifacts/layout-check/real-index-daoist-cards-4p-844x390.png`、`artifacts/layout-check/real-index-daoist-cards-2p-915x412.png`；`daoist-card-faces-check.json` 记录坏图数为 0。
- 下一步准备做什么：如果你继续拿实机图回来，我们下一步就按真实截图继续抠细节，优先看新牌面在公共牌区、底部手牌区和右侧最近动作里的大小是否还需要单独放大/缩小；不要再改整体分区，除非截图显示布局本身又错位。
- 当前先别动什么：跨电脑同步脚本、自动开始同步入口和邀请弹窗展示时机，除非本轮任务明确要求调整。

## 当前可继续方向

- 继续根据手机横屏截图微调大厅布局、好友申请/房间邀请区域和右侧好友/排行榜区域。
- 继续测试登录 -> 创建 ID -> 大厅 -> 单机/好友联机 -> 对局 -> 结算循环。
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
