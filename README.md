# Qiyu Yang — 个人主页

Astro 静态网站，推送到 `main` 后由 GitHub Actions 自动构建并发布到 GitHub Pages。

## 本地预览

```bash
npm install
npm run dev      # 打开 http://localhost:4321
```

## 改哪里

| 想改的内容 | 文件 |
|---|---|
| 名字、身份、首页那句话、背景图、底部小字、导航顺序、外链 | `src/site.config.ts` |
| 作品 / 文章 / 摄影的每一条 | `src/content/entries/<分类>/*.md` |
| About、CV | `src/content/pages/about.md`、`cv.md` |
| 颜色、磨砂程度、背景明暗、字体 | `src/styles/tokens.css` |

## 加一条内容

在对应分类文件夹里新建一个 `.md` 文件，文件名就是网址，例如 `src/content/entries/work/my-project.md` 会出现在 `/work/my-project/`。

```markdown
---
title: My project
kind: Project              # 可选，卡片上的小标签
year: "2026"               # 可选
order: 1                   # 可选，越小越靠前
summary: 一两句简介，出现在卡片和页面开头。
cover: /images/work/my-project.jpg      # 可选，封面图
background: /images/backgrounds/x.jpg   # 可选，这一页单独换背景
links:                     # 可选，外部链接
  - label: GitHub
    href: https://github.com/...
draft: false               # true 表示暂不发布
placeholder: false         # true 会显示"待重写"提示
---

正文用 Markdown 写。插图：

![说明文字](/images/work/figure-1.jpg)
```

删除一条内容：直接删掉那个文件即可，不影响其他任何文件。

## 图片

所有图片放在 `public/images/` 下，路径里去掉 `public`，例如 `public/images/work/a.jpg` 写成 `/images/work/a.jpg`。

- 宽 1600 到 2400 像素，单张 500KB 以内（背景图可以到 1MB）。
- 文件名用小写英文和连字符，不要空格和中文。
- iPhone 的 HEIC 先转成 JPG。

## 换背景

把图片放进 `public/images/`，在 `src/site.config.ts` 里改 `background`。任何图片都会被自动压到中性的明暗，如果觉得太灰或太亮，调 `src/styles/tokens.css` 里的 `--bg-filter` 和 `--veil`；磨砂强度是 `--blur`，卡片透明度是 `--glass`。

## 加一个新分类

1. 在 `src/site.config.ts` 的 `categories` 里加一项，`layout` 可选 `cards`（卡片）、`list`（列表）、`photos`（图片墙）。
2. 新建同名文件夹 `src/content/entries/<id>/`，放进内容文件。

## 加一个新页面

1. 新建 `src/content/pages/<id>.md`。
2. 在 `src/site.config.ts` 的 `pages` 里加 `{ id: '<id>', title: '...' }`。

## 交互可视化

在任何 Markdown 正文里写标签即可，例如：

```html
<viz-compromise data-scale="1,2,3,4,5" data-sources="Model:2,Retrieval:4,Rules:3" data-alpha="0.5"></viz-compromise>
```

新的可视化：在 `src/viz/` 里写一个导出 `mount(el)` 的文件，再在 `src/viz/index.ts` 里登记标签名。

## 动效

页面里带 `style="--i:数字"` 的元素会按数字顺序像鳞片一样展开。系统开启"减少动效"时自动关闭。
