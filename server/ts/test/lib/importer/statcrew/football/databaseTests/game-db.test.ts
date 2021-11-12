import { test } from 'ava';
import * as _ from 'lodash';

import { Game } from '../../../../../../src/lib/importer/statcrew/football/game';
import { getConnection } from '../../../../../helpers/connectDb';

// classes
test.beforeEach("connect DB", async (t) => {
  t.context.db = await getConnection();
});

test.afterEach("drop DB", async (t) => {
  await t.context.db.dropDatabase();
});

/**
 * reuse is based on heuristics for whether a game is likely a duplicate
 * of an existing one; based on the team names, abbreviations, and game date
 */
test("reuses existing game ID if one is found in DB", async (t) => {
  const game = new Game();
  game.parsedData._id = "foo";
  game.parsedData.teamIds.home = "home";
  game.parsedData.teamIds.visitor = "visitor";
  game.parsedData.sportCode = "MFB";
  game.parsedData.team = {
    home: {
      id: "HOME",
      code: 4,
      conf: "SEC",
      confDivision: "East",
      name: "The home team",
      score: 6,
    },
    visitor: {
      id: "VISITOR",
      code: 2,
      conf: "SEC",
      confDivision: "East",
      name: "The visiting team",
      score: 6,
    },
  };
  game.parsedData.gameDate = new Date(1, 1, 2000);
  game.parsedData.playerIds = ["player"];
  game.parsedData.playIds = ["play"];
  await game.save(t.context.db);
  const secondGame = new Game();
  secondGame.parsedData = _.cloneDeep(game.parsedData);
  secondGame.parsedData._id = "";
  const id = await secondGame.generateId(t.context.db);
  t.is(id, game.parsedData._id);
  t.is(secondGame.getAlreadyExists(), true);
});
