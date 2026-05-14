# 给 Riri 的工作交接

Hi Riri 👋

这是我（Jeffery）一直在家里电脑上做的 **Santai Cosmetics 网站改版**项目。我家里那台机器没办法搬来公司，所以把整个项目推到 GitHub 上，麻烦你在公司电脑接着做。

完整的项目背景请看 [`CLAUDE.md`](./CLAUDE.md) —— Claude Code 每次开 session 都会自动读它。

---

## 第一步：在公司电脑上的初始设置

### 1. 安装工具

如果还没装，先装这两个：

```powershell
# 装 Git（如果没有）—— 去 https://git-scm.com 下载
# 装 GitHub CLI：
winget install --id GitHub.cli
```

Claude Code 你应该已经在用了。

### 2. 登入 GitHub

开 **新的** PowerShell window（刚装完 gh 需要重开 shell 让 PATH 生效）：

```powershell
gh auth login
```

依次回答：
- **What account?** → `GitHub.com`
- **Preferred protocol?** → `HTTPS`
- **Authenticate Git with your GitHub credentials?** → `Yes`
- **How to authenticate?** → `Login with a web browser`

确认登入的是 **`santaicosmetic`** 这个 account。如果你浏览器里登入的是别的账号，先用无痕窗口或先登出再来。

### 3. 把项目克隆到公司电脑

挑一个你喜欢的位置（比如 `C:\Projects\` 或桌面）：

```powershell
gh repo clone santaicosmetic/santai-redesign
cd santai-redesign
```

约 49 MB，一分钟内搞定。

> ❓ **为什么一定要下载文件？** Claude Code 是直接编辑硬盘上的文件来工作的（Read / Edit / Write 都是本地操作），浏览器预览 HTML 也需要本地文件。这个文件夹是必要的工作区。每次开工前 `git pull`、下班前 `git push`，两台机器就能同步。

### 4. 设定本地 git 身份

在 `santai-redesign` 文件夹下：

```powershell
git config user.name "Riri"
git config user.email "284523824+santaicosmetic@users.noreply.github.com"
```

这样你 commit 的内容会归属到 `santaicosmetic` 这个 GitHub account。**只影响这个 repo**，不会动到你机器上其他 repo 的设置。

---

## 第二步：开 Claude Code，把下面这段贴进去

在 `santai-redesign` 文件夹下打开 Claude Code，把下面**整段** prompt 复制贴进去：

```
我现在接手 Santai Cosmetics 的网站改版项目，请帮我做以下几件事：

1. 先读 CLAUDE.md 和 HANDOFF.md，了解项目背景、视觉系统（Direction C）、设计铁律和当前状态。

2. 读 html-build/README.md，了解 HTML 原型的完整说明和已知缺口。

3. 用 `git log --oneline` 看一下最近的提交，告诉我最后一次改动是什么。

4. 在 html-build/ 文件夹下启动一个本地 server 让我可以在浏览器预览所有 HTML 页面：
   `python -m http.server 8000`（或 `npx serve html-build` 如果没有 Python）
   告诉我应该打开哪个 URL，列出全部页面，并说明每个页面是干什么的（首页、PDP、cart 等）。

5. 根据你看到的实际状态：
   - 哪些页面看起来已经完成？
   - 哪些还有缺口、粗糙或不一致的地方？
   - 接下来最值得做的是什么？给我 3–5 个排序的选项（按优先级 + 影响），等我选完再动手。

沟通用中文，代码和注释保持英文（和现有 codebase 一致）。
```

Claude 会读完所有上下文、起本地 server、然后给你一份"现状 + 下一步建议"。你选定方向再开始动手。

---

## 项目当前进度速览

- ✅ **8 个 HTML 页面**已成型：首页、PDP、how-to-apply、cart、collection、faq、search、404
- ✅ **互动**：购物车抽屉、Lash Finder 4 步测验、移动端导航、PDP 变体选择器都通了
- ⏳ **还差**：真实摄影、首页 hero 真实图、Lash Finder 推荐逻辑（现在永远推 Inbox）、真实评论数据、FAQ 内容、Contact 页面

---

## ⚠️ 必须知道的一件事：视觉系统已经偏离品牌简报

`santai-cosmetics-design-system/` 是**参考资料**，里头的原始品牌简报规定用**奶油色背景 + rosewood 玫瑰木强调色**，并且**禁用纯白**。

但实际的 HTML 实作（`html-build/`）**故意改成了 Direction C** —— 纯白背景 + 暖裸色调（`#B8957B`），字体也从 Tenor Sans + Cormorant 换成了 Newsreader + Manrope。

**这是有意的设计决策**，不是失误。所有新东西都遵循 Direction C，**不要去抓 design-system 文件夹里的颜色和字体**。完整对照表在 `CLAUDE.md` 里。

---

## 日常 Git 工作流

```powershell
git pull            # 上工前先拉最新
# ...开始改东西...
git add .
git commit -m "描述你做了什么（英文中文都可以）"
git push            # 下班前推上去
```

如果遇到 merge conflict 或者有疑问，问 Claude Code 或找我。

---

## 有问题找我

我手机微信 / Telegram 都在。`CLAUDE.md` 里有完整的项目背景 —— 大部分问题应该都能在那里找到答案，或者直接问 Claude Code。

加油！🙂

—— Jeffery
