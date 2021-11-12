import * as fs from "graceful-fs";
import * as jsonfile from "jsonfile";
import * as moment from "moment";
import * as path from "path";
import * as pify from "pify";
import * as yargs from "yargs";

import { winstonLogger } from "../../src/lib/winstonLogger";

import { Game } from "../../src/lib/importer/statcrew/football/game";
import { Play } from "../../src/lib/importer/statcrew/football/play";
import { Player } from "../../src/lib/importer/statcrew/football/player";
import { Team } from "../../src/lib/importer/statcrew/football/team";

// interfaces
import { IStatcrewFootballJSON } from "../../../../typings/statcrew/football";
import { VH } from "../../src/lib/importer/AthlyteImporter";

const argv = yargs
  .usage("Usage: $0 [options]")
  .example("$0 --in 01_UA-USC.json --outDir fixtures/parsed --players 3 --plays 3 --teams 1",
  "Get 3 players, 3 plays, and the default 1 team and 1 game")
  .alias("i", "in")
  .alias("o", "outDir")
  .describe("in", "JSON file with Statcrew data")
  .describe("outDir", "Output directory for fixtures")
  .demandOption(["in", "outDir"])
  .default({ players: 3, plays: 3 })
  .help("h")
  .alias("h", "help")
  .argv;

winstonLogger.addConsole({});

const inputPath = path.resolve(argv.in);
pify(fs.readFile)(inputPath, "UTF-8")
  .then((file) => {
    const data = JSON.parse(file) as IStatcrewFootballJSON;
    // players
    const players: Player[] = data.team[0].player.slice(0, argv.players)
      .map((statcrewPlayer, playerIndex) => {
        const player = new Player();
        player.parse(statcrewPlayer,
          8,
          "Alabama",
          "Southeastern Conference",
          "East",
          "UA",
          657,
          "USC",
          "Pac-12 Conference",
          "North",
          VH.home,
          moment(data.venue[0].$.date, "MM/DD/YYYY").toDate(),data.venue[0].$.date);
        player.parsedData._id = `player${playerIndex}`;
        player._setAlreadyExists(false);
        player.parsedData.games.forEach((mapGame) => mapGame.gameId = "game1");
        player.parsedData.teamId = "team1";
        return player;
      });
    // teams
    const teams: Team[] = data.team.slice(0, 1)
      .map((statcrewTeam, teamIndex) => {
        const team = new Team();
        team.parse(statcrewTeam, statcrewTeam, data.venue[0], data.plays[0].qtr,
          moment(data.venue[0].$.date, "MM/DD/YYYY").toDate(), data.venue[0].$.date);
        team.parsedData._id = `team${teamIndex + 1}`;
        team.parsedData.games.players = players.map((player) => player.getId());
        //team.parsedData.games.forEach((mapGame) => mapGame.gameId = "game1");
        return team;
      });
    // plays
    const plays: Play[] = data.plays[0].qtr[0].play.slice(0, argv.plays)
      // only processes 1st quarter
      .map((statcrewPlay, playIndex) => {
        const play = new Play();
        play.parse(statcrewPlay, 1);
        play.parsedData._id = `play${playIndex}`;
        play.parsedData.gameId = "game1";
        play.parsedData.playerIds = players
          .filter((player) => {
            return play.parsedData.results.playersInvolved
              .indexOf(player.parsedData.games[0].codeInGame) !== -1;
          })
          .map((player) => player.getId());
        return play;
      });
    // game
    const game = new Game();
    game.parse(data.venue[0], data.team, data.drives[0].drive, plays.map((play) => play.parsedData));
    game.parsedData._id = "game1";
    game.parsedData.teamIds = {
      home: "team1",
      visitor: "team2",
    };
    game.parsedData.playerIds = players.map((player) => player.getId());
    game.parsedData.playIds = plays.map((play) => play.getId());

    // write fixtures
    const playerWrites = pify(jsonfile.writeFile)(path.join(argv.outDir, "players.json"),
      players.map((player) => player.prepareForBatchSave()), { spaces: 2 });
    const teamWrites = pify(jsonfile).writeFile(path.join(argv.outDir, "teams.json"),
      teams.map((team) => Object.assign({}, team.prepareDynamicData(), team.prepareStaticData())), { spaces: 2 });
    const playWrites = pify(jsonfile).writeFile(path.join(argv.outDir, "plays.json"),
      plays.map((play) => play.prepareForBatchSave()), { spaces: 2 });
    const gameWrite = pify(jsonfile).writeFile(path.join(argv.outDir, "game.json"),
      Object.assign({}, game.prepareDynamicData(), game.prepareStaticData()), { spaces: 2 });
    return Promise.all([playerWrites, teamWrites, playWrites, gameWrite])
      .catch((err) => winstonLogger.log("error", err));
  }).catch((err) => {
    winstonLogger.log("error", err);
  });
