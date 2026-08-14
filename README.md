# polaris-Web

Polaris Group 官网。Next.js + TypeScript（App Router），支持日文（`/`）与中文（`/zh`）双语路由。

> 仓库根目录即为本项目代码；本地磁盘上还有一个 `legacy-site/` 目录，存放旧版 WordPress 站点的静态镜像，仅作迁移参考，未被 git 跟踪，不会被提交或推送。

## 内容管理（CMS）

新闻公告（News）内容不再是本地 Markdown 文件，而是由 `cms/` 目录下的 Polaris CMS 管理后台维护，数据存储在 Cloudflare D1，图片存储在 Cloudflare R2。本站点在构建/请求时通过 `src/lib/posts.ts` 调用 CMS 提供的公开 API（`CMS_API_URL` 环境变量，默认 `https://polaris.api.yingmu-tech.com`）读取新闻数据，并做 5 分钟的增量静态再生成（ISR）。

后台管理界面 / API 地址：`https://polaris.api.yingmu-tech.com`（自定义域名，绑定在 `yingmu-tech.com` 这个 Cloudflare 账号下，实际由 Cloudflare Pages 项目 `polaris-cms` 提供服务，原始地址 `https://polaris-cms.pages.dev` 仍可作为备用访问入口）。详见 `cms/` 目录（其自身是一个独立的 Vite + Cloudflare Pages Functions 项目，与本 Next.js 项目分开构建/部署）。

News / おすすめ情報 / 社员介绍（Team）均已接入 CMS；联系表单（/contact）的提交也存储在 D1（`contact_submissions` 表），可在后台按团队成员统计实际提交次数。Events / Subsidiaries / 退租表单等模块仍为静态数据，计划后续按相同模式迁移。

联系表单在浏览器端直接向 CMS 的 `/api/contact` 提交，因此需要 `NEXT_PUBLIC_CMS_API_URL` 环境变量（同样默认 `https://polaris.api.yingmu-tech.com`，未设置时也可正常工作）。

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing pages under `src/app/`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
