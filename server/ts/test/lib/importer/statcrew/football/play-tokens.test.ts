import { test } from "ava";
import * as _ from "lodash";

import { VH } from "../../../../../src/lib/importer/AthlyteImporter";
import { TokenParser } from "../../../../../src/lib/importer/statcrew/helpers/playTokenParser";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlytePlay from "../../../../../../../typings/athlyte/football/play.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";

test("empty token string", (t) => {
  const parser = new TokenParser("", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    playersInvolved: [],
  } as AthlytePlay.IPlayResults);
});

test("parse a kickoff", (t) => {
  const parser = new TokenParser("KO:99,V00 TB:", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    kickoff: {
      kickedTo: { endzone: true, side: VH.visitor, yardline: 0 },
      kickerId: "H99",
    },
    touchback: true,
    playersInvolved: ["H99"],
  });
});

test("pass", (t) => {
  const parser = new TokenParser("PASS:0D,C,2B,V31", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    pass: {
      passerId: "H0D",
      receiverId: "H2B",
      wasCompleted: true,
      wasIntercepted: false,
      endingLocation: {
        side: VH.visitor,
        yardline: 31,
        endzone: false,
      },
    },
    playersInvolved: ["H0D", "H2B"],
  });
});

test("pass to invalid location", (t) => {
  const parser = new TokenParser("PASS:0D,C,2B,Q31", VH.home, undefined);
  t.throws(() => parser.parse());
});

test("clock", (t) => {
  // ignore clock since we've got it elsewhere
  const parser = new TokenParser("T:14:39", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    playersInvolved: [],
  } as AthlytePlay.IPlayResults);
});

test("tackle", (t) => {
  const parser = new TokenParser("TACK:29", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    tackle: [{
      tacklerId: "V29",
    }],
    playersInvolved: ["V29"],
  });
});

test("rush", (t) => {
  const parser = new TokenParser("RUSH:2B,H32", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    rush: {
      rusherId: "H2B",
      endingLocation: {
        side: VH.home,
        yardline: 32,
        endzone: false,
      },
    },
    playersInvolved: ["H2B"],
  });
});

test("field goal attempt", (t) => {
  const parser = new TokenParser("FGA:99,29,G", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    fga: {
      kickerId: "H99",
      distance: 29,
      wasGood: true,
    },
    playersInvolved: ["H99"],
  });
});

test("return", (t) => {
  const parser = new TokenParser("RET:2,V20", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    return: {
      returnerId: "V2",
      ballReturnedTo: {
        side: VH.visitor,
        yardline: 20,
        endzone: false,
      },
    },
    playersInvolved: ["V2"],
  });
});

test("drive start", (t) => {
  // ignore drive start; it's elsewhere
  const parser = new TokenParser("{DRIVE}:03:20", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    playersInvolved: [],
  });
});

test("out of bounds", (t) => {
  const parser = new TokenParser("OB: ", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    outOfBounds: true,
    playersInvolved: [],
  });
});

test("sack, 1 player", (t) => {
  const parser = new TokenParser("SACK:45", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    sack: {
      sackerIds: ["V45"],
    },
    playersInvolved: ["V45"],
  });
});

test("sack, multiple players", (t) => {
  const parser = new TokenParser("SACK:19,94", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    sack: {
      sackerIds: ["V19", "V94"],
    },
    playersInvolved: ["V19", "V94"],
  });
});

test("punt", (t) => {
  const parser = new TokenParser("PUNT:15,V32", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    punt: {
      punterId: "H15",
      puntedToLocation: {
        side: VH.visitor,
        yardline: 32,
        endzone: false,
      },
    },
    playersInvolved: ["H15"],
  });
});

test("fair catch", (t) => {
  const parser = new TokenParser("FC:2", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    fairCatch: {
      callerId: "V2",
    },
    playersInvolved: ["V2"],
  });
});

test("facemask penalty", (t) => {
  const parser = new TokenParser("PEN:V,FM,A,0F,V36,N", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    penalty: {
      against: VH.visitor,
      accepted: true,
      details: {
        playerDrawingPenalty: "V0F",
        type: "FM",
        newFieldPosition: {
          side: VH.visitor,
          yardline: 36,
          endzone: false,
        },
      },
    },
    playersInvolved: ["V0F"],
  });
});

test("timeout", (t) => {
  const parser = new TokenParser("TOUT:H", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    timeout: {
      calledBy: VH.home,
    },
    playersInvolved: [],
  });
});

test("no play", (t) => {
  const parser = new TokenParser("NOPLAY:", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    noplay: true,
    playersInvolved: [],
  });
});

test("quarterback hurry", (t) => {
  const parser = new TokenParser("QBH:H,56", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    qbHurry: {
      playerId: "V56",
    },
    playersInvolved: ["V56"],
  });
});

test("fumble", (t) => {
  const parser = new TokenParser("FUMB:H,H45,3", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    fumble: {
      fumbledBy: "H3",
      recoveredLocation: {
        side: VH.home,
        yardline: 45,
        endzone: false,
      },
    },
    playersInvolved: ["H3"],
  });
});

test("fumble forcer", (t) => {
  const parser = new TokenParser("FORCE:24", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    fumbleForced: {
      forcerId: "V24",
    },
    playersInvolved: ["V24"],
  });
});

test("fumble recovery", (t) => {
  const parser = new TokenParser("+:3,V49", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    fumbleRecovery: {
      recoveringId: "H3",
      returnedToLocation: {
        side: VH.visitor,
        yardline: 49,
        endzone: false,
      },
    },
    playersInvolved: ["H3"],
  });
});

test("downed", (t) => {
  const parser = new TokenParser("DN:", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    down: true,
    playersInvolved: [],
  });
});

test("broken up pass", (t) => {
  const parser = new TokenParser("BRUP:22", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    brokenUp: {
      breakingUpId: "V22",
    },
    playersInvolved: ["V22"],
  });
});

/**
 * TODO: find two-point conversions to investigate their format
 */
test("point after touchdown", (t) => {
  const parser = new TokenParser("PAT:K,99,G", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    pointAfterTd: {
      type: "K",
      playerId: "H99",
      good: true,
    },
    playersInvolved: ["H99"],
  });
});

test("empty", (t) => {
  const parser = new TokenParser("", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    playersInvolved: [],
  });
});

test("unexpected token", (t) => {
  const parser = new TokenParser("HELLO:5,K,T2", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    playersInvolved: [],
  });
});

test("return a punt for a TD", (t) => {
  const parser = new TokenParser("PUNT:15,H32 RET:3,V00 T:03:03", VH.home, undefined);
  t.deepEqual(parser.parse(), {
    punt: {
      punterId: "H15",
      puntedToLocation: {
        side: VH.home,
        yardline: 32,
        endzone: false,
      },
    },
    return: {
      returnerId: "V3",
      ballReturnedTo: {
        side: VH.visitor,
        yardline: 0,
        endzone: true,
      },
    },
    playersInvolved: ["H15", "V3"],
  });
});
