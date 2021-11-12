import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as request from "supertest";
import { queryBaseballTeamRoute } from "../../../../../src/routes/api_v1/query//baseball/queryTeam.route";
import { getConnection } from "../../../../helpers/connectDb";
import { getTeamGamesData } from "../../../../helpers/classFixtureLoader";
import { QueryBuilder } from "../../../../../src/lib/importer/statcrew/queryBuilder";

let teamGames: any;

test.before("read game data", async (t) => {
  teamGames = await getTeamGamesData();
});

test.beforeEach("make app and game class", async (t) => {
  t.context.app = await makeApp();
});

test.afterEach.always("drop DB", async (t) => {
 await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.get("/game/:stat_category/:stat/:val/:ineq/:team/:opponent/:sportCode/:location/:teamConference/:teamDivision/:oppConference/:oppDivision/:gameType/:nightGame/:resultcolumn/:teamId", queryBaseballTeamRoute);
  app.locals.db = db;
  return app;
}

test("Get teamGames for the each game by category", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;   
  const teamGamesClass = teamGames.map((teamGame: any) => {
  const teamGameClass = new QueryBuilder();
    teamGameClass.parsedData = _.cloneDeep(teamGame);
    return teamGameClass;
  });
  for (const teamGameClass of teamGamesClass) {
    await teamGameClass.saveTeamGame(db);
  }
  const getRes = await request(app)
    .get("/game/hitting/hitting/0/gt/8/0/MBA/All/NA/NA/NA/NA/All/All/Total/8?statistics=ab&projections=");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.true(getRes.body.data.length == 5); 
});
