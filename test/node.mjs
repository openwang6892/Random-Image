import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 需要先安装 axios
// 填入环境变量，或者修改下面的地址，这个地址应该返回一个文本文件，每行一个图片地址
const recordURL = process.env.RECORD_URL || "./url.csv";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const imagesArray = ["https://http.cat/503"];

// 根据URL类型选择读取方式
(async () => {
    let text = "";
    try {
        if (recordURL.startsWith('http://') || recordURL.startsWith('https://')) {
            // 如果是HTTP URL，使用axios获取
            text = await axios.get(recordURL).then((res) => res.data);
        } else {
            // 如果是本地文件路径，使用fs读取
            const filePath = path.resolve(__dirname, recordURL);
            text = fs.readFileSync(filePath, "utf8");
        }
        const imgs = text.split(/\r|\n|\r\n/).filter((item) => item.length > 5);
        if (imgs.length > 0) {
            imagesArray.splice(0, 1, ...imgs);
        }
    } catch (err) {
        console.error("Error reading image list:", err.message);
    }
})();

export default async function (req /*: http.IncomingMessage*/, res /*: http.ServerResponse*/) {
    let url;
    try {
        url = new URL("http://localhost" + req.url);
    } catch (e) {
        console.error(`Invalid request URL: ${req.url}`, e.message);
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.write("Bad Request: Invalid URL format");
        res.end();
        return;
    }
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
        if (!isValidURL) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.write("Invalid image URL");
            res.end();
            return;
        }
        
        try {
            console.log(`send raw ${remoteURL}`);
            const response = await axios({
                method: "get",
                url: remoteURL,
                responseType: "stream",
                headers: {
                    Referer: "https://www.pixiv.net/",
                    "User-Agent": "PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)",
                }, // 这个Header允许调用pixiv上面的图片
            });
            res.writeHead(200, {
                "Content-Type": response.headers["content-type"] || "image/jpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache",
            });
            response.data.pipe(res);
        } catch (error) {
            console.error("Error fetching image:", error.message);
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.write("Error fetching image");
            res.end();
        }
    } else {
        const redirectURL = isValidURL ? remoteURL : "https://http.cat/503";
        res.writeHead(302, {
            Location: redirectURL,
            "Cache-Control": "no-cache",
        });
        res.end();
    }
}
