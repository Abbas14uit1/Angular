import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as mongo from "mongodb";
import * as request from "supertest";

import * as Athlyte from "../../../../../../typings/athlyte/basketball";
import * as Superlative from "../../../../src/enums/superlatives";
import { VH } from "../../../../src/lib/importer/AthlyteImporter";

import { playerRoutes } from "../../../../src/routes/api_v1/player/player.route";
import { getGameData, getPlayersData, getPlaysData, getTeamData } from "../../../helpers/classFixtureLoaderBasketball";
import { getConnection } from "../../../helpers/connectDb";

import { Game } from "../../../../src/lib/importer/statcrew/basketball/game";
import { Player } from "../../../../src/lib/importer/statcrew/basketball/player";

let players: Athlyte.IPlayer[];
const sportCode = "MBB";

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
    .get("/"+sportCode+"/stats/career/player1");  
  t.is(getRes.status, 200); 
  t.is(getRes.body.errors, undefined);
  // const player = getRes.body.data 
   for (const player of getRes.body.data){ 
  	t.true(player.tidyName === "HAYDEL,SYDNEY");
  	t.true(player.name && player.name === "Haydel, Sydney" );
  	t.true(player.teamName && player.teamName === "Hawai`i");
  	t.true(player.shooting != undefined);
    t.true(player.rebound != undefined);
    t.true(player.assist != undefined);
    t.true(player.turnover != undefined);
    t.true(player.steal != undefined);
    t.true(player.block != undefined);      
  }
});

test("Get player stat by season from mongo", async (t) => {
  const app: express.Express = t.context.app;
  const db: mongo.Db = app.locals.db;
  const playerClasses: Player[] = t.context.players;
  for (const player of playerClasses) {
    await player.save(db);
  }
  const getRes = await request(app)
    .get("/"+sportCode+"/stats/season/player1");  
  t.is(getRes.status, 200); 
  t.is(getRes.body.errors, undefined);
  for (const player of getRes.body.data){ 
  	t.true(player.tidyName === "HAYDEL,SYDNEY");
  	t.true(player.name && player.name === "Haydel, Sydney" );
  	t.true(player.teamName === "Hawai`i");
  	t.true(player.shooting != undefined);
  	t.true(player.rebound != undefined);
  	t.true(player.assist != undefined);
  	t.true(player.turnover != undefined);
  	t.true(player.steal != undefined);
  	t.true(player.block != undefined);  	
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
    .get("/"+sportCode+"/stats/game/player1");  
  t.is(getRes.status, 200); 
  t.is(getRes.body.errors, undefined);
  for (const player of getRes.body.data){ 
  	t.true(player.tidyName === "HAYDEL,SYDNEY");  	
  	t.true(player.teamName && player.teamName === "Hawai`i");
  	t.true(player.shooting != undefined);
    t.true(player.rebound != undefined);
    t.true(player.assist != undefined);
    t.true(player.turnover != undefined);
    t.true(player.steal != undefined);
    t.true(player.block != undefined);    
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
    .get("/"+sportCode+"/info/player1");  
  t.is(getRes.status, 200); 
  t.is(getRes.body.errors, undefined);
  for (const player of getRes.body.data){
    	t.true(player.tidyName === "HAYDEL,SYDNEY");  	
    	t.true(player.teamName && player.teamName === "Hawai`i");
    	t.true(player.name && player.name === "Haydel, Sydney" );
    }
});