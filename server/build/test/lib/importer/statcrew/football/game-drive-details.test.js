"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const _ = require("lodash");
const driveDetails_1 = require("../../../../../src/lib/importer/statcrew/helpers/driveDetails");
const AthlyteImporter_1 = require("../../../../../src/lib/importer/AthlyteImporter");
const sampleDrive = {
    $: {
        vh: "V",
        team: "USC",
        start: "KO,1,15:00,25",
        end: "FG,1,12:28,71",
        plays: 6,
        yards: 46,
        top: "2:32",
        driveindex: 1,
    },
};
ava_1.test("parses standard drive information", (t) => {
    const driveInfo = driveDetails_1.parseDriveDetails(sampleDrive);
    t.is(driveInfo.drivingTeam, AthlyteImporter_1.VH.visitor);
    t.is(driveInfo.drivingTeamName, "USC");
    t.is(driveInfo.plays, 6);
    t.is(driveInfo.timeOfPossession, "2:32");
    // play info to start drive
    t.is(driveInfo.startPlay.clock, "15:00");
    t.deepEqual(driveInfo.startPlay.fieldPos, { side: AthlyteImporter_1.VH.visitor, yardline: 25, endzone: false });
    t.is(driveInfo.startPlay.playType, "KO");
    t.is(driveInfo.startPlay.quarter, 1);
    // play info to end drive
    t.is(driveInfo.endPlay.clock, "12:28");
    t.deepEqual(driveInfo.endPlay.fieldPos, { side: AthlyteImporter_1.VH.home, yardline: 29, endzone: false });
    t.is(driveInfo.endPlay.playType, "FG");
    t.is(driveInfo.endPlay.quarter, 1);
});
ava_1.test("parses yards gained/ lost on a play", (t) => {
    // drive has positive yards
    const gainDrive = driveDetails_1.parseDriveDetails(sampleDrive);
    t.is(gainDrive.yards, 46);
    // drive has negative yards
    const modDrive = _.cloneDeep(sampleDrive);
    modDrive.$.yards = -10;
    const lossDrive = driveDetails_1.parseDriveDetails(modDrive);
    t.is(lossDrive.yards, -10);
});
ava_1.test("parses various play start strings", (t) => {
    t.deepEqual(driveDetails_1.parsePlayDetails("KO,1,15:00,25", AthlyteImporter_1.VH.home), { playType: "KO", quarter: 1, clock: "15:00", fieldPos: { side: AthlyteImporter_1.VH.home, yardline: 25, endzone: false } });
    t.deepEqual(driveDetails_1.parsePlayDetails("INT,2,02:37,100", AthlyteImporter_1.VH.home), { playType: "INT", quarter: 2, clock: "02:37", fieldPos: { side: AthlyteImporter_1.VH.visitor, yardline: 0, endzone: true } });
});
ava_1.test("parses various play end strings", (t) => {
    t.deepEqual(driveDetails_1.parsePlayDetails("FG,1,12:28,71", AthlyteImporter_1.VH.visitor), {
        playType: "FG", quarter: 1, clock: "12:28", fieldPos: { side: AthlyteImporter_1.VH.home, yardline: 29, endzone: false },
    });
    t.deepEqual(driveDetails_1.parsePlayDetails("PUNT,1,10:23,31", AthlyteImporter_1.VH.home), {
        playType: "PUNT", quarter: 1, clock: "10:23", fieldPos: { side: AthlyteImporter_1.VH.home, yardline: 31, endzone: false },
    });
    t.deepEqual(driveDetails_1.parsePlayDetails("DOWNS,1,06:08,63", AthlyteImporter_1.VH.visitor), {
        playType: "DOWNS", quarter: 1, clock: "06:08", fieldPos: { side: AthlyteImporter_1.VH.home, yardline: 37, endzone: false },
    });
    t.deepEqual(driveDetails_1.parsePlayDetails("INT,2,02:37,12", AthlyteImporter_1.VH.visitor), {
        playType: "INT", quarter: 2, clock: "02:37", fieldPos: { side: AthlyteImporter_1.VH.visitor, yardline: 12, endzone: false },
    });
    t.deepEqual(driveDetails_1.parsePlayDetails("TD,2,02:37,100", AthlyteImporter_1.VH.home), {
        playType: "TD", quarter: 2, clock: "02:37", fieldPos: { side: AthlyteImporter_1.VH.visitor, yardline: 0, endzone: true },
    });
    t.deepEqual(driveDetails_1.parsePlayDetails("HALF,2,00:00,15", AthlyteImporter_1.VH.home), {
        playType: "HALF", quarter: 2, clock: "00:00", fieldPos: { side: AthlyteImporter_1.VH.home, yardline: 15, endzone: false },
    });
});
ava_1.test("Calculate field position for yardlines > 50", (t) => {
    t.deepEqual(driveDetails_1.calculateFieldPosition(65, AthlyteImporter_1.VH.home), { side: AthlyteImporter_1.VH.visitor, yardline: 35, endzone: false });
    t.deepEqual(driveDetails_1.calculateFieldPosition(100, AthlyteImporter_1.VH.home), { side: AthlyteImporter_1.VH.visitor, yardline: 0, endzone: true });
});
ava_1.test("Calculate field position for yardlines < 50", (t) => {
    t.deepEqual(driveDetails_1.calculateFieldPosition(35, AthlyteImporter_1.VH.visitor), { side: AthlyteImporter_1.VH.visitor, yardline: 35, endzone: false });
    t.deepEqual(driveDetails_1.calculateFieldPosition(0, AthlyteImporter_1.VH.visitor), { side: AthlyteImporter_1.VH.visitor, yardline: 0, endzone: true });
});
//# sourceMappingURL=game-drive-details.test.js.map