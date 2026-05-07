---
name: notebook-miniprogram
overview: 开发一个极简微信小程序"笔记本"，集成微信一键登录、本地笔记、CloudBase云存储拉取每日股票推荐数据，只展示最新一日的推荐内容。
design:
  styleKeywords:
    - Minimalism
    - White Paper
    - Clean
    - Focus
    - No Distraction
  fontSystem:
    fontFamily: PingFang SC, Helvetica Neue, Arial
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 14px
      weight: 400
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#000000"
    background:
      - "#FFFFFF"
    text:
      - "#000000"
      - "#999999"
    functional:
      - "#07C160"
      - "#FF4D4F"
      - "#52C41A"
todos:
  - id: init-cloudbase
    content: 使用 [MCP:CloudBase AI ToolKit] 完成 CloudBase 环境初始化和登录
    status: completed
  - id: create-project
    content: 使用 [MCP:CloudBase AI ToolKit] downloadTemplate 创建小程序 + CloudBase 项目结构
    status: completed
    dependencies:
      - init-cloudbase
  - id: config-app
    content: 配置 app.json 页面路由、窗口样式和 CloudBase 初始化代码
    status: completed
    dependencies:
      - create-project
  - id: implement-login
    content: 实现登录页面，调用 CloudBase 登录云函数完成微信一键登录
    status: completed
    dependencies:
      - config-app
  - id: implement-note
    content: 实现笔记页面，包含全屏 textarea、本地存储自动保存和恢复逻辑
    status: completed
    dependencies:
      - implement-login
  - id: implement-refresh
    content: 实现刷新按钮，从 CloudBase 云存储下载并解析 stocks.json，展示最新一日股票数据
    status: completed
    dependencies:
      - implement-note
  - id: upload-json
    content: 创建 stocks.json 标准格式模板，使用 [MCP:CloudBase AI ToolKit] 上传到云存储
    status: completed
    dependencies:
      - implement-refresh
  - id: test-deploy
    content: 在微信开发者工具中测试完整流程，配置云存储安全规则，完成部署准备
    status: completed
    dependencies:
      - upload-json
---

## 产品概述

一个极简的微信小程序"笔记本"，用户通过微信一键登录后进入白纸笔记页面，可自由输入文字，内容自动保存到本地。页面右上角有刷新按钮，点击后从 CloudBase 云存储拉取最新一日的股票推荐数据（股票代码 + 胜率）并展示在页面下方。

## 核心功能

- **微信一键登录**：用户首次访问时引导微信授权登录，登录成功后进入笔记页
- **白纸笔记页面**：极简设计，纯白背景全屏输入框，无边框无干扰
- **本地自动保存**：笔记内容通过 `wx.setStorageSync` 实时保存，关闭小程序后重新打开自动恢复
- **刷新按钮**：页面右上角刷新图标，点击从 CloudBase 云存储下载 `stocks.json`
- **股票推荐展示**：解析 JSON 数据，按日期排序取最新一日，展示股票代码和胜率

## 技术栈选择

- **前端框架**：微信小程序原生框架（Miniprogram）
- **后端服务**：腾讯云 CloudBase（云开发）
- **数据存储**：CloudBase 云存储（存放 `stocks.json`）+ 本地 `wx.setStorageSync`（存放笔记）
- **登录方式**：微信一键登录（CloudBase 内置支持）

## 实现方案

### 整体架构

```
微信小程序前端
├── 登录页 (pages/login/login)
│       └── 微信一键登录按钮
└── 笔记页 (pages/note/note)
        ├── textarea 输入框（全屏、无边框）
        ├── 本地存储（input 事件触发自动保存/恢复）
        └── 股票数据展示区（刷新按钮 + 列表）
                │
                └── CloudBase 云存储 /stocks.json
```

### 关键技术决策

1. **原生小程序框架**：需求极简，无需跨端框架，原生开发体积最小、最简单
2. **CloudBase 云存储存放 `stocks.json`**：无需搭建服务器，SDK 直接下载；支持权限控制；手动上传简单
3. **本地存储笔记**：使用 `wx.setStorageSync` / `wx.getStorageSync`，不上传服务器，符合"只能打字、不能提交"的需求
4. **微信一键登录**：使用 CloudBase 内置登录云函数，自动管理用户身份，`openid` 自动关联

