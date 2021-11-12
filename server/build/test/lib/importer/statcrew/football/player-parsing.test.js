"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const moment = require("moment");
const player_1 = require("../../../../../src/lib/importer/statcrew/football/player");
const PlayerParser = require("../../../../../src/lib/importer/statcrew/helpers/playerParser");
const AthlyteImporter_1 = require("../../../../../src/lib/importer/AthlyteImporter");
const gameDate = new Date(); // current date to satisfy parser
ava_1.test("parse single player from file, skipping stats", (t) => {
    const statcrewPlayer = {
        $: {
            name: "Rogers, Darreus",
            shortname: "Rogers, Darreus",
            checkname: "ROGERS,DARREUS",
            uni: "0A",
            class: "SR",
            gp: 1,
            gs: 1,
            opos: "WR",
            code: "0A",
        },
        rcv: [
            {
                $: {
                    no: 2,
                    yds: 45,
                    td: 0,
                    long: 36,
                },
            },
        ],
    };
    const player = new player_1.Player();
    player.parse(statcrewPlayer, 8, "Alabama", "Southeastern Conference", "East", "UA", 657, "USC", "Pac-12 Conference", "North", AthlyteImporter_1.VH.home, moment("9/3/2016", "MM-DD-YYYY").toDate(), "9/3/2016");
    t.not(player, undefined);
    t.is(player.parsedData.games[0].side, AthlyteImporter_1.VH.home);
    t.is(player.parsedData.teamName, "Alabama");
    t.is(player.parsedData.name, "Rogers, Darreus");
    t.is(player.parsedData.tidyName, "ROGERS,DARREUS");
    t.is(player.parsedData.games[0].started, true);
    t.is(player.parsedData.games[0].playerClass, "SR");
    t.is(player.parsedData.games[0].uniform, "0A");
    t.is(player.parsedData.games[0].codeInGame, "H0A");
    t.is(player.parsedData.games[0].pos.opos, "WR");
    t.true(moment(player.parsedData.games[0].gameDate).isSame(moment("9/3/2016", "MM-DD-YYYY")));
    t.is(player.parsedData.games[0].season, 2016);
    t.is(player.parsedData.games[0].actualDate, "9/3/2016");
});
ava_1.test("parse RCV stats", (t) => {
    const stats = {
        $: {
            no: 2,
            yds: 45,
            td: 0,
            long: 36,
        },
    };
    const parsed = PlayerParser.parseReceiving(stats);
    t.is(parsed.rcvLong, 36);
    t.is(parsed.rcvYards, 45);
    t.is(parsed.rcvTd, 0);
    t.is(parsed.rcvNum, 2);
});
ava_1.test("parse RUSH stats", (t) => {
    const stats = {
        $: {
            att: 4,
            yds: -3,
            gain: 17,
            loss: 20,
            td: 0,
            long: 17,
        },
    };
    const parsed = PlayerParser.parseRush(stats);
    t.is(parsed.rushAtt, 4);
    t.is(parsed.rushGain, 17);
    t.is(parsed.rushLong, 17);
    t.is(parsed.rushTd, 0);
    t.is(parsed.rushYards, -3);
    t.is(parsed.rushLoss, 20);
});
ava_1.test("parse PASS stats", (t) => {
    const stats = {
        $: {
            comp: 14,
            att: 29,
            int: 1,
            yds: 101,
            td: 0,
            long: 36,
            sacks: 3,
            sackyds: 20,
        },
    };
    const parsed = PlayerParser.parsePass(stats);
    t.is(parsed.passAtt, 29);
    t.is(parsed.passComp, 14);
    t.is(parsed.passInt, 1);
    t.is(parsed.passLong, 36);
    t.is(parsed.passSacks, 3);
    t.is(parsed.passSackYards, 20);
    t.is(parsed.passTd, 0);
    t.is(parsed.passYards, 101);
});
ava_1.test("parse DEFENSE stats", (t) => {
    const stats = {
        $: {
            tackua: 0,
            tacka: 1,
            tot_tack: 2,
            tflua: 3,
            tfla: 4,
            tflyds: 5,
            sackua: 6,
            sacka: 7,
            sacks: 8,
            sackyds: 9,
            brup: 10,
            ff: 11,
            fr: 12,
            fryds: 13,
            int: 14,
            intyds: 15,
            qbh: 16,
            blkd: 17,
        },
    };
    const parsed = PlayerParser.parseDefense(stats);
    t.is(parsed.dTackUa, 0);
    t.is(parsed.dTackA, 1);
    t.is(parsed.dTackTot, 2);
    t.is(parsed.dTflua, 3);
    t.is(parsed.dTfla, 4);
    t.is(parsed.dTflyds, 5);
    t.is(parsed.dSackUa, 6);
    t.is(parsed.dSackA, 7);
    t.is(parsed.dSacks, 8);
    t.is(parsed.dSackYards, 9);
    t.is(parsed.dBrup, 10);
    t.is(parsed.dFf, 11);
    t.is(parsed.dFr, 12);
    t.is(parsed.dFryds, 13);
    t.is(parsed.dInt, 14);
    t.is(parsed.dIntYards, 15);
    t.is(parsed.dQbh, 16);
    t.is(parsed.dblkd, 17);
});
ava_1.test("parse DEFENSE stats tack total", (t) => {
    const stats = {
        $: {
            tackua: 2,
            tacka: 1,
        },
    };
    const parsed = PlayerParser.parseDefense(stats);
    t.is(parsed.dTackUa, 2);
    t.is(parsed.dTackA, 1);
    t.is(parsed.dTackTot, 3);
});
ava_1.test("parse DEFENSE stats tack total should not be overwritten", (t) => {
    const stats = {
        $: {
            tackua: 2,
            tacka: 1,
            tot_tack: 5,
        },
    };
    const parsed = PlayerParser.parseDefense(stats);
    t.is(parsed.dTackUa, 2);
    t.is(parsed.dTackA, 1);
    t.is(parsed.dTackTot, 5);
});
ava_1.test("parse DEFENSE stats sack total", (t) => {
    const stats = {
        $: {
            tackua: 2,
            tacka: 1,
            tot_tack: 5,
            sackua: 1,
            sacka: 2,
        },
    };
    const parsed = PlayerParser.parseDefense(stats);
    t.is(parsed.dSackUa, 1);
    t.is(parsed.dSackA, 2);
    t.is(parsed.dSacks, 3);
});
ava_1.test("parse DEFENSE stats sack total should not be overwritten", (t) => {
    const stats = {
        $: {
            tackua: 2,
            tacka: 1,
            tot_tack: 5,
            sackua: 1,
            sacka: 2,
            sacks: 4,
        },
    };
    const parsed = PlayerParser.parseDefense(stats);
    t.is(parsed.dSackUa, 1);
    t.is(parsed.dSackA, 2);
    t.is(parsed.dSacks, 4);
});
ava_1.test("parse KR stats", (t) => {
    const stats = {
        $: {
            no: 1,
            yds: 5,
            td: 0,
            long: 0,
        },
    };
    const parsed = PlayerParser.parseKickReceiving(stats);
    t.is(parsed.krNo, 1);
    t.is(parsed.krYards, 5);
    t.is(parsed.krTd, 0);
    t.is(parsed.krLong, 0);
});
ava_1.test("parse FUMBLE stats", (t) => {
    const stats = {
        $: {
            no: 1,
            lost: 0,
        },
    };
    const parsed = PlayerParser.parseFumbles(stats);
    t.is(parsed.fumbTotal, 1);
    t.is(parsed.fumbLost, 0);
});
ava_1.test("parse IR (interception return) stats", (t) => {
    const stats = {
        $: {
            no: 1,
            yds: 0,
            td: 0,
            long: 0,
        },
    };
    const parsed = PlayerParser.parseInterceptionReturn(stats);
    t.is(parsed.irLong, 0);
    t.is(parsed.irTd, 0);
    t.is(parsed.irYards, 0);
    t.is(parsed.irNo, 1);
});
ava_1.test("parse SCORING stats", (t) => {
    const stats = {
        $: {
            fg: 2,
        },
    };
    const parsed = PlayerParser.parseScoring(stats);
    t.is(parsed.fg, 2);
    t.is(parsed.patKick, 0);
    t.is(parsed.td, 0);
});
ava_1.test("parse KICKOFF stats", (t) => {
    const stats = {
        $: {
            no: 3,
            yds: 192,
            ob: 1,
            tb: 1,
        },
    };
    const parsed = PlayerParser.parseKickoff(stats);
    t.is(parsed.koNum, 3);
    t.is(parsed.koYards, 192);
    t.is(parsed.koOb, 1);
    t.is(parsed.koTb, 1);
});
ava_1.test("parse FG stats", (t) => {
    const stats = {
        $: {
            made: 2,
            att: 2,
            long: 47,
            blkd: 0,
        },
    };
    const parsed = PlayerParser.parseFieldgoal(stats);
    t.is(parsed.fgMade, 2);
    t.is(parsed.fgAtt, 2);
    t.is(parsed.fgLong, 47);
    t.is(parsed.fgBlocked, 0);
});
ava_1.test("parse PAT stats", (t) => {
    const stats = {
        $: {
            kickatt: 7,
            kickmade: 7,
        },
    };
    const parsed = PlayerParser.parsePointAfter(stats);
    t.is(parsed.kickatt, 7);
    t.is(parsed.kickmade, 7);
});
ava_1.test("parse PUNT stats", (t) => {
    const stats = {
        $: {
            no: 5,
            yds: 235,
            long: 54,
            blkd: 0,
            tb: 0,
            fc: 3,
            plus50: 3,
            inside20: 3,
        },
    };
    const parsed = PlayerParser.parsePunt(stats);
    t.is(parsed.puntNum, 5);
    t.is(parsed.puntYards, 235);
    t.is(parsed.puntLong, 54);
    t.is(parsed.puntBlocked, 0);
    t.is(parsed.puntTb, 0);
    t.is(parsed.puntFc, 3);
    t.is(parsed.puntPlus50, 3);
    t.is(parsed.puntInside20, 3);
});
ava_1.test("parse PR (punt return) stats", (t) => {
    const stats = {
        $: {
            no: 2,
            yds: 4,
            td: 0,
            long: 6,
        },
    };
    const parsed = PlayerParser.parsePuntReturn(stats);
    t.is(parsed.prNo, 2);
    t.is(parsed.prYards, 4);
    t.is(parsed.prTd, 0);
    t.is(parsed.prLong, 6);
});
// test("parse all players in a file", async (t) => {
//   const data = await readJson();
//   data.team.forEach((team) => {
//     team.player.forEach((player) => {
//       const parsed = PlayerParser.parsePlayer(
//         player,
//         team.$.name,
//         team.$.id,
//         team.$.vh === "V" ? VH.visitor : VH.home,
//         moment("1/1/2015", "MM/DD/YYYY").toDate());
//       t.is(parsed.games[0].gameId, undefined);
//     });
//   });
// });
//# sourceMappingURL=player-parsing.test.js.map