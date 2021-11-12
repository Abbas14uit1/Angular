"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const AthlyteImporter_1 = require("../../../../../src/lib/importer/AthlyteImporter");
const playTokenParser_1 = require("../../../../../src/lib/importer/statcrew/helpers/playTokenParser");
ava_1.test("empty token string", (t) => {
    const parser = new playTokenParser_1.TokenParser("", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        playersInvolved: [],
    });
});
ava_1.test("parse a kickoff", (t) => {
    const parser = new playTokenParser_1.TokenParser("KO:99,V00 TB:", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        kickoff: {
            kickedTo: { endzone: true, side: AthlyteImporter_1.VH.visitor, yardline: 0 },
            kickerId: "H99",
        },
        touchback: true,
        playersInvolved: ["H99"],
    });
});
ava_1.test("pass", (t) => {
    const parser = new playTokenParser_1.TokenParser("PASS:0D,C,2B,V31", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        pass: {
            passerId: "H0D",
            receiverId: "H2B",
            wasCompleted: true,
            wasIntercepted: false,
            endingLocation: {
                side: AthlyteImporter_1.VH.visitor,
                yardline: 31,
                endzone: false,
            },
        },
        playersInvolved: ["H0D", "H2B"],
    });
});
ava_1.test("pass to invalid location", (t) => {
    const parser = new playTokenParser_1.TokenParser("PASS:0D,C,2B,Q31", AthlyteImporter_1.VH.home, undefined);
    t.throws(() => parser.parse());
});
ava_1.test("clock", (t) => {
    // ignore clock since we've got it elsewhere
    const parser = new playTokenParser_1.TokenParser("T:14:39", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        playersInvolved: [],
    });
});
ava_1.test("tackle", (t) => {
    const parser = new playTokenParser_1.TokenParser("TACK:29", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        tackle: [{
                tacklerId: "V29",
            }],
        playersInvolved: ["V29"],
    });
});
ava_1.test("rush", (t) => {
    const parser = new playTokenParser_1.TokenParser("RUSH:2B,H32", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        rush: {
            rusherId: "H2B",
            endingLocation: {
                side: AthlyteImporter_1.VH.home,
                yardline: 32,
                endzone: false,
            },
        },
        playersInvolved: ["H2B"],
    });
});
ava_1.test("field goal attempt", (t) => {
    const parser = new playTokenParser_1.TokenParser("FGA:99,29,G", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        fga: {
            kickerId: "H99",
            distance: 29,
            wasGood: true,
        },
        playersInvolved: ["H99"],
    });
});
ava_1.test("return", (t) => {
    const parser = new playTokenParser_1.TokenParser("RET:2,V20", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        return: {
            returnerId: "V2",
            ballReturnedTo: {
                side: AthlyteImporter_1.VH.visitor,
                yardline: 20,
                endzone: false,
            },
        },
        playersInvolved: ["V2"],
    });
});
ava_1.test("drive start", (t) => {
    // ignore drive start; it's elsewhere
    const parser = new playTokenParser_1.TokenParser("{DRIVE}:03:20", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        playersInvolved: [],
    });
});
ava_1.test("out of bounds", (t) => {
    const parser = new playTokenParser_1.TokenParser("OB: ", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        outOfBounds: true,
        playersInvolved: [],
    });
});
ava_1.test("sack, 1 player", (t) => {
    const parser = new playTokenParser_1.TokenParser("SACK:45", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        sack: {
            sackerIds: ["V45"],
        },
        playersInvolved: ["V45"],
    });
});
ava_1.test("sack, multiple players", (t) => {
    const parser = new playTokenParser_1.TokenParser("SACK:19,94", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        sack: {
            sackerIds: ["V19", "V94"],
        },
        playersInvolved: ["V19", "V94"],
    });
});
ava_1.test("punt", (t) => {
    const parser = new playTokenParser_1.TokenParser("PUNT:15,V32", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        punt: {
            punterId: "H15",
            puntedToLocation: {
                side: AthlyteImporter_1.VH.visitor,
                yardline: 32,
                endzone: false,
            },
        },
        playersInvolved: ["H15"],
    });
});
ava_1.test("fair catch", (t) => {
    const parser = new playTokenParser_1.TokenParser("FC:2", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        fairCatch: {
            callerId: "V2",
        },
        playersInvolved: ["V2"],
    });
});
ava_1.test("facemask penalty", (t) => {
    const parser = new playTokenParser_1.TokenParser("PEN:V,FM,A,0F,V36,N", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        penalty: {
            against: AthlyteImporter_1.VH.visitor,
            accepted: true,
            details: {
                playerDrawingPenalty: "V0F",
                type: "FM",
                newFieldPosition: {
                    side: AthlyteImporter_1.VH.visitor,
                    yardline: 36,
                    endzone: false,
                },
            },
        },
        playersInvolved: ["V0F"],
    });
});
ava_1.test("timeout", (t) => {
    const parser = new playTokenParser_1.TokenParser("TOUT:H", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        timeout: {
            calledBy: AthlyteImporter_1.VH.home,
        },
        playersInvolved: [],
    });
});
ava_1.test("no play", (t) => {
    const parser = new playTokenParser_1.TokenParser("NOPLAY:", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        noplay: true,
        playersInvolved: [],
    });
});
ava_1.test("quarterback hurry", (t) => {
    const parser = new playTokenParser_1.TokenParser("QBH:H,56", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        qbHurry: {
            playerId: "V56",
        },
        playersInvolved: ["V56"],
    });
});
ava_1.test("fumble", (t) => {
    const parser = new playTokenParser_1.TokenParser("FUMB:H,H45,3", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        fumble: {
            fumbledBy: "H3",
            recoveredLocation: {
                side: AthlyteImporter_1.VH.home,
                yardline: 45,
                endzone: false,
            },
        },
        playersInvolved: ["H3"],
    });
});
ava_1.test("fumble forcer", (t) => {
    const parser = new playTokenParser_1.TokenParser("FORCE:24", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        fumbleForced: {
            forcerId: "V24",
        },
        playersInvolved: ["V24"],
    });
});
ava_1.test("fumble recovery", (t) => {
    const parser = new playTokenParser_1.TokenParser("+:3,V49", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        fumbleRecovery: {
            recoveringId: "H3",
            returnedToLocation: {
                side: AthlyteImporter_1.VH.visitor,
                yardline: 49,
                endzone: false,
            },
        },
        playersInvolved: ["H3"],
    });
});
ava_1.test("downed", (t) => {
    const parser = new playTokenParser_1.TokenParser("DN:", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        down: true,
        playersInvolved: [],
    });
});
ava_1.test("broken up pass", (t) => {
    const parser = new playTokenParser_1.TokenParser("BRUP:22", AthlyteImporter_1.VH.home, undefined);
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
ava_1.test("point after touchdown", (t) => {
    const parser = new playTokenParser_1.TokenParser("PAT:K,99,G", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        pointAfterTd: {
            type: "K",
            playerId: "H99",
            good: true,
        },
        playersInvolved: ["H99"],
    });
});
ava_1.test("empty", (t) => {
    const parser = new playTokenParser_1.TokenParser("", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        playersInvolved: [],
    });
});
ava_1.test("unexpected token", (t) => {
    const parser = new playTokenParser_1.TokenParser("HELLO:5,K,T2", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        playersInvolved: [],
    });
});
ava_1.test("return a punt for a TD", (t) => {
    const parser = new playTokenParser_1.TokenParser("PUNT:15,H32 RET:3,V00 T:03:03", AthlyteImporter_1.VH.home, undefined);
    t.deepEqual(parser.parse(), {
        punt: {
            punterId: "H15",
            puntedToLocation: {
                side: AthlyteImporter_1.VH.home,
                yardline: 32,
                endzone: false,
            },
        },
        return: {
            returnerId: "V3",
            ballReturnedTo: {
                side: AthlyteImporter_1.VH.visitor,
                yardline: 0,
                endzone: true,
            },
        },
        playersInvolved: ["H15", "V3"],
    });
});
//# sourceMappingURL=play-tokens.test.js.map