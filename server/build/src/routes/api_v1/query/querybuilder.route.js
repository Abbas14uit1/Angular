"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queryBuilderRoute = express_1.Router();
exports.queryBuilderRoute = queryBuilderRoute;
queryBuilderRoute.get("/:collectionName", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const pipeline = JSON.parse(req.query.pipeline);
    console.log(JSON.stringify(pipeline));
    try {
        const players = yield db.collection(req.params.collectionName).aggregate(pipeline).limit(25).toArray();
        res.status(200).json({
            data: players,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "AggregationError",
                    title: "Error occured during team query retrieval",
                    message: err.message,
                }],
        });
    }
}));
//# sourceMappingURL=querybuilder.route.js.map