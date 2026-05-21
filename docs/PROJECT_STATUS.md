# Project Status

更新时间：2026-05-21

项目：钓红点 / redpoint

本地路径：`C:\Users\OgCloud\Desktop\redpoint`

GitHub：`https://github.com/Lucifer7012/redpoint`

最近同步提交：以 GitHub `main` 最新提交为准。

## 当前状态

- 项目是静态前端游戏，核心文件为 `index.html`、`app.js`、`styles.css`、`favicon.png`。
- 当前可通过本地 HTTP 服务测试：`http://127.0.0.1:4173/`。
- 上传 GitHub 的暂存目录为 `_github_upload`。
- 详细功能记录保留在 `FEATURE_LOG.md`，本目录下 `CHANGELOG.md` 只写摘要。

## 当前功能

- 支持 2 / 3 / 4 人钓红点规则、发牌、摸牌、补枪、红牌计分和结算。
- 支持单机打电脑，单机模式不消耗欢乐豆。
- 支持账号登录、唯一游戏 ID、云端玩家资料和排行榜。
- 支持欢乐豆余额展示、每日福利、模拟广告奖励。
- 支持好友搜索、好友申请、好友列表。
- 支持创建联机等待房、邀请好友、被邀请人居中弹窗处理邀请。
- 支持邀请拒绝原因、房主侧邀请反馈、过期房间邀请过滤。
- 支持联机门票、奖池、等待房退款、赢家领奖确认。
- 登录页和大厅页已拆分：未登录只显示登录/注册入口，登录后进入大厅再选择单机、好友房或查看排行。
- 页面不会因为 Firebase 上次登录态自动进入大厅；登录页提供“记住邮箱”勾选项，密码交给浏览器密码管理器，必须点击“登录账号”后才进入大厅。
- 登录后的大厅会隐藏顶部简介；“启用摇骰子定先手”并入玩家人数卡片，“开始游戏 / 查看规则”移动到设置区第 4 个卡片，“退出登录 / 已登录账号”移动到大厅标题右侧，以减少 100% 缩放下的垂直占用。
- 对局结束后可查看结算榜单，再选择再来一局或回到大厅。
- 牌桌布局已按测试反馈首轮调整：3 / 4 人对手席位排到上方，公共牌区居中，最近动作区固定在右侧；小屏和横屏允许滚动避免内容裁切。
- 社交面板已按当前测试需求改为左侧流程区、右侧好友列表区；列表过长时区域内滚动。
- 云端排行榜默认收起，点击“查看排行”后展示榜单、刷新和分页。
- 顶部项目介绍默认收起为紧凑栏，点击“玩法简介”后展开当前版本说明。

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
- 同步更新桌面总工作记录 `C:\Users\OgCloud\Desktop\Codex-Worklog\WORKLOG.md`。
- 不记录 API Key、密码、Token、Cookie 或任何真实密钥。
