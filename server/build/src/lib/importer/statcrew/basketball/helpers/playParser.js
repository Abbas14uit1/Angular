"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper funtion that parses a play information and constructs a description
 * Used by the PlayClass parse function
 * @param player name as string
 * @param team name as string
 * @param action that was perfromed.
 * @param type type if it exists or else send empty

 */
function constructDescription(player, teamName, action, type) {
    ;
    ;
    let action_description = {
        'SUB': { 'OUT': "$playername is out", 'IN': "$playername substitute in" },
        'TURNOVER': { 'None': "$playername Turnover" },
        'STEAL': { 'None': "$playername Steal" },
        'GOOD': { '3PTR': "$playername made 3 pointer", 'LAYUP': "$playername made Layup", 'FT': "$playername made Free Throw", 'DUNK': "$playername made Dunk", 'JUMPER': "$playername made a Jump", 'TIPIN': "$playername made Tipin" },
        'ASSIST': { 'None': "$playername assisted" },
        'MISS': { '3PTR': "$playername missed 3 point jump", 'JUMPER': "$playername missed jump", 'FT': "$playername missed Free Throw", 'LAYUP': "$playername missed Layup", 'DUNK': "$player missed Dunk", 'TIPIN': "$playername missed Tipin" },
        'REBOUND': { 'OFF': "$playername Offensive Rebound", 'DEF': "$playername Defensive Rebound", 'DEADB': "$team Deadball Team Rebound" },
        'FOUL': { 'None': "Foul on $playername", 'TECH': "$playername foul" },
        'TIMEOUT': { 'MEDIA': "Official Media Timeout", '30SEC': "$team Timeout for 30 sec", 'TEAM': "$team Timeout", '20SEC': "$team Timeout for 30 sec" },
        'BLOCK': { 'None': "$playername Block" },
        'NO': { 'PLAY': "NO PLAY AVAILABLE." }
    };
    type = type == "" ? "None" : type.toUpperCase();
    let [firstname, lastname] = player.split(" ");
    firstname = firstname == undefined ? "" : firstname.toLowerCase();
    lastname = lastname == undefined ? "" : lastname.toLowerCase();
    //winstonLogger.log("info","First Name " + firstname + "test");
    firstname = firstname == "" ? "" : firstname[0].toUpperCase() + firstname.substr(1);
    lastname = lastname == "" ? "" : lastname[0].toUpperCase() + lastname.substr(1);
    const playerName = firstname + " " + lastname;
    // const descriptionTemplate = action_description[action][type].replace("$playername",playerName);
    const descriptionTemplate = action_description[action][type] == undefined ? "" : action_description[action][type].replace("$playername", playerName);
    const description = descriptionTemplate.replace("$team", teamName);
    return description;
}
exports.constructDescription = constructDescription;
//# sourceMappingURL=playParser.js.map