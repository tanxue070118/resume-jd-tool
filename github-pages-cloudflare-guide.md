# GitHub Pages + Cloudflare 上线步骤

## 你要做的账号动作

1. 在 GitHub 新建一个公开仓库，比如：
   `resume-jd-tool`

2. 把当前目录里的这些内容上传到仓库：
   - `docs/`
   - `README.md`

3. 打开仓库设置：
   - Settings
   - Pages
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`
   - Folder 选择 `/docs`
   - Save

4. 等 GitHub Pages 部署完成后，先会得到一个地址：
   `https://你的GitHub用户名.github.io/resume-jd-tool/`

5. 在 Pages 的 Custom domain 填：
   `tanxue.qzz.io`

6. 到 Cloudflare 里添加 DNS 记录：

   类型：
   `CNAME`

   名称：
   `tanxue`

   目标：
   `你的GitHub用户名.github.io`

   代理状态：
   第一次验证建议先设为 DNS only。GitHub 验证通过后，再改成 Proxied。

7. 回到 GitHub Pages，等待 custom domain 检查通过，勾选 Enforce HTTPS。

## 注意

- `docs/CNAME` 已经写好：`tanxue.qzz.io`
- `docs/robots.txt` 和 `docs/sitemap.xml` 已经使用你的域名
- 如果 Cloudflare 开了代理但 GitHub 验证失败，先临时切回 DNS only
- 不要在 AdSense 通过前放诱导点击广告位

## 上线后提交给搜索引擎

Google Search Console 添加域名后提交：

`https://tanxue.qzz.io/sitemap.xml`
