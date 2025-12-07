import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量或本地文件获取图片URL列表
const recordPath = process.env.RECORD_PATH || path.join(__dirname, "../url.csv");

const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 读取图片URL列表
let imagesArray = ["https://http.cat/503"];
try {
  if (fs.existsSync(recordPath)) {
    const data = fs.readFileSync(recordPath, "utf8");
    const lines = data.split(/\r|\n|\r\n/).filter((item) => item.length > 5);
    if (lines.length > 0) {
      imagesArray = lines;
    } else {
      console.warn(`url.csv file is empty, using default image`);
    }
  } else {
    console.warn(`url.csv file not found at ${recordPath}, using default image`);
  }
} catch (err) {
  console.error("Error reading url.csv file:", err);
}

// 创建并启动服务器
const port = process.env.PORT || 8000;
const server = http.createServer(async (req, res) => {
  try {
    // 验证并处理请求URL
    const fullUrl = "http://localhost" + req.url;
    let url;
    try {
      url = new URL(fullUrl);
    } catch (e) {
      console.error(`Invalid request URL: ${req.url}`, e.message);
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.write("Bad Request: Invalid URL format");
      res.end();
      return;
    }
    
    // 处理根路径，返回index.html
    if (req.url === "/" || req.url === "/index.html") {
      try {
        const indexPath = path.join(__dirname, "../index.html");
        if (fs.existsSync(indexPath)) {
          const htmlContent = fs.readFileSync(indexPath, "utf8");
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache"
          });
          res.write(htmlContent);
          res.end();
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.write("index.html not found");
          res.end();
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.write("Error reading index.html");
        res.end();
      }
      return;
    }
    
    // 处理favicon请求
    if (req.url === "/favicon.ico") {
      res.writeHead(404);
      res.end();
      return;
    }
    
    const { searchParams } = url;
    let stringNumber; // 获取id
    const matched = url.pathname.match(/^\/(\d+)\.(?:jpg|jpeg|png|gif|webp)$/);
    if (matched) {
      stringNumber = matched[1];
    } else {
      stringNumber = searchParams.get("id") ?? "";
    }
    let id = Number(stringNumber);
    if (stringNumber.length === 0 || Number.isNaN(id) || id < 0) {
      id = randomNum(0, imagesArray.length - 1);
    } else {
      if (id >= imagesArray.length) id = randomNum(0, imagesArray.length - 1);
    }
    const remoteURL = imagesArray[id];
    console.log(`send ${id} of ${imagesArray.length} with ${req.url}`);
    
    // 验证URL格式
    let isValidURL = false;
    try {
      new URL(remoteURL);
      isValidURL = true;
    } catch (e) {
      console.error(`Invalid URL: ${remoteURL}`);
      isValidURL = false;
    }
    
    // 调整发送格式json/raw/302
    if (searchParams.has("json")) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      });
      res.write(JSON.stringify({ id, url: isValidURL ? remoteURL : "https://http.cat/503" }));
      res.end();
    } else if (searchParams.has("raw")) {
      // 默认全屏显示图片
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      });
      
      const imageUrl = isValidURL ? remoteURL : "https://http.cat/503";
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>全屏查看图片</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      background-color: #000;
    }
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="全屏图片">
  </div>
</body>
</html>`;
      res.write(html);
      res.end();
    } else {
      const redirectURL = isValidURL ? remoteURL : "https://http.cat/503";
      res.writeHead(302, {
        Location: redirectURL,
        "Cache-Control": "no-cache",
      });
      res.end();
    }
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.write("Server error");
    res.end();
  }
});

// 启动服务器并监听指定端口
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Found ${imagesArray.length} images in url.csv`);
  console.log("API endpoints:");
  console.log("  http://localhost:" + port + "/ (random redirect)");
  console.log("  http://localhost:" + port + "/?json (json response)");
  console.log("  http://localhost:" + port + "/?id=1 (specific image by id)");
  console.log("  http://localhost:" + port + "/1.jpg (pseudo-static url)");
  console.log("  http://localhost:" + port + "/?raw (raw image output)");
  console.log("  http://localhost:" + port + "/index.html (API documentation)");
});