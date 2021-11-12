import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as helment from "helmet";
import * as mongo from "mongodb";
import * as morganLogger from "morgan";
import * as path from "path";
import * as favicon from "serve-favicon";

import { index } from "./routes/index";

const app: express.Express = express();

app.use(helment());
app.use(morganLogger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found") as Error & { status?: number };
  err.status = 404;
  next(err);
});

// error handler
app.use((err: any, req: express.Request, res: express.Response, next: () => void) => {
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

export { app };
