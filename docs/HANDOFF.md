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
- 当前缓存版本：`styles.css?v=20260604-game-four-box`，`app.js?v=20260604-game-four-box`
- 最近主要改动：横屏小视口对局这轮已经从“公共牌区 + 右侧长条信息栏”的结构，改成更接近真实手游牌桌的四区布局：中间大框只放公共牌区，底部整条只放手牌和 3 个操作按钮，左下小框放牌堆和状态提示，右下小框放最近动作；同时把公共牌、动作展示牌和手牌都改回接近正常扑克牌比例，不再是扁胖卡面，并补了一轮底部手牌区高度，确保 `915 x 412` 和 `844 x 390` 这类安卓横屏视口里，底部按钮和整排手牌都能完整留在一屏内。为避免继续命中旧缓存，`index.html` 与预览页的资源版本都已提升到 `20260604-game-four-box`。本轮另外保留了此前已经做完的修正：公共牌区内容自适应牌阵、桌面窄窗口继续走整桌等比缩放、手机横屏大厅的“单机 / 好友联机”切换与固定右侧好友/排行榜框、账号 ID 浮层、邀请大厅门槛与社交补刷等。

## 当前接力状态

- 上次做到哪里：横屏小视口对局已经完成一轮结构性重排，不再是“右侧动作长条 + 中间被压扁公共牌区”的旧布局，而是改成你指定的四块：中间大框公共牌区、底部整条手牌区、左下状态/牌堆小框、右下最近动作小框；底部手牌裁切也已经修掉，`915 x 412` 和 `844 x 390` 预览图里都能完整看到三按钮和整排手牌。
- 下一步准备做什么：如果你继续拿实机图回来，我们下一步就按真实截图继续抠细节，优先看公共牌区纵向留白、底部按钮宽度和左右小框文案密度；如果还嫌牌偏小，再单独放大公共牌与手牌，不再改整体分区。
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
