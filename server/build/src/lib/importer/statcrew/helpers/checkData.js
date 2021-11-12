"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const winstonLogger_1 = require("../../../winstonLogger");
/**
 * This file/function is used to check to make sure that there is no unexpected data in an XML file
 * Only utilized in unexpectedStatcrewPropFinder and no where else
 */
const firstDownStats = {
    $: {
        no: "number",
        rush: "number",
        pass: "number",
        penalty: "number",
    },
};
const penaltyStats = {
    $: {
        no: "number",
        yds: "number",
    },
};
const conversionStats = {
    $: {
        thirdconv: "number",
        thirdatt: "number",
        fourthconv: "number",
        fourthatt: "number",
    },
};
const fumbleStats = {
    $: {
        no: "number",
        lost: "number",
    },
};
const miscStats = {
    $: {
        yds: "number",
        top: "string",
        ona: "number",
        onm: "number",
        ptsto: "number",
    },
};
const redzoneStats = {
    $: {
        att: "number",
        scores: "number",
        points: "number",
        tdrush: "number",
        tdpass: "number",
        fgmade: "number",
        endfga: "number",
        enddowns: "number",
        endint: "number",
        endfumb: "number",
        endhalf: "number",
        endgame: "number",
    },
};
const rushStats = {
    $: {
        att: "number",
        yds: "number",
        gain: "number",
        loss: "number",
        td: "number",
        long: "number",
    },
};
const passStats = {
    $: {
        comp: "number",
        att: "number",
        int: "number",
        yds: "number",
        td: "number",
        long: "number",
        sacks: "number",
        sackyds: "number",
    },
};
const receivingStats = {
    $: {
        no: "number",
        yds: "number",
        td: "number",
        long: "number",
    },
};
const puntStats = {
    $: {
        no: "number",
        yds: "number",
        long: "number",
        avg: "number",
        blkd: "number",
        tb: "number",
        fc: "number",
        plus50: "number",
        inside20: "number",
    },
};
const kickoffStats = {
    $: {
        no: "number",
        yds: "number",
        ob: "number",
        tb: "number",
    },
};
const fieldgoalStats = {
    $: {
        made: "number",
        att: "number",
        long: "number",
        blkd: "number",
    },
};
const pointAfterStats = {
    $: {
        kickatt: "number",
        kickmade: "number",
        passatt: "number",
        passmade: "number",
        rushatt: "number",
        rushmade: "number",
    },
};
const defenseStats = {
    $: {
        tackua: "number",
        tacka: "number",
        tot_tack: "number",
        tflua: "number",
        tfla: "number",
        tflyds: "number",
        sacks: "number",
        sackyds: "number",
        sackua: "number",
        sacka: "number",
        brup: "number",
        ff: "number",
        fr: "number",
        fryds: "number",
        int: "number",
        intyds: "number",
        qbh: "number",
        blkd: "number",
    },
};
const returnStats = {
    $: {
        no: "number",
        yds: "number",
        td: "number",
        long: "number",
    },
};
const scoringStats = {
    $: {
        fg: "number",
        td: "number",
        patkick: "number",
    },
};
const playerStats = {
    $: {
        name: "string",
        shortname: "string",
        checkname: "string",
        uni: "string,number",
        class: "string",
        gp: "number",
        gs: "number",
        opos: "string",
        dpos: "string",
        code: "string,number",
    },
    rcv: [receivingStats],
    rush: [rushStats],
    pass: [passStats],
    defense: [defenseStats],
    kr: [returnStats],
    fumbles: [fumbleStats],
    ir: [returnStats],
    fr: [returnStats],
    scoring: [scoringStats],
    ko: [kickoffStats],
    fg: [fieldgoalStats],
    pat: [pointAfterStats],
    punt: [puntStats],
    pr: [returnStats],
    misc: [miscStats],
};
const jsonStructure = {
    $: {
        source: "string",
        version: "string",
        generated: "string",
    },
    gametracker: [{
            $: {
                gameid: "string",
            },
        }],
    venue: [{
            $: {
                gameid: "string",
                visid: "string",
                homeid: "string",
                visname: "string",
                homename: "string",
                date: "string",
                location: "string",
                stadium: "string",
                start: "string",
                end: "string",
                neutralgame: "string",
                nitegame: "string",
                duration: "string",
                attend: "number",
                temp: "number",
                wind: "string",
                weather: "string",
                leaguegame: "string",
                postseason: "string",
                gametype: "string",
                sportcode: "string",
            },
            officials: [{
                    $: {
                        ref: "string",
                        ump: "string",
                        line: "string",
                        lj: "string",
                        bj: "string",
                        fj: "string",
                        sj: "string",
                        cj: "string",
                        alt: "string",
                    },
                }],
            rules: [{
                    $: {
                        qtrs: "number",
                        mins: "number",
                        downs: "number",
                        yds: "number",
                        kospot: "number",
                        tbspot: "number",
                        kotbspot: "number",
                        patspot: "number",
                        safspot: "number",
                        td: "number",
                        fg: "number",
                        pat: "number",
                        patx: "number",
                        saf: "number",
                        defpat: "number",
                        rouge: "number",
                        field: "number",
                        toh: "number",
                        sackrush: "string",
                        fgaplay: "string",
                        netpunttb: "string",
                    },
                }],
        }],
    team: [{
            $: {
                "vh": "string",
                "code": "string",
                "id": "string",
                "name": "string",
                "record": "string",
                "abb": "string",
                "rank": "string",
                "conf-record": "string",
                "conf": "string",
                "confdivision": "string",
            },
            linescore: [{
                    $: {
                        prds: "number",
                        line: "string",
                        score: "number",
                    },
                    lineprd: [{
                            $: {
                                prd: "number",
                                score: "number",
                            },
                        }],
                }],
            totals: [{
                    $: {
                        totoff_plays: "number",
                        totoff_yards: "number",
                        totoff_avg: "number",
                    },
                    firstdowns: [firstDownStats],
                    penalties: [penaltyStats],
                    conversions: [conversionStats],
                    fumbles: [fumbleStats],
                    misc: [miscStats],
                    redzone: [redzoneStats],
                    rush: [rushStats],
                    pass: [passStats],
                    rcv: [receivingStats],
                    punt: [puntStats],
                    ko: [kickoffStats],
                    fg: [fieldgoalStats],
                    pat: [pointAfterStats],
                    defense: [defenseStats],
                    kr: [returnStats],
                    pr: [returnStats],
                    ir: [returnStats],
                    fr: [returnStats],
                    scoring: [scoringStats],
                }],
            player: [playerStats],
        }],
    scores: [{
            score: [{
                    $: {
                        vh: "string",
                        team: "string",
                        qtr: "number",
                        clock: "string",
                        type: "string",
                        yds: "number",
                        scorer: "string",
                        plays: "number",
                        drive: "number",
                        top: "string",
                        vscore: "number",
                        hscore: "number",
                        driveindex: "number",
                        how: "string",
                        passer: "string",
                        patby: "string",
                        pattype: "string",
                        patres: "string",
                    },
                }],
        }],
    fgas: [{
            fga: [{
                    $: {
                        vh: "string",
                        team: "string",
                        kicker: "string",
                        qtr: "number",
                        clock: "string",
                        distance: "number",
                        result: "string",
                    },
                }],
        }],
    drives: [{
            drive: [{
                    $: {
                        vh: "string",
                        team: "string",
                        start: "string",
                        end: "string",
                        plays: "number",
                        yards: "number",
                        top: "string",
                        driveindex: "number",
                        rz: "number",
                        start_how: "string",
                        start_qtr: "number",
                        start_time: "string",
                        start_spot: "string",
                        end_how: "string",
                        end_qtr: "number",
                        end_time: "string",
                        end_spot: "string",
                    },
                }],
        }],
    plays: [{
            $: {
                format: "string",
            },
            qtr: [{
                    $: {
                        number: "number",
                        text: "string",
                    },
                    play: [{
                            $: {
                                context: "string",
                                playid: "string",
                                type: "string",
                                first: "string",
                                turnover: "string",
                                score: "string",
                                hscore: "number",
                                vscore: "number",
                                clock: "string",
                                tokens: "string",
                                text: "string",
                                pcode: "string",
                                hasball: "string",
                                down: "number",
                                togo: "number",
                                spot: "string",
                                newcontext: "string",
                                ob: "string",
                            },
                            p_ko: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        gain: "number",
                                        result: "string",
                                        fc: "string",
                                    },
                                }],
                            p_kr: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        gain: "number",
                                    },
                                }],
                            p_tk: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        assist: "string",
                                        sack: "string",
                                        ff: "string",
                                    },
                                }],
                            p_ru: [{
                                    $: {
                                        vh: "string",
                                        name: "name",
                                        gain: "number",
                                    },
                                }],
                            p_pa: [{
                                    $: {
                                        vh: "string",
                                        qb: "string",
                                        result: "string",
                                        rcv: "string",
                                        gain: "number",
                                    },
                                }],
                            p_bu: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                    },
                                }],
                            p_pu: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        gain: "number",
                                        tb: "string",
                                        in20: "string",
                                        fc: "string",
                                        ob: "string",
                                    },
                                }],
                            p_pn: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        code: "string",
                                        type: "string",
                                        result: "string",
                                        at: "string",
                                        yards: "number",
                                    },
                                }],
                            p_fg: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        distance: "number",
                                        result: "string",
                                        score: "string",
                                    },
                                }],
                            p_qbh: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                    },
                                }],
                            p_fumb: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        at: "string",
                                        frvh: "string",
                                        frname: "string",
                                    },
                                }],
                            p_fr: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        gain: "number",
                                    },
                                }],
                            p_ir: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        at: "string",
                                        gain: "number",
                                    },
                                }],
                            p_pat: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        qb: "string",
                                        type: "string",
                                        result: "string",
                                        score: "string",
                                    },
                                }],
                            p_to: [{
                                    $: {
                                        vh: "string",
                                        team: "string",
                                    },
                                }],
                            p_pr: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        gain: "number",
                                    },
                                }],
                            p_cont: [{
                                    $: {
                                        vh: "string",
                                        name: "string",
                                        context: "string",
                                        at: "string",
                                        gain: "number",
                                    },
                                }],
                        }],
                    score: [{
                            $: {
                                V: "number",
                                H: "number",
                                qtr: "number",
                                final: "number",
                            },
                        }],
                    drivestart: [{
                            $: {
                                poss: "string",
                                vh: "string",
                                spot: "string",
                                clock: "string",
                                driveindex: "string",
                            },
                        }],
                    drivesum: [{
                            $: {
                                plays: "number",
                                yards: "number",
                                top: "string",
                                driveindex: "string",
                                complete: "string",
                            },
                        }],
                    qtrsummary: [{
                            $: {
                                vh: "VH",
                                id: "string",
                            },
                            firstdowns: [firstDownStats],
                            penalties: [penaltyStats],
                            conversions: [conversionStats],
                            fumbles: [fumbleStats],
                            misc: [miscStats],
                            redzone: [redzoneStats],
                            rush: [rushStats],
                            pass: [passStats],
                            rcv: [receivingStats],
                            punt: [puntStats],
                            ko: [kickoffStats],
                            fg: [fieldgoalStats],
                            pat: [pointAfterStats],
                            defense: [defenseStats],
                            kr: [returnStats],
                            pr: [returnStats],
                            ir: [returnStats],
                            fr: [returnStats],
                            scoring: [scoringStats],
                        }],
                    endqtr: [{}],
                    comment: [{
                            $: {
                                text: "string",
                            },
                        }],
                }],
            downtogo: [{
                    $: {
                        context: "string",
                        qtr: "string",
                        clock: "string",
                        vtoh: "number",
                        htoh: "number",
                        hasball: "string",
                        id: "string",
                        down: "number",
                        togo: "number",
                        spot: "string",
                        lastplay: "string",
                    },
                }],
        }],
    message: [{
            $: {
                text: "null,string",
            },
        }],
    dnp: [{
            $: {
                vh: "string",
                id: "string",
            },
            player: [playerStats],
        }],
    longplays: [{
            $: {
                thresh: "number",
            },
            longplay: [{
                    $: {
                        vh: "VH",
                        id: "string",
                        yds: "number",
                        play: "string",
                        players: "string",
                        td: "string",
                    },
                }],
        }],
};
/**
 * Check an input file for unexpected properties that we are not currently handling.
 * All property names that are being handled should be listed above.
 * @param input Statcrew JSON data that will be checked for unexpected property names
 */
