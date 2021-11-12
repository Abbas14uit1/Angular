import { Router } from "express";

import { IAvailableStatDetails } from "../../../../../../typings/server/availablePlayerStats.d";

const availablePlayerStats: Router = Router();

availablePlayerStats.get("/", (req, res, next) => {
  res.status(200).json({
    data: stats,
  });
});

// taken from commonStats.d.ts
export const stats: IAvailableStatDetails[] = [
  {
    key: "receiving",
    name: "Receiving",
    values: [
      { name: "Number", value: "rcvNum" },
      { name: "Yards", value: "rcvYards" },
      { name: "Touchdowns", value: "rcvTd" },
      { name: "Long", value: "rcvLong" },
    ],
  },
  {
    key: "rushing",
    name: "Rushing",
    values: [
      { name: "Attempts", value: "rushAtt" },
      { name: "Yards", value: "rushYards" },
      { name: "Gain", value: "rushGain" },
      { name: "Loss", value: "rushLoss" },
      { name: "Touchdowns", value: "rushTd" },
      { name: "Long", value: "rushLong" },
    ],
  },
  {
    key: "pass",
    name: "Passing",
    values: [
      { name: "Completed", value: "passComp" },
      { name: "Attempts", value: "passAtt" },
      { name: "Interceptions", value: "passInt" },
      { name: "Yards", value: "passYards" },
      { name: "Touchdowns", value: "passTd" },
      { name: "Long", value: "passLong" },
      { name: "Sacks", value: "passSacks" },
      { name: "Sack Yards", value: "passSackYards" },
    ],
  },
  {
    key: "defense",
    name: "Defense",
    values: [
      { name: "Tackles", value: "dTackUa" },
      { name: "Tackle Assists", value: "dTackA" },
      { name: "Tackle Total", value: "dTackTot" },
      { name: "Fumble Loss Unassisted", value: "dTflua" },
      { name: "Fubmle Loss Assisted", value: "dTfla" },
      { name: "Fumble Loss Yards", value: "dTflyds" },
      { name: "Total Sacks", value: "dSacks" },
      { name: "Unassisted Sacks", value: "dSackUa" },
      { name: "Assisted Sacks", value: "dSackA" },
      { name: "Sack Yards", value: "dSackYards" },
      { name: "Breakup", value: "dBrup" },
      { name: "Forced Fumbles", value: "dFf" },
      { name: "Fuble Recoveries", value: "dFr" },
      { name: "Fumble Recovery Yards", value: "dFryds" },
      { name: "Interceptions", value: "dInt" },
      { name: "Interception Yards", value: "dIntYards" },
      { name: "Quarterback Hits", value: "dQbh" },
      { name: "Blocked", value: "dblkd" },
    ],
  },
  {
    key: "kickReceiving",
    name: "Kickoff Returns",
    values: [
      { name: "Number", value: "krNo" },
      { name: "Yards", value: "krYards" },
      { name: "Touchdowns", value: "krTd" },
      { name: "Long", value: "krLong" },
    ],
  },
  {
    key: "fumbles",
    name: "Fumbles",
    values: [
      { name: "Total", value: "fumbTotal" },
      { name: "Lost", value: "fumbLost" },
    ],
  },
  {
    key: "intReturn",
    name: "Interception Returns",
    values: [
      { name: "Number", value: "irNo" },
      { name: "Yards", value: "irYards" },
      { name: "Touchdowns", value: "irTd" },
      { name: "Long", value: "irLong" },
    ],
  },
  {
    key: "scoring",
    name: "Scoring",
    values: [
      { name: "Touchdowns", value: "td" },
      { name: "FieldGoals", value: "fg" },
      { name: "PAT Kicks", value: "patKick" },
    ],
  },
  {
    key: "kickoff",
    name: "Kickoff",
    values: [
      { name: "Number", value: "koNum" },
      { name: "Yards", value: "koYards" },
      { name: "Out of Bounds", value: "koOb" },
      { name: "Touchback", value: "koTb" },
    ],
  },
  {
    key: "fieldgoal",
    name: "Field Goal",
    values: [
      { name: "Made", value: "fgMade" },
      { name: "Attempted", value: "fgAtt" },
      { name: "Long", value: "fgLong" },
      { name: "Blocked", value: "fgBlocked" },
    ],
  },
  {
    key: "pointAfter",
    name: "PATs",
    values: [
      { name: "Kick Attempts", value: "kickatt" },
      { name: "Kicks Made", value: "kickmade" },
      { name: "Pass Attempts", value: "passatt" },
      { name: "Pass Made", value: "passmade" },
      { name: "Rush Attempts", value: "rushatt" },
      { name: "Rush Made", value: "rushmade" },
    ],
  },
  {
    key: "punt",
    name: "Punting",
    values: [
      { name: "Number", value: "puntNum" },
      { name: "Yards", value: "puntYards" },
      { name: "Long", value: "puntLong" },
      { name: "Blocked", value: "puntBlocked" },
      { name: "Touchback", value: "puntTb" },
      { name: "Fair Catches", value: "puntFc" },
      { name: "Over 50 Yards", value: "puntPlus50" },
      { name: "Under 20 Yards", value: "puntInside20" },
    ],
  },
  {
    key: "puntReturn",
    name: "Punt Returns",
    values: [
      { name: "Number", value: "prNo" },
      { name: "Yards", value: "prYards" },
      { name: "Touchdowns", value: "prTd" },
      { name: "Long", value: "prLong" },
    ],
  },
  {
    key: "misc",
    name: "Misc.",
    values: [
      { name: "Yards", value: "yards" },
      { name: "Time of Possession", value: "top" },
      { name: "On Side Attempts", value: "ona" },
      { name: "On Side Made", value: "onm" },
      { name: "Points from Turnovers", value: "ptsto" },
    ],
  },
];

export { availablePlayerStats };
