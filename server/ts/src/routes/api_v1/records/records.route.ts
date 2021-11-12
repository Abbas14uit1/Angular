import { Router } from "express";
import * as mongo from "mongodb";

const recordRoutes: Router = Router();

recordRoutes.get("/:sportCode/:teamId/", async (req, res, next) => {
  try {
    const db: mongo.Db = req.app.locals.db;
    const teamId: string = String(req.params.teamId);
    const recordTitle: string = req.query.recordTitle;
    let pipeline: any[] = [];
    pipeline = [
      {
        $match: {
          $and: [
            { teamCode: teamId },
            { sportCode: req.params.sportCode },
            { recordTitle: recordTitle },
          ],
        },
      },
      {
        $project: {
          recordTitle: "$recordTitle",
          results: "$historyRecords",
          headers: "$headers",
          footers: "$footers",
          teamName: "$teamName",
          sortField: {
            $setDifference: [
              {
                $map: {
                  input: "$headers",
                  as: "hdrs",
                  in: { $cond: [{ $ne: ["$$hdrs", ""] }, "$$hdrs", false] },
                },
              },
              [false],
            ],
          },
        },
      },
      {
        $match: {
          results: { $ne: [] },
        },
      },
      { $sort: { sortField: 1 } },
    ];
    const records = await db
      .collection("recordBook")
      .aggregate(pipeline)
      .toArray();
    res.status(200).json({
      data: records,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [
        {
          code: "AggregationError",
          title: "Error occured during record query retrieval",
          message: err.message,
        },
      ],
    });
  }
});

recordRoutes.get("/recordTitles/:sportCode/:teamId", async (req, res, next) => {
  try {
    const db: mongo.Db = req.app.locals.db;
    const teamId: string = String(req.params.teamId);
    const records = await db
      .collection("recordBook")
      .distinct("recordTitle", {
        $and: [
          { teamCode: teamId },
          { sportCode: req.params.sportCode },
          { status: "Active" },
        ],
      });
    res.status(200).json({
      data: records,
    });
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [
        {
          code: "AggregationError",
          title: "Error occured during record title query retrieval",
          message: err.message,
        },
      ],
    });
  }
});

export { recordRoutes };