function checkInputData(input) {
    return checkInputHelper(input, jsonStructure, "input");
}
exports.checkInputData = checkInputData;
/**
 * Helper function to check a subset of an object for unexpected properties.
 * Logs the output with winstonLogger, which will either forward the logged output to a file
 * (if running in production) or the console (if running as a command-line app via a helper in bin).
 * The app using `checkData` (either in lib or bin) is responsible for setting up this logging.
 * @param input Statcrew JSON, or a subset thereof, to check
 * @param example An object containing a description of what the data is expected to look like
 * @param context The current "location" in the input; used for printing more useful log messages
 */
function checkInputHelper(input, example, context) {
    if (input == null || typeof input === "string") {
        return false;
    }
    let foundUnexpected = false;
    if (_.isArray(input)) {
        for (const entry of input) {
            foundUnexpected = checkInputHelper(entry, example[0], context) || foundUnexpected;
        }
        return foundUnexpected;
    }
    const inputProps = Object.getOwnPropertyNames(input);
    const exampleProps = Object.getOwnPropertyNames(example);
    for (const prop of inputProps) {
        if (exampleProps.indexOf(prop) === -1) {
            winstonLogger_1.winstonLogger.log("info", "unexpected property " + context + "." + prop + " in input");
            foundUnexpected = true;
        }
        else {
            foundUnexpected = checkInputHelper(input[prop], example[prop], context + "." + prop) || foundUnexpected;
        }
    }
    return foundUnexpected;
}
exports.checkInputHelper = checkInputHelper;
//# sourceMappingURL=checkData.js.map