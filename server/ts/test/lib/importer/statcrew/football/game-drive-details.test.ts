import { test } from "ava";
import * as _ from "lodash";

import {
  calculateFieldPosition, parseDriveDetails, parsePlayDetails,
} from "../../../../../src/lib/importer/statcrew/helpers/driveDetails";

// types
import { IDrivePlayInfo } from "../../../../../../../typings/athlyte/football/game.d";
import { VH as StatcrewVH } from "../../../../../../../typings/statcrew/football/team.d";
import { VH as AthlyteVH } from "../../../../../src/lib/importer/AthlyteImporter";

const sampleDrive = {
  $: {
    vh: "V" as StatcrewVH,
    team: "USC",
    start: "KO,1,15:00,25",
    end: "FG,1,12:28,71",
    plays: 6,
    yards: 46,
    top: "2:32",
    driveindex: 1,
  },
};

test("parses standard drive information", (t) => {
  const driveInfo = parseDriveDetails(sampleDrive);
  t.is(driveInfo.drivingTeam, AthlyteVH.visitor);
  t.is(driveInfo.drivingTeamName, "USC");
  t.is(driveInfo.plays, 6);
  t.is(driveInfo.timeOfPossession, "2:32");

  // play info to start drive
  t.is(driveInfo.startPlay.clock, "15:00");
  t.deepEqual(driveInfo.startPlay.fieldPos, { side: AthlyteVH.visitor, yardline: 25, endzone: false });
  t.is(driveInfo.startPlay.playType, "KO");
  t.is(driveInfo.startPlay.quarter, 1);

  // play info to end drive
  t.is(driveInfo.endPlay.clock, "12:28");
  t.deepEqual(driveInfo.endPlay.fieldPos, { side: AthlyteVH.home, yardline: 29, endzone: false });
  t.is(driveInfo.endPlay.playType, "FG");
  t.is(driveInfo.endPlay.quarter, 1);
});

test("parses yards gained/ lost on a play", (t) => {
  // drive has positive yards
  const gainDrive = parseDriveDetails(sampleDrive);
  t.is(gainDrive.yards, 46);

  // drive has negative yards
  const modDrive = _.cloneDeep(sampleDrive);
  modDrive.$.yards = -10;
  const lossDrive = parseDriveDetails(modDrive);
  t.is(lossDrive.yards, -10);
});

test("parses various play start strings", (t) => {
  t.deepEqual(parsePlayDetails("KO,1,15:00,25", AthlyteVH.home),
    { playType: "KO", quarter: 1, clock: "15:00", fieldPos: { side: AthlyteVH.home, yardline: 25, endzone: false } },
  );
  t.deepEqual(parsePlayDetails("INT,2,02:37,100", AthlyteVH.home),
    { playType: "INT", quarter: 2, clock: "02:37", fieldPos: { side: AthlyteVH.visitor, yardline: 0, endzone: true } },
  );
});

test("parses various play end strings", (t) => {
  t.deepEqual(parsePlayDetails("FG,1,12:28,71", AthlyteVH.visitor),
    {
      playType: "FG", quarter: 1, clock: "12:28", fieldPos:
        { side: AthlyteVH.home, yardline: 29, endzone: false },
    },
  );
  t.deepEqual(parsePlayDetails("PUNT,1,10:23,31", AthlyteVH.home),
    {
      playType: "PUNT", quarter: 1, clock: "10:23", fieldPos:
        { side: AthlyteVH.home, yardline: 31, endzone: false },
    },
  );
  t.deepEqual(parsePlayDetails("DOWNS,1,06:08,63", AthlyteVH.visitor),
    {
      playType: "DOWNS", quarter: 1, clock: "06:08", fieldPos:
        { side: AthlyteVH.home, yardline: 37, endzone: false },
    },
  );
  t.deepEqual(parsePlayDetails("INT,2,02:37,12", AthlyteVH.visitor),
    {
      playType: "INT", quarter: 2, clock: "02:37", fieldPos:
        { side: AthlyteVH.visitor, yardline: 12, endzone: false },
    },
  );
  t.deepEqual(parsePlayDetails("TD,2,02:37,100", AthlyteVH.home),
    {
      playType: "TD", quarter: 2, clock: "02:37", fieldPos:
        { side: AthlyteVH.visitor, yardline: 0, endzone: true },
    });
  t.deepEqual(parsePlayDetails("HALF,2,00:00,15", AthlyteVH.home),
    {
      playType: "HALF", quarter: 2, clock: "00:00", fieldPos:
        { side: AthlyteVH.home, yardline: 15, endzone: false },
    });
});

test("Calculate field position for yardlines > 50", (t) => {
  t.deepEqual(calculateFieldPosition(65, AthlyteVH.home),
    { side: AthlyteVH.visitor, yardline: 35, endzone: false });
  t.deepEqual(calculateFieldPosition(100, AthlyteVH.home),
    { side: AthlyteVH.visitor, yardline: 0, endzone: true });
});

test("Calculate field position for yardlines < 50", (t) => {
  t.deepEqual(calculateFieldPosition(35, AthlyteVH.visitor),
    { side: AthlyteVH.visitor, yardline: 35, endzone: false });
  t.deepEqual(calculateFieldPosition(0, AthlyteVH.visitor),
    { side: AthlyteVH.visitor, yardline: 0, endzone: true });
});
