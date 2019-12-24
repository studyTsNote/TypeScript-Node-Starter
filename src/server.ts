import errorHandler from "errorhandler";

import app from "./app";

if (process.env.NODE_ENV === "development") {
    // 仅用于开发环境下
    app.use(errorHandler());
  }

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    console.log(
        "  应用运行模式 %s，访问地址 http://localhost:%d",
        app.get("env"),
        app.get("port")
    );
    console.log("  Ctrl+C 停止应用\n");
});

export default server;
