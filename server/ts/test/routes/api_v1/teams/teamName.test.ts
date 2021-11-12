import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as path from "path";
import * as pify from "pify";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";
import { teamNameRoute } from "../../../../src/routes/api_v1/teams/teamName.route";
import { getTeamData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

import { Team } from "../../../../src/lib/importer/statcrew/football/team";

let teams: Athlyte.ITeam[];

function makeTeamClasses(): Team[] {
  return teams.map((team) => {
    const teamClass = new Team();
    teamClass.parsedData = _.cloneDeep(team);
    teamClass._setAlreadyExists(false);
    return teamClass;
  });
}

test.before("read team data", async (t) => {
  teams = await getTeamData();
});

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
  t.context.teams = makeTeamClasses();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.get("/:teamName", teamNameRoute);
  app.get("/teamcode/:id", teamNameRoute);
  app.locals.db = db;
  return app;
}

test("Get team details by a given team name", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const teamClass: Team = t.context.teams[0];
  teamClass.updateGameRef("GA")
  await teamClass.save(db);
  const getRes = await request(app)
    .get(`/${teamClass.parsedData.tidyName}`);
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.not(getRes.body.data, null);
  t.true((getRes.body.data as Athlyte.ITeam).tidyName.length >= 1);
});

test("Get the team code for a given team id", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const teamClass: Team = t.context.teams[0];
  teamClass.updateGameRef("GA")
  const teamId = await teamClass.save(db);
  const getRes = await request(app)
    .get(`/teamcode/${teamId}`);
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200);
  t.is(getRes.body.data[0].code, 657);
});
