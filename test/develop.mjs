// 本地测试
import http from "http";
import handler from "./node.mjs";
const port = process.env.PORT || 8000;
console.log(`Server is running at http://localhost:${port}`);
const server = http.createServer(handler).listen(port);

// 添加错误处理
server.on('error', (err) => {
    console.error('Server error:', err);
});
