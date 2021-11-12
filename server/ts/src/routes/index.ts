import { NextFunction, Request, Response, Router } from "express";

import { apiRouter } from "./api_v1/apiIndex.route";
import { userRouter } from "./users";

const index: Router = Router();

export const indexHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send("Athlyte Football API");
};

/* GET home page. */
index.get("/", indexHandler);

index.use("/api_v1", apiRouter);
index.use("/users", userRouter);

export { index };
