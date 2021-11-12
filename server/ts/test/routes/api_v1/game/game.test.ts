import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";

import { gameRoutes } from "../../../../src/routes/api_v1/game/game.route";
import { gameRoute as uploadGame } from "../../../../src/routes/api_v1/upload/game.route";
import { getGameData, getPlayersData, getPlaysData, getTeamData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

// classes
import { Game } from "../../../../src/lib/importer/statcrew/football/game";
import { Play } from "../../../../src/lib/importer/statcrew/football/play";
import { Player } from "../../../../src/lib/importer/statcrew/football/player";
import { Team } from "../../../../src/lib/importer/statcrew/football/team";

let game: Athlyte.IGame;
let plays: Athlyte.IPlay[];
let players: Athlyte.IPlayer[];
let teams: Athlyte.ITeam[];

test.before("read game data", async (t) => {
  game = await getGameData();
  plays = await getPlaysData();
  players = await getPlayersData();
  teams = await getTeamData();
});

test.beforeEach("make app and game class", async (t) => {
  t.context.app = await makeApp();
  t.context.game = new Game();
  t.context.game.parsedData = _.cloneDeep(game);
});

test.afterEach.always("drop DB", async (t) => {
 await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.use("/upload", uploadGame);
  app.get("/:sportCode/:gameId", gameRoutes);
  app.get("/:sportCode/teams/:gameId", gameRoutes);
  app.get("/:sportCode/teamstats/:gameId", gameRoutes);
  app.get("/:sportCode/starterroster/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/fullroster/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/rushing/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/passing/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/receiving/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/receiving/targets/:gameId/:playerId", gameRoutes);
  app.get("/:sportCode/defense/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/interceptions/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/fumbles/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/hitting/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/pitching/:gameId/:teamId", gameRoutes);
  app.get("/:sportCode/teamIds/:gameId", gameRoutes);
  app.get("/:sportCode/plays/:gameId", gameRoutes);
  app.get("/:sportCode/player-name/:playerId", gameRoutes);
  app.get("/:sportCode/plays/scoring/:gameId", gameRoutes);
  app.get("/:sportCode/plays/:gameId", gameRoutes);  
  app.locals.db = db;
  return app;
}

test("Get the saved game from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const getRes = await request(app)
    .get("/MFB/game1");
  t.true(getRes.body.data.length == 1);
  t.true(moment(getRes.body.data[0].gameDate).isSame(moment(gameClass.parsedData.gameDate)));
  t.is(getRes.status, 200);
});

/* Need to be fixed 
test("Get the saved game by team from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const teamClasses = teams.map((team) => {
    const teamClass = new Team();
    teamClass.parsedData = _.cloneDeep(team);
    teamClass._setAlreadyExists(false);
    return teamClass;
  });
  for (const teamClass of teamClasses) {
    await teamClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/teams/game1");
  t.true(getRes.body.data.length == 1);  
  t.true(getRes.body.data.tidyName === "USC");
  t.is(getRes.status, 200);
});
*/

test("Get the saved starters from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/starterroster/game1/8");
  t.true(getRes.body.data.length == 2);    
  t.is(getRes.status, 200);
});


test("Get the saved full roster from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/fullroster/game1/8");
  t.true(getRes.body.data.length == 3);    
  t.is(getRes.status, 200);
});

test("Get the rushing details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/rushing/game1/8");
  t.true(getRes.body.data.length == 1);
  t.true(getRes.body.data[0].attempts == 4);
  t.is(getRes.status, 200);
});

test("Get the passing details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/passing/game1/8");
  t.true(getRes.body.data.length == 1);
  t.true(getRes.body.data[0].attempts == 29);
  t.is(getRes.status, 200);
});

test("Get the receiving details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/receiving/game1/8");
  t.true(getRes.body.data.length == 1);
  t.true(getRes.body.data[0].receptions == 2);
  t.is(getRes.status, 200);
});

//TODO: we need to add more validation
test("Get the receiving target details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/receiving/targets/game1/8");
  //t.true(getRes.body.data.length == 1);
  //t.true(getRes.body.data[0].receptions == 2);
  t.is(getRes.status, 200);
});


//TODO: we need to add more validation
test("Get the defence details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/defense/game1/8");
 // t.true(getRes.body.data.length == 1);
 // t.true(getRes.body.data[0].receptions == 2);
  t.is(getRes.status, 200);
});


//TODO: we need to add more validation
test("Get the interceptions details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/interceptions/game1/8");
  //t.true(getRes.body.data.length == 1);
 // t.true(getRes.body.data[0].receptions == 2);
  t.is(getRes.status, 200);
});



//TODO: we need to add more validation
test("Get the fumbles details from Mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const gameClass: Game = t.context.game;
  const saveId = await gameClass.save(db);
  t.is(saveId, "game1");
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass._setAlreadyExists(false);
    playerClass.parsedData = _.cloneDeep(player);
    return playerClass;
  });
  for (const playerClass of playerClasses) {
    await playerClass.save(db);
  }
  const getRes = await request(app)
    .get("/MFB/fumbles/game1/8");
  //t.true(getRes.body.data.length == 1);
 // t.true(getRes.body.data[0].receptions == 2);
  t.is(getRes.status, 200);
});