### 数据格式设计

**`stocks.json`（云存储，标准 JSON 格式）**：

```
[
  {
    "日期": "2026年5月7日",
    "股票": [
      {"代码": "60000", "胜率": 0.56},
      {"代码": "30001", "胜率": 0.55},
      {"代码": "30002", "胜率": 0.54}
    ]
  }
]
```

> 注：原格式非标准 JSON，已修正为标准数组格式，方便小程序解析。

**本地存储**：

- Key：`note_content`
- Value：用户输入的纯文本字符串

### 数据流

```
笔记输入 → textarea bindinput → wx.setStorageSync('note_content', value) 实时保存
页面 onLoad → wx.getStorageSync('note_content') → 恢复内容到 textarea

刷新点击 → wx.cloud.downloadFile(fileID) → 读取文件内容 → JSON.parse → 按日期排序 → 取最新一条 → setData 更新视图
```

### 目录结构

```
d:\Notebook\
├── miniprogram\
│   ├── pages\
│   │   ├── login\
│   │   │   ├── login.js          # 登录页逻辑
│   │   │   ├── login.wxml        # 登录页模板
│   │   │   └── login.wxss        # 登录页样式
│   │   └── note\
│   │       ├── note.js            # 笔记页逻辑（本地存储 + 刷新拉取）
│   │       ├── note.wxml         # 笔记页模板（textarea + 股票列表）
│   │       └── note.wxss         # 笔记页样式（极简白纸风格）
│   ├── app.js                    # 小程序入口（初始化 cloud）
│   ├── app.json                  # 页面路由 + 窗口配置
│   ├── app.wxss                  # 全局样式
│   └── project.config.json       # 项目配置（AppID 等）
└── cloudfunctions\
    └── login\
        └── index.js              # 微信登录云函数（CloudBase 自带模板）
```

## 设计风格

采用**极简主义（Minimalism）**设计风格，模拟真实白纸书写体验，无任何多余装饰元素。

## 页面详细设计

### 登录页（pages/login/login）

- **背景**：纯白 `#FFFFFF`
- **布局**：垂直居中
- **内容块**：
- 小程序名称"笔记本"（标题字号 24px，字重 600，黑色）
- 微信一键登录按钮（使用微信官方开放能力 `open-type="getUserInfo"` 样式，绿色 `#07C160`）
- **交互**：登录成功后 `wx.redirectTo` 跳转到笔记页，无返回按钮

### 笔记页（pages/note/note）

- **导航栏**：自定义导航栏（`"navigationStyle": "custom"`）
- 左侧："笔记本"标题（16px，#000000）
- 右侧：刷新图标（使用 Unicode 图标或本地 PNG，18px，#000000）
- **笔记输入区**：
- 全屏 `textarea`，无边框，无背景色
- `padding: 20px`，`font-size: 16px`，`line-height: 1.8`
- `min-height: 100vh`，模拟整页白纸
- 无 placeholder（保持极简）
- **股票数据展示区**（刷新后显示，默认隐藏）：
- 分隔线（#EEEEEE，1px）
- 日期标题（14px，#999999，右对齐）
- 股票列表：每行显示"代码 + 胜率进度条"
- 胜率进度条：背景 #EEEEEE，填充色根据胜率高低变化（>0.5 绿色，<0.5 红色）

## 响应式与适配

- 使用 `rpx` 单位适配不同屏幕
-  navigationBar 高度动态计算（`wx.getSystemInfoSync().statusBarHeight`）

## 可用的 Agent Extensions

### MCP: CloudBase AI ToolKit

- **用途**：完成 CloudBase 环境初始化、小程序项目模板下载、云存储文件上传管理
- **预期结果**：
- 使用 `auth` 工具完成 CloudBase 登录和环境绑定
- 使用 `downloadTemplate` 下载 `miniprogram` 模板（微信小程序 + 云开发）
- 使用 `manageStorage` 上传 `stocks.json` 到云存储
- 使用 `envQuery` 查询环境信息，确保配置正确