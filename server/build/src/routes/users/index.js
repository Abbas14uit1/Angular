"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const express_1 = require("express");
const login_1 = require("./login");
const signup_1 = require("./signup");
const users_route_1 = require("./users.route");
const corsOptions = {
    // fixes [#80](https://gitlab.com/Athlyte/football-portal/issues/80)
    origin: true,
    credentials: true,
};
const userRouter = express_1.Router();
exports.userRouter = userRouter;
userRouter.use(cors(corsOptions));
userRouter.use("/users", users_route_1.usersRoute);
userRouter.use("/login", login_1.loginRouter);
userRouter.use("/signup", signup_1.signupRouter);
//# sourceMappingURL=index.js.map