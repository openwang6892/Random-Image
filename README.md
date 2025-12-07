# Random-Image

通过随机发送 `url.csv` 文件中给出的图床链接来实现一个随机图片 API。支持 PHP 和 Node.js 版本。

## 特性

- 支持多种访问方式：302跳转、JSON返回、Raw图片输出
- 使用Yarn一键启动本地开发服务器
- 支持指定ID访问特定图片
- 支持伪静态URL访问（如 `/1.jpg`）
- 响应式设计的API文档页面

## 快速开始

### 使用 Yarn 启动

```bash
# 安装依赖
yarn install

# 启动 Node.js 服务器 (默认端口: 8000)
yarn start
# 或
yarn serve

# 启动 PHP 服务器 (需要PHP环境)
yarn serve:php
```

### 环境变量

- `PORT` - 设置服务器端口（默认: 8000）
- `RECORD_PATH` - 设置自定义的 url.csv 文件路径（默认: ./url.csv）

## API 使用方法

启动服务器后，您可以使用以下 API 端点：

- `http://localhost:8000/api` - 随机跳转到一张图片
- `http://localhost:8000/api?json` - 返回 JSON 格式的图片信息
- `http://localhost:8000/api?id=1` - 获取指定 ID 的图片
- `http://localhost:8000/api?raw` - 在全屏页面中查看图片
- `http://localhost:8000/1.jpg` - 伪静态 URL 访问指定 ID 图片
- `http://localhost:8000/` - 访问API文档页面

## url.csv 文件

项目根目录下的 `url.csv` 文件包含所有可用的图片 URL，每行一个 URL。

## 项目结构

- `api/index.php` - PHP 版本的API实现
- `test/server.mjs` - Node.js 版本的API实现
- `index.html` - API文档页面
- `url.csv` - 图片URL列表

## 部署

### Render 一键部署

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

要手动部署到 Render，请创建一个 Web Service 并使用以下设置：
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Production


### Vercel 部署

支持一键部署到 Vercel：
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/git?s=https%3A%2F%2Fgithub.com%2FYieldRay%2FRandom-Picture)

### 本地虚拟主机

支持 PHP >= 5.3，直接上传项目文件到虚拟主机即可。

## 许可证

本项目采用 GNU General Public License v3.0 (GPLv3) 许可证 - 详见 [LICENSE](./LICENSE) 文件。
