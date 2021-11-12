import { Router } from "express";
import * as moment from "moment";
import * as mongo from "mongodb";
import * as bcrypt from "bcryptjs";
const queryBuilderRoute: Router = Router();

queryBuilderRoute.get("/:collectionName", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const pipeline: any[] = JSON.parse(req.query.pipeline); 
  console.log(JSON.stringify(pipeline));
  try {
    const players = await db.collection(req.params.collectionName).aggregate(pipeline).limit(25).toArray();
    res.status(200).json({
      data: players,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "AggregationError",
        title: "Error occured during team query retrieval",
        message: err.message,
      }],
    });
  }
});
export { queryBuilderRoute };
