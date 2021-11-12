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
const ava_1 = require("ava");
const AthlyteImporter_1 = require("../../../../../src/lib/importer/AthlyteImporter");
const play_1 = require("../../../../../src/lib/importer/statcrew/football/play");
const _data_helper_1 = require("../_data.helper");
let simpleParsed;
let data;
ava_1.test.before("create single play excerpt", (t) => {
    const play = new play_1.Play();
    const inputData = {
        $: {
            context: "V,1,10,V25",
            playid: "1,1,3",
            type: "P",
            tokens: "PASS:0D,C,2B,V31 TACK:29",
            text: "Browne, Max pass complete to Davis, Justin for 6 yards to the USC31 (M. Fitzpatrick).",
        },
    };
    play.parse(inputData, 1);
    simpleParsed = play.parsedData;
});
ava_1.test.before("read data from file", (t) => __awaiter(this, void 0, void 0, function* () {
    data = yield _data_helper_1.readJson();
}));
ava_1.test("parsing entire file throws no errors", (t) => __awaiter(this, void 0, void 0, function* () {
    t.notThrows(() => play_1.parsePlays(data.plays[0]));
}));
ava_1.test("parsing entire file produces list of plays", (t) => __awaiter(this, void 0, void 0, function* () {
    t.true(play_1.parsePlays(data.plays[0]).length > 0);
}));
ava_1.test("parsing the file with one play token error", (t) => __awaiter(this, void 0, void 0, function* () {
    const failureData = yield _data_helper_1.readFailedJson();
    //q1 - 52, q2 - 59, q3 - 60, q4 - 44 == 215 so we should have one play less
    t.true(play_1.parsePlays(failureData.plays[0]).length === 214);
}));
ava_1.test("quarter: parses quarter number", (t) => {
    const quarter = simpleParsed.quarter;
    t.is(quarter, 1);
});
ava_1.test("down: parses down number", (t) => {
    const down = simpleParsed.down;
    t.is(down, 1);
});
ava_1.test("drive: parses drive number", (t) => {
    const drive = simpleParsed.drive;
    t.is(drive, 1);
});
ava_1.test("playInGame: parses play in game to value", (t) => {
    const primaryPlay = simpleParsed.playInGame;
    t.is(primaryPlay, 3);
});
ava_1.test("playStartLocation: parses play start location", (t) => {
    const location = simpleParsed.playStartLocation;
    t.deepEqual(location, {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 25,
        endzone: false,
    });
});
ava_1.test("yardsToGo: parses yards to go", (t) => {
    const yards = simpleParsed.yardsToGo;
    t.is(yards, 10);
});
ava_1.test("description: parses play description", (t) => {
    const description = simpleParsed.description;
    t.is(description, "Browne, Max pass complete to Davis, Justin for 6 yards to the USC31 (M. Fitzpatrick).");
});
ava_1.test("clock: parses game clock start time when missing (because of 15:00 time)", (t) => {
    const time = simpleParsed.gameClockStartTime;
    t.deepEqual(time, { minutes: 0, seconds: 0 });
});
ava_1.test("clock: parses game clock after 1 play elapsed", (t) => {
    const afterPlay = {
        $: {
            context: "V,2,4,V31",
            playid: "1,2,4",
            type: "P",
            first: "P",
            clock: "14:39",
            tokens: "T:14:39 PASS:0D,C,0A,H33 TACK:28",
            text: "Clock 14:39, Browne, Max pass complete to Rogers, Darreus " +
                "for 36 yards to the UA33, 1ST DOWN USC (Anthony Averett).",
        },
    };
    const play = new play_1.Play();
    play.parse(afterPlay, 1);
    const elapsedPlay = play.parsedData;
    t.deepEqual(elapsedPlay.gameClockStartTime, { minutes: 14, seconds: 39 });
});
ava_1.test("first down: parses play which doesn't result in first down", (t) => {
    t.is(simpleParsed.resultedInFirstDown, false);
});
ava_1.test("first down: parses play which resulted in first down", (t) => {
    const firstDownPlay = {
        $: {
            context: "V,2,4,V31",
            playid: "1,2,4",
            type: "P",
            first: "P",
            clock: "14:39",
            tokens: "T:14:39 PASS:0D,C,0A,H33 TACK:28",
            text: "Clock 14:39, Browne, Max pass complete to Rogers, Darreus " +
                "for 36 yards to the UA33, 1ST DOWN USC (Anthony Averett).",
        },
    };
    const play = new play_1.Play();
    play.parse(firstDownPlay, 1);
    const firstdownPlay = play.parsedData;
    t.is(firstdownPlay.resultedInFirstDown, true);
});
ava_1.test("scoring: parses play without a score", (t) => {
    t.is(simpleParsed.score, undefined);
});
ava_1.test("scoring: parses play with a field goal", (t) => {
    const scoringPlay = {
        $: {
            context: "V,4,6,H29",
            playid: "1,6,8",
            type: "F",
            score: "Y",
            vscore: 3,
            hscore: 0,
            clock: "12:28",
            tokens: "FGA:39,47,G T:12:28",
            text: "Boermeester, Ma field goal attempt from 47 GOOD, clock 12:28.",
        },
    };
    const play = new play_1.Play();
    play.parse(scoringPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.gameClockStartTime, { minutes: 12, seconds: 28 });
    t.not(parsed.score, undefined);
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.visitor);
    t.is(score.scoringPlayerId, "V39");
    t.is(score.type, "FG");
    t.is(score.homeScore, 0);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 47); // from 47 yard line (not including endzone distance)
});
ava_1.test("scoring: parses touchdown info", (t) => {
    const touchdownPlay = {
        $: {
            context: "H,3,13,V39",
            playid: "12,4,78",
            type: "P",
            first: "P",
            score: "Y",
            vscore: 3,
            hscore: 6,
            clock: "07:46",
            tokens: "T:07:55 PASS:2,C,13,V00 T:07:46",
            text: "Clock 07:55, Jalen Hurts pass complete to A. Stewart " +
                "for 39 yards to the USC0, 1ST DOWN UA, TOUCHDOWN, clock 07:46.",
        },
    };
    const play = new play_1.Play();
    play.parse(touchdownPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    t.deepEqual(parsed.gameClockStartTime, { minutes: 7, seconds: 46 });
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.home);
    t.is(score.scoringPlayerId, "H13");
    t.is(score.type, "PASS"); // a score that's a pass must also be a TD (i.e. TD pass)
    t.is(score.homeScore, 6);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 39);
});
ava_1.test("scoring: parses touchdown info with turnover from V to H", (t) => {
    const touchdownPlay = {
        $: {
            context: "V,2,8,V12",
            playid: "15,3,98",
            type: "P",
            score: "Y",
            vscore: 3,
            hscore: 16,
            turnover: "I",
            clock: "02:37",
            tokens: "T:02:46 PASS:0D,X,26,V18 RET:26,V00 T:02:37",
            text: "Clock 02:46, Browne, Max pass intercepted by Marlon Humphrey at the USC18, " +
                "Marlon Humphrey return 18 yards to the USC0, TOUCHDOWN, clock 02:37.",
        },
    };
    const play = new play_1.Play();
    play.parse(touchdownPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    t.deepEqual(parsed.gameClockStartTime, { minutes: 2, seconds: 37 });
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.home);
    t.is(score.scoringPlayerId, "H26");
    t.is(score.type, "RET");
    t.is(score.homeScore, 16);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 18);
});
ava_1.test("scoring: parses touchdown info with turnover from H to V", (t) => {
    // modified play has all references (except for in text prop) to H and V swapped.
    const modifiedPlay = {
        $: {
            context: "H,2,8,H12",
            playid: "15,3,98",
            type: "P",
            score: "Y",
            vscore: 3,
            hscore: 16,
            turnover: "I",
            clock: "02:37",
            tokens: "T:02:46 PASS:0D,X,26,H18 RET:26,H00 T:02:37",
            text: "Clock 02:46, Browne, Max pass intercepted by Marlon Humphrey at the USC18, " +
                "Marlon Humphrey return 18 yards to the USC0, TOUCHDOWN, clock 02:37.",
        },
    };
    const play = new play_1.Play();
    play.parse(modifiedPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    t.deepEqual(parsed.gameClockStartTime, { minutes: 2, seconds: 37 });
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.visitor);
    t.is(score.scoringPlayerId, "V26");
    t.is(score.type, "RET");
    t.is(score.homeScore, 16);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 18);
});
ava_1.test("scoring: parses rush for touchdown with turnover from V to H", (t) => {
    // modified play has all references (except for in text prop) to H and V swapped.
    const modifiedPlay = {
        // made up data. `TODO`: is a play with fumble and TD rush actually like this?
        // made up data is: V starts on V07, fumbled on V20, rushed by H to V00 for touchdown
        $: {
            context: "V,1,0,V07",
            playid: "21,6,131",
            type: "R",
            score: "Y",
            turnover: "F",
            vscore: 3,
            hscore: 30,
            clock: "10:55",
            tokens: "T:11:02 RUSH:2,V20, FUMB:H,V20,2, +:2,V00 T:10:55",
            text: "V starts on V07, fumbled on V20, rushed by H from V20 to V00 for touchdown",
        },
    };
    const play = new play_1.Play();
    play.parse(modifiedPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.home);
    t.is(score.scoringPlayerId, "H2");
    t.is(score.type, "RUSH");
    t.is(score.homeScore, 30);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 20);
});
ava_1.test("scoring: parses rush for touchdown with turnover from H to V", (t) => {
    // modified play has all references (except for in text prop) to H and V swapped.
    const modifiedPlay = {
        // made up data. TODO: is a play with fumble and TD rush actually like this?
        // made up data is: H starts on H07, fumbled on H20, rushed by V to H00 for touchdown
        $: {
            context: "H,1,0,V07",
            playid: "21,6,131",
            type: "R",
            score: "Y",
            turnover: "F",
            vscore: 9,
            hscore: 30,
            clock: "10:55",
            tokens: "T:11:02 RUSH:2,H20, FUMB:V,H20,2, +:2,H00 T:10:55",
            text: "H starts on H07, fumbled on H20, rushed by V to H00 for touchdown",
        },
    };
    const play = new play_1.Play();
    play.parse(modifiedPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.visitor);
    t.is(score.scoringPlayerId, "V2");
    t.is(score.type, "RUSH");
    t.is(score.homeScore, 30);
    t.is(score.visitorScore, 9);
    t.is(score.yards, 20);
});
ava_1.test("scoring: parses PAT", (t) => {
    // modified play has all references (except for in text prop) to H and V swapped.
    const modifiedPlay = {
        // made up data. TODO: is a play with fumble and TD rush actually like this?
        $: {
            context: "H,1,0,V03",
            playid: "12,5,79",
            type: "X",
            score: "Y",
            vscore: 3,
            hscore: 7,
            tokens: "PAT:K,99,G",
            text: "Adam Griffith kick attempt good.",
        },
    };
    const play = new play_1.Play();
    play.parse(modifiedPlay, 1);
    const parsed = play.parsedData;
    t.not(parsed.score, undefined);
    const score = parsed.score;
    t.is(score.side, AthlyteImporter_1.VH.home);
    t.is(score.scoringPlayerId, "H99");
    t.is(score.type, "PAT");
    t.is(score.homeScore, 7);
    t.is(score.visitorScore, 3);
    t.is(score.yards, 3);
});
ava_1.test("error: down number is outside expected range", (t) => {
    const badData = {
        $: {
            context: "V,-1,10,V25",
            playid: "1,1,3",
            type: "P",
            tokens: "PASS:0D,C,2B,V31 TACK:29",
            text: "Browne, Max pass complete to Davis, Justin for 6 yards to the USC31 (M. Fitzpatrick).",
        },
    };
    const play = new play_1.Play();
    t.throws(() => play.parse(badData, 1));
});
ava_1.test("error: possession is not V|H", (t) => {
    const badData = {
        $: {
            context: "Q,1,10,V25",
            playid: "1,1,3",
            type: "P",
            tokens: "PASS:0D,C,2B,V31 TACK:29",
            text: "Browne, Max pass complete to Davis, Justin for 6 yards to the USC31 (M. Fitzpatrick).",
        },
    };
    const play = new play_1.Play();
    t.throws(() => play.parse(badData, 1));
});
ava_1.test("error: play starts location is impossible", (t) => {
    const badData = {
        $: {
            context: "V,1,10,V60",
            playid: "1,1,3",
            type: "P",
            tokens: "PASS:0D,C,2B,V31 TACK:29",
            text: "Browne, Max pass complete to Davis, Justin for 6 yards to the USC31 (M. Fitzpatrick).",
        },
    };
    const play = new play_1.Play();
    t.throws(() => play.parse(badData, 1));
});
ava_1.test("ending location: completed pass", (t) => {
    t.deepEqual(simpleParsed.playEndLocation, {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 31,
        endzone: false,
    });
});
ava_1.test("ending location: incomplete pass", (t) => {
    const incompletePlay = {
        $: {
            context: "V,3,14,H23",
            playid: "26,9,163",
            type: "P",
            clock: "02:44",
            tokens: "T:02:44 PASS:0D,I,9,*",
            text: "Clock 02:44, Browne, Max pass incomplete to Smith-Schuster.",
        },
    };
    const play = new play_1.Play();
    play.parse(incompletePlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.playEndLocation, {
        side: AthlyteImporter_1.VH.home,
        yardline: 23,
        endzone: false,
    });
});
ava_1.test("ending location: ignores ending location when NOPLAY: token occurs", (t) => {
    const penaltyPlay = {
        $: {
            context: "V,1,10,H48",
            playid: "30,6,196",
            type: "E",
            first: "E",
            clock: "07:36",
            tokens: "T:07:36 PASS:1D,I,15,* BRUP:28 PEN:H,PI,A,28,H44,1 NOPLAY:",
            text: "Clock 07:36, Darnold, Sam pass incomplete to Whitney, Isaac (Anthony Averett), " +
                "PENALTY UA pass interference (Anthony Averett) 4 yards to the UA44, 1ST DOWN USC, NO PLAY.",
        },
    };
    const play = new play_1.Play();
    play.parse(penaltyPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.playEndLocation, {
        side: AthlyteImporter_1.VH.home,
        yardline: 48,
        endzone: false,
    });
});
ava_1.test("ending location: uses ending location before penalty applied", (t) => {
    const penaltyPlay = {
        $: {
            context: "H,1,0,H35",
            playid: "14,9,94",
            type: "K",
            tokens: "KO:99,V01 RET:2,V20 TACK:32 PEN:V,PF,A,40,V10,N D:1,10 SPOT:V,V10,Y",
            text: "Adam Griffith kickoff 64 yards to the USC1, " +
                "Jackson, Adoree return 19 yards to the USC20 (Rashaan Evans), " +
                "PENALTY USC personal foul (Ruffin, Jabari) 10 yards to the USC10, 1st and 10, USC ball on USC10.",
        },
    };
    const play = new play_1.Play();
    play.parse(penaltyPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.playEndLocation, {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 20,
        endzone: false,
    });
});
ava_1.test("ending location: rush", (t) => {
    const rushingPlay = {
        $: {
            context: "H,3,9,V14",
            playid: "14,7,92",
            type: "R",
            clock: "04:02",
            tokens: "T:04:02 RUSH:2,V11, OB: TACK:8",
            text: "Clock 04:02, Jalen Hurts rush for 3 yards to the USC11, " +
                "out-of-bounds (Marshall, Iman).",
        },
    };
    const play = new play_1.Play();
    play.parse(rushingPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.playEndLocation, {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 11,
        endzone: false,
    });
});
ava_1.test("ending location: sack", (t) => {
    const sackPlay = {
        $: {
            context: "V,2,7,V45",
            playid: "9,3,57",
            type: "P",
            clock: "13:44",
            tokens: "T:13:44 PASS:0D,S,TM,V35 SACK:93",
            text: "Clock 13:44, Browne, Max sacked for loss of 10 yards to the USC35 (Jonathan Allen).",
        },
    };
    const play = new play_1.Play();
    play.parse(sackPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.playEndLocation, {
        side: AthlyteImporter_1.VH.visitor,
        yardline: 35,
        endzone: false,
    });
});
ava_1.test("punt return for TD", (t) => {
    const puntReturnPlay = {
        $: {
            context: "V,4,10,V17",
            playid: "16,5,111",
            type: "U",
            score: "Y",
            clock: "03:03",
            tokens: "PUNT:15,H32 RET:3,V00 T:03:03",
            vscore: 28,
            hscore: 12,
            text: "JK Scott punt 51 yards to the TAMU32, Christian Kirk return 68 yards to the UA0, TOUCHDOWN, clock 03:03.",
        },
    };
    const play = new play_1.Play();
    play.parse(puntReturnPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.score, {
        side: AthlyteImporter_1.VH.home,
        scoringPlayerId: "H3",
        type: "RET",
        yards: 68,
        homeScore: 12,
        visitorScore: 28,
    });
});
ava_1.test("kickoff return for TD", (t) => {
    const kickoffReturnPlay = {
        $: {
            context: "H,1,0,H35",
            playid: "27,8,216",
            type: "K",
            score: "Y",
            vscore: 27,
            hscore: 37,
            clock: "07:31",
            tokens: "KO:92,V05 RET:17,H00 T:07:31",
            text: "Huegel kickoff 60 yards to the UA5, Kenyan Drake return 95 yards to the CU0, TOUCHDOWN, clock 07:31.",
        },
    };
    const play = new play_1.Play();
    play.parse(kickoffReturnPlay, 1);
    const parsed = play.parsedData;
    t.deepEqual(parsed.score, {
        side: AthlyteImporter_1.VH.visitor,
        scoringPlayerId: "V17",
        type: "RET",
        yards: 95,
        homeScore: 37,
        visitorScore: 27,
    });
});
//# sourceMappingURL=play.test.js.map