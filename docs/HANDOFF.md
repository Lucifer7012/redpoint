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
- 当前缓存版本：`styles.css?v=20260602-lobby-lane-fix`，`app.js?v=20260602-lobby-lane-fix`
- 最近主要改动：手机横屏大厅顶部账号区已调整为左上角“头像圆徽 + 游戏大厅 + 状态白字”，右上角改为 `ID: 当前游戏ID` + “退出登录”的账号操作区；844 x 390 下中间模式卡和底部操作条已改为在左侧流程列与右侧好友/排行榜栏之间定位，避免好友房状态下向右重叠到好友列表；手机横屏大厅已改为“单机 / 好友联机”切换；中间模式卡已固定为好友联机高度，切换时不再跳动；好友联机模式卡右侧新增竖向操作区，用来承载“关闭房间 / 离开房间 / 开始联机 / 返回对局”等按钮，避免按钮挤出房间卡边界；随后又对这张模式卡做了一轮整体越界排查，收紧标签、左侧房间卡、创建房间按钮、右侧骰子框和右侧操作按钮，并补上文本省略与内部 `overflow` 约束；规则弹窗也已改为更紧凑的深色半透明面板，统一靠近大厅和房间邀请的画风；当前进行中的联机对局现已和邀请弹窗一样收口到大厅流程，刚登录或刚刷新时不再自动跳进对局，而是先进入大厅再手动点“返回对局”；社交同步补上了兜底刷新，进入大厅、回到前台或窗口重新聚焦时都会主动补刷一次邀请与房间状态，并加了轻量周期补刷，减少邀请慢半拍；关闭房间、离开房间和关闭后当前用户退票已改为基于大厅当前房间快照直接批量写回，绕开部分 Firestore 规则下 `doc.get()` 被拒的问题；右侧好友列表 / 排行榜共用固定外框并滚动；房间邀请弹窗改为进入游戏大厅后才显示。

## 当前接力状态

- 上次做到哪里：已按截图调整手机横屏大厅顶部账号区，左上角承载“游戏大厅”和状态白字，右上角显示 `ID: 当前游戏ID` 与“退出登录”；随后修正 844 x 390 下中间模式卡和底部操作条向右重叠到好友列表的问题；此前已补上“邀请同步慢半拍”的兜底刷新，进入大厅、页面回到前台或窗口重新聚焦时都会主动刷新社交数据，并增加轻量周期补刷；同时之前已修正“登录成功但还没进入大厅就弹出房间邀请”、好友联机模式卡按钮越界、关闭房间依赖 `rooms/{roomId}` 单读、规则弹窗画风不统一，以及“当前对局只在大厅后再手动进入”的门槛。
- 下一步准备做什么：优先用两账号继续实测邀请到达时机，确认大厅内基本能做到接近实时；如果仍有明显延迟，再继续往 Firestore 索引 / 监听范围 / 房间过滤链路上深挖。
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
