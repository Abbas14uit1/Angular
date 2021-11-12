"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const helment = require("helmet");
const morganLogger = require("morgan");
const index_1 = require("./routes/index");
const app = express();
exports.app = app;
app.use(helment());
app.use(morganLogger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", index_1.index);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.json({
        errors: [{
                code: "ExpressError",
                title: res.locals.message,
                message: res.locals.message,
                details: res.locals.err,
            }],
    });
});
//# sourceMappingURL=app.js.map