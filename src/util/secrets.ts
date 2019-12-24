import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("加载 .env 文件配置环境变量");
    dotenv.config({ path: ".env" });
} else {
    logger.debug("加载 .env.example 文件配置环境变量");
    dotenv.config({ path: ".env.example" });
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production";

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

if (!SESSION_SECRET) {
    logger.error("未发现客户端密钥，请设置 SESSION_SECRET 环境变量");
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        logger.error("未发现 mongo 链接地址，请设置 MONGODB_URI 环境变量");
    } else {
        logger.error("未发现 mongo 链接地址，请设置 MONGODB_URI_LOCAL 环境变量");
    }
    process.exit(1);
}
