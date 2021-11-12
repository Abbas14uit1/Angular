import * as cors from "cors";
import { Router } from "express";

import { loginRouter } from "./login";
import { signupRouter } from "./signup";
import { usersRoute } from "./users.route";

const corsOptions: cors.CorsOptions = {
  // fixes [#80](https://gitlab.com/Athlyte/football-portal/issues/80)
  origin: true, // reflect
  credentials: true,
};

const userRouter: Router = Router();
userRouter.use(cors(corsOptions));
userRouter.use("/users", usersRoute);
userRouter.use("/login", loginRouter);
userRouter.use("/signup", signupRouter);

export { userRouter };
