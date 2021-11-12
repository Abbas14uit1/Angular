import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/football";
import * as Superlative from "../../../../src/enums/superlatives";
import { VH } from "../../../../src/lib/importer/AthlyteImporter";

import { playerRoutes } from "../../../../src/routes/api_v1/player/player.route";
import { getGameData, getPlayersData, getPlaysData, getTeamData } from "../../../helpers/classFixtureLoader";
import { getConnection } from "../../../helpers/connectDb";

import { Game } from "../../../../src/lib/importer/statcrew/football/game";
import { Player } from "../../../../src/lib/importer/statcrew/football/player";

let players: Athlyte.IPlayer[];
const sportCode = "MFB";

function makePlayerClasses(): Player[] {
  const playerClasses = players.map((player) => {
    const playerClass = new Player();
    playerClass.parsedData = _.cloneDeep(player);
    playerClass._setAlreadyExists(false);
    return playerClass;
  });
  return playerClasses;
}

test.before("read player data", async (t) => {
  players = await getPlayersData();
});

test.beforeEach("make app", async (t) => {
  t.context.app = await makeApp();
  t.context.players = makePlayerClasses();
});

test.afterEach.always("drop DB", async (t) => {
  await t.context.app.locals.db.dropDatabase();
});

async function makeApp() {
  const db = await getConnection();
  const app = express();
  app.get("/:sportCode/stats/career/:playerId", playerRoutes);
  app.get("/:sportCode/stats/season/:playerId", playerRoutes);
  app.get("/:sportCode/stats/game/:playerId", playerRoutes);  
  app.get("/:sportCode/info/:playerId", playerRoutes);
  app.locals.db = db;
  return app;
}

test("Get player career stat from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/stats/career/player0");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200); 
  const player = getRes.body.data 
  	t.true(player.tidyName === "ROGERS,DARREUS");
  	t.true(player.name === "Rogers, Darreus" );
  	t.true(player.teamName === "UA");
  	t.true(player.passing != undefined);
  	t.true(player.rushing != undefined);
  	t.true(player.receiving != undefined);
  	t.true(player.returning != undefined);
  	t.true(player.kicking != undefined);
  	t.true(player.punting != undefined);
  	t.true(player.defense != undefined);     
});

test("Get player stat by season from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/stats/season/player0");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200); 
  for (const player of getRes.body.data){ 
  	t.true(player.tidyName === "ROGERS,DARREUS");
  	t.true(player.name === "Rogers, Darreus" );
  	t.true(player.teamName === "UA");
  	t.true(player.passing != undefined);
  	t.true(player.rushing != undefined);
  	t.true(player.receiving != undefined);
  	t.true(player.returning != undefined);
  	t.true(player.kicking != undefined);
  	t.true(player.punting != undefined);
  	t.true(player.defense != undefined);    
    }
});


test("Get player stat by game from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/stats/game/player0");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200); 
  for (const player of getRes.body.data){ 
  	t.true(player.tidyName === "ROGERS,DARREUS");  	
  	t.true(player.teamName === "UA");
  	t.true(player.passing != undefined);
  	t.true(player.rushing != undefined);
  	t.true(player.receiving != undefined);
  	t.true(player.returning != undefined);
  	t.true(player.kicking != undefined);
  	t.true(player.punting != undefined);
  	t.true(player.defense != undefined);    
    }
});

test("Get teamcode by team id from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/info/player0");
  t.is(getRes.body.errors, undefined);
  t.is(getRes.status, 200); 
  for (const player of getRes.body.data){
    	t.true(player.tidyName === "ROGERS,DARREUS");  	
    	t.true(player.teamName === "UA");
    	t.true(player.name === "Rogers, Darreus" );
    }
});