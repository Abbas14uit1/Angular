import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { QueryService } from "app/sport/query/query.service";
import { getGameTypeData } from "../../../shared/helpers/game-type-filter";
// import * as conferenceData from "app/sport/query/conference-json/football-conference.json";
import { IAvailableStatDetails } from "../../../../../../typings/server/availablePlayerStats.d";
import { GoogleAnalyticsEventsService } from "../../../services/google-analytics-events-service";

@Component({
  selector: "app-filter-menu-football",
  templateUrl: "./filter-menu-football.component.html",
  styleUrls: ["./filter-menu-football.component.css"],
  providers: [QueryService],
})
export class FilterMenuFootballComponent implements OnInit {
  @Input() public sportId: any;
  @Input() public selectedSplit: any;
  public entities = [
    { value: "player", viewValue: "Player", checked: true },
    { value: "team", viewValue: "Team", checked: false },
  ];
  public team2 = [{ code: 8, name: "Alabama" }, { code: 697, name: "Texas A&M" }, { code: 193, name: "Duke" }];

  public team2All = [{ code: 0, name: "All" }];
  // tslint:disable-next-line:max-line-length
  public conferences = [{
    key: "All",
    divisions: [
      "All",
    ],
  },
  {
    key: "American Athletic Conference",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Atlantic Coast Conference",
    divisions: [
      "All", "Atlantic", "Coastal",
    ],
  }, {
    key: "Big 12 Conference",
    divisions: [],
  }, {
    key: "Big Ten Conference",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Conference USA",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Division 1 FBS Independents",
    divisions: [],
  }, {
    key: "Mid-American Conference",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Mountain West Conference",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Pac-12 Conference",
    divisions: [
      "All", "North", "South",
    ],
  }, {
    key: "Sun Belt Conference",
    divisions: [
      "All", "East", "West",
    ],
  }, {
    key: "Southeastern Conference",
    divisions: [
      "All", "East", "West",
    ],
  }];
  public teamDivisions: string[] = [];
  public opponentDivisions: string[] = [];
  public location = ["All", "Home", "Away", "Neutral"];
  public gameTypes: any = [];
  public selectedlocation: string = "All";
  public selectedgameType: string = "All";
  public selectedScheduleGame: string = "All";
  public selectedDayGame: boolean = true;
  public selectedNightGame: boolean = true;
  public operators = [
    { name: ">", value: "gt" },
    { name: "=", value: "eq" },
    { name: "<", value: "lt" },
    { name: ">=", value: "gte" },
    { name: "<=", value: "lte" },
  ];
  public playerStats: IAvailableStatDetails[] = [
    {
      key: "pass",
      name: "Passing",
      values: [
        { name: "Completed", value: "passComp" },
        { name: "Attempts", value: "passAtt" },
        { name: "Yards", value: "passYards" },
        { name: "Touchdowns", value: "passTd" },
        { name: "Interceptions", value: "passInt" },
        { name: "Long", value: "passLong", result: "Max" },
        { name: "Sacks", value: "passSacks" },
        { name: "Sack Yards", value: "passSackYards" },
        {
          name: "Completion Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.pass.passAtt", 0] }, 0, { "$divide": ["$games.stats.pass.passComp", "$games.stats.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Comp(s)": "$games.stats.pass.passComp", "Pass Att(s)": "$games.stats.pass.passAtt" }),
        },
        {
          name: "Avg. Yards per Attempt",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.pass.passAtt", 0] }, 0, { "$divide": ["$games.stats.pass.passYards", "$games.stats.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$games.stats.pass.passYards", "Pass Att(s)": "$games.stats.pass.passAtt" }),
        },
        {
          name: "Avg. Yards per Completion",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.pass.passComp", 0] }, 0, { "$divide": ["$games.stats.pass.passYards", "$games.stats.pass.passComp"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$games.stats.pass.passYards", "Pass Comp(s)": "$games.stats.pass.passComp" }),
        },
        {
          name: "Interception Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.pass.passAtt", 0] }, 0, { "$divide": ["$games.stats.pass.passInt", "$games.stats.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Int(s)": "$games.stats.pass.passInt", "Pass Att(s)": "$games.stats.pass.passAtt" }),
        },
      ],
    },
    {
      key: "rushing",
      name: "Rushing",
      values: [
        { name: "Attempts", value: "rushAtt" },
        { name: "Yards", value: "rushYards" },
        { name: "Touchdowns", value: "rushTd" },
        { name: "Gain", value: "rushGain" },
        { name: "Loss", value: "rushLoss" },
        { name: "Longest Rushes", value: "rushLong", result: "Max" },
        {
          name: "Avg. Yards per Carry",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.rushing.rushAtt", 0] }, 0, { "$divide": ["$games.stats.rushing.rushYards", "$games.stats.rushing.rushAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rush Yards": "$games.stats.rushing.rushYards", "Rush Att(s)": "$games.stats.rushing.rushAtt" }),
        },
      ],
    },
    {
      key: "receiving",
      name: "Receiving",
      values: [
        { name: "Receptions", value: "rcvNum" },
        { name: "Yards", value: "rcvYards" },
        { name: "Touchdowns", value: "rcvTd" },
        { name: "Longest Receptions", value: "rcvLong", result: "Max" },
        {
          name: "Avg. Yards per Reception",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.receiving.rcvNum", 0] }, 0, { "$divide": ["$games.stats.receiving.rcvYards", "$games.stats.receiving.rcvNum"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rcv Yards": "$games.stats.receiving.rcvYards", "Rcv Num": "$games.stats.receiving.rcvNum" }),
        },
      ],
    },
    {
      key: "scoring",
      name: "Scoring",
      values: [
        { name: "Touchdowns", value: "td" },
        { name: "Field Goals", value: "fg" },
        { name: "PAT Kicks", value: "patKick" },
        {
          // tslint:disable-next-line:max-line-length
          name: "Total Touchdowns", result: "Total", value: JSON.stringify({ "$sum": ["$games.stats.rushing.rushTd", "$games.stats.receiving.rcvTd", "$games.stats.intReturn.frTd", "$games.stats.intReturn.irTd", "$games.stats.kickReceiving.krTd", "$games.stats.puntReturn.prTd"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rush TD(s)": "$games.stats.rushing.rushTd", "Rcv TD(s)": "$games.stats.receiving.rcvTd", "FB TD(s)": "$games.stats.fumbles.frTd", "Int TD(s)": "$games.stats.intReturn.irTd", "KR TD(s)": "$games.stats.kickReceiving.krTd", "PR TD(s)": "$games.stats.puntReturn.prTd" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Touchdowns Responsible For", result: "Total", value: JSON.stringify({ "$sum": ["$games.stats.pass.passTd", "$games.stats.rushing.rushTd", "$games.stats.receiving.rcvTd", "$games.stats.intReturn.frTd", "$games.stats.intReturn.irTd", "$games.stats.kickReceiving.krTd", "$games.stats.puntReturn.prTd"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass TD(s)": "$games.stats.pass.passTd", "Rush TD(s)": "$games.stats.rushing.rushTd", "Rcv TD(s)": "$games.stats.receiving.rcvTd", "FB TD(s)": "$games.stats.fumbles.frTd", "Int TD(s)": "$games.stats.intReturn.irTd", "KR": "$games.stats.kickReceiving.krTd", "PR": "$games.stats.puntReturn.prTd" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Points Responsible For", result: "Total", value: JSON.stringify({ "$sum": [{ "$multiply": ["$games.stats.scoring.td", 6] }, { "$multiply": ["$games.stats.scoring.fg", 3] }, { "$multiply": ["$games.stats.scoring.patKick", 1] }, { "$multiply": ["$games.stats.pointAfter.rushmade", 2] }, { "$multiply": ["$games.stats.pointAfter.passmade", 2] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Touch Downs": "$games.stats.scoring.td", "FG": "$games.stats.scoring.fg", "PAT Kick(s)": "$games.stats.scoring.patKick" }),
        },
      ],
    },
    {
      key: "defense",
      name: "Defense",
      values: [
        { name: "Tackles(Unassisted)", value: "dTackUa" },
        { name: "Tackles(Assists)", value: "dTackA" },
        { name: "Tackle(Total)", value: "dTackTot" },
        { name: "Interceptions", value: "dInt" },
        { name: "Int. Return Yards", value: "dIntYards" },
        { name: "Passes Broken Up", value: "dBrup" },
        { name: "Sacks(Unassisted)", value: "dSackUa" },
        { name: "Sacks(Assisted)", value: "dSackA" },
        { name: "Sacks(Total)", result: "Total", projections: JSON.stringify({ "UN-AST": "$games.stats.defense.dSackUa", "AST": "$games.stats.defense.dSackA" }), value: JSON.stringify({ $add: ["$games.stats.defense.dSackUa", { $multiply: [0.5, "$games.stats.defense.dSackA"] }] }) },
        { name: "Sack Yards", value: "dSackYards" },
        { name: "Quarterback Hurries", value: "dQbh" },
        { name: "Forced Fumbles", value: "dFf" },
        { name: "Fumble Recoveries", value: "dFr" },
        { name: "Fumble Returns", value: "dFryds" },
        { name: "Kicks Blocked", value: "dblkd" },
        { name: "Tackles for Loss (Assisted)", value: "dTfla" },
        { name: "Tackles for Loss (Unassisted)", value: "dTflua" },
        { name: "Tackles for Loss (Total)", result: "Total", projections: JSON.stringify({ "UN-AST": "$games.stats.defense.dTflua", "AST": "$games.stats.defense.dTfla" }), value: JSON.stringify({ $add: ["$games.stats.defense.dTflua", { $multiply: [0.5, "$games.stats.defense.dTfla"] }] }) },
        { name: "Tackles for Loss (Yards)", value: "dTflyds" },
        { name: "Safety", value: "dSaf" },
        {
          // tslint:disable-next-line:max-line-length
          name: "Takeaways",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$games.stats.defense.dInt", "$games.stats.defense.dFr"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Defence Interceptions": "$games.stats.defense.dInt", " Defence Fumbles": "$games.stats.defense.dFr" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Defensive Touchdowns",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$games.stats.intReturn.frTd", "$games.stats.intReturn.irTd"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "FB TD(s)": "$games.stats.intReturn.frTd", "Interception TD(s)": "$games.stats.intReturn.irTd" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Defensive Points",
          result: "Total",
          value: JSON.stringify({ "$sum": [{ "$multiply": ["$games.stats.intReturn.frTd", 6] }, { "$multiply": ["$games.stats.intReturn.irTd", 6] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Fumbles TD(s)": "$games.stats.intReturn.frTd", "Interception TD(s)": "$games.stats.intReturn.irTd" }),
        },
      ],
    },
    {
      key: "fieldgoal",
      name: "Field Goals",
      values: [
        { name: "Made", value: "fgMade" },
        { name: "Attempted", value: "fgAtt" },
        { name: "Long", value: "fgLong", result: "Max" },
        { name: "Blocked", value: "fgBlocked" },
        {
          name: "FG Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.fieldgoal.fgAtt", 0] }, 0, { "$divide": ["$games.stats.fieldgoal.fgMade", "$games.stats.fieldgoal.fgAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "FG Made": "$games.stats.fieldgoal.fgMade", "FG Att(s)": "$games.stats.fieldgoal.fgAtt" }),
        },
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
      key: "kickReceiving",
      name: "Kickoff Returns",
      values: [
        { name: "Total", value: "krNo" },
        { name: "Yards", value: "krYards" },
        { name: "Touchdowns", value: "krTd" },
        { name: "Long", value: "krLong", result: "Max" },
        {
          name: "Avg. Yards per Kickoff Return",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.kickReceiving.krNo", 0] }, 0, { "$divide": ["$games.stats.kickReceiving.krYards", "$games.stats.kickReceiving.krNo"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "KR Yards": "$games.stats.kickReceiving.krYards", "KR Number": "$games.stats.kickReceiving.krNo" }),
        },
      ],
    },
    {
      key: "puntReturn",
      name: "Punt Returns",
      values: [
        { name: "Total", value: "prNo" },
        { name: "Yards", value: "prYards" },
        { name: "Touchdowns", value: "prTd" },
        { name: "Long", value: "prLong", result: "Max" },
        {
          name: "Avg. Yards per Punt Return",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.puntReturn.prNo", 0] }, 0, { "$divide": ["$games.stats.puntReturn.prYards", "$games.stats.puntReturn.prNo"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "PR Yards": "$games.stats.puntReturn.prYards", "PR Number": "$games.stats.puntReturn.prNo" }),
        },
      ],
    },
    {
      key: "kickoff",
      name: "Kickoffs",
      values: [
        { name: "Total", value: "koNum" },
        { name: "Yards", value: "koYards" },
        { name: "Touchbacks", value: "koTb" },
        { name: "Out of Bounds", value: "koOb" },
      ],
    },
    {
      key: "punt",
      name: "Punting",
      values: [
        { name: "Total", value: "puntNum" },
        { name: "Yards", value: "puntYards" },
        { name: "Over 50 Yards", value: "puntPlus50" },
        { name: "Inside 20", value: "puntInside20" },
        { name: "Long", value: "puntLong", result: "Max" },
        { name: "Touchbacks", value: "puntTb" },
        { name: "Fair Catches", value: "puntFc" },
        { name: "Blocks", value: "puntBlocked" },
        {
          name: "Avg. Yards per Punt",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.punt.puntNum", 0] }, 0, { "$divide": ["$games.stats.punt.puntYards", "$games.stats.punt.puntNum"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "PT Yards": "$games.stats.punt.puntYards", "PT Number": "$games.stats.punt.puntNum" }),
        },
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
      key: "offense",
      name: "Total offense",
      values: [
        {
          // tslint:disable-next-line:max-line-length
          name: "Total Offensive Yards",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$games.stats.pass.passYards", "$games.stats.rushing.rushYards"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$games.stats.pass.passYards", "Rush Yards": "$games.stats.rushing.rushYards" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "All-Purpose Yards",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$games.stats.rushing.rushYards", "$games.stats.receiving.rcvYards", "$games.stats.kickReceiving.krYards", "$games.stats.puntReturn.prYards", "$games.stats.intReturn.irYards", "$games.stats.defense.dFryds"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            "KR Yds": "$games.stats.kickReceiving.krYards", "PR Yds": "$games.stats.puntReturn.prYards", "Rush Yds": "$games.stats.rushing.rushYards", "Rcv Yds": "$games.stats.receiving.rcvYards", "IR Yds": "$games.stats.intReturn.irYards", "FB Yds": "$games.stats.defense.dFryds"
          }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Turnovers",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$games.stats.pass.passInt", "$games.stats.fumbles.fumbLost"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "FB Lost": "$games.stats.fumbles.fumbLost", "Pass Int(s)": "$games.stats.pass.passInt" }),
        },
      ],
    },
    {
      key: "intReturn",
      name: "Interception returns",
      values: [
        { name: "Number", value: "irNo" },
        { name: "Yards", value: "irYards" },
        { name: "TDs", value: "irTd" },
        { name: "Long", value: "irLong", result: "Max" }
      ],
    },
    {
      key: "drive",
      name: "Drive",
      values: [
        { name: "Yards", value: "" },
        { name: "Number  of Plays", value: "numPlaysInDrive" },
        { name: "Time of Possession", value: "timeOfPossession" },
        { name: "Result TD", value: "driveEndPlayType" },
        { name: "Result FG", value: "driveEndPlayType" },
        { name: "Result Punt", value: "driveEndPlayType" },
        { name: "Result INT", value: "driveEndPlayType" },
        { name: "Result Fumble", value: "driveEndPlayType" },
        { name: "Result TO on Downs", value: "driveEndPlayType" },
      ],
    }

  ];
  public teamStats: IAvailableStatDetails[] = [
    {
      key: "pass",
      name: "Passing",
      values: [
        { name: "Completed", value: "passComp" },
        { name: "Attempts", value: "passAtt" },
        { name: "Yards", value: "passYards" },
        { name: "Touchdowns", value: "passTd" },
        { name: "Interceptions", value: "passInt" },
        { name: "Long", value: "passLong", result: "Max" },
        { name: "Sacks", value: "passSacks" },
        { name: "Sack Yards", value: "passSackYards" },
        {
          name: "Completion Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.pass.passAtt", 0] }, 0, { "$divide": ["$totals.pass.passComp", "$totals.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Comp(s)": "$totals.pass.passComp", "Pass Att(s)": "$totals.pass.passAtt" }),
        },
        {
          name: "Avg. Yards per Attempt",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.pass.passAtt", 0] }, 0, { "$divide": ["$totals.pass.passYards", "$totals.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$totals.pass.passYards", "Pass Att(s)": "$totals.pass.passAtt" }),
        },
        {
          name: "Avg. Yards per Completion",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.pass.passComp", 0] }, 0, { "$divide": ["$totals.pass.passYards", "$totals.pass.passComp"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$totals.pass.passYards", "Pass Comp(s)": "$totals.pass.passComp" }),
        },
        {
          name: "Interception Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.pass.passAtt", 0] }, 0, { "$divide": ["$totals.pass.passInt", "$totals.pass.passAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Int(s)": "$totals.pass.passInt", "Pass Att(s)": "$totals.pass.passAtt" }),
        },
      ],
    },
    {
      key: "rushing",
      name: "Rushing",
      values: [
        { name: "Attempts", value: "rushAtt" },
        { name: "Yards", value: "rushYards" },
        { name: "Touchdowns", value: "rushTd" },
        { name: "Gain", value: "rushGain" },
        { name: "Loss", value: "rushLoss" },
        { name: "Longest Rushes", value: "rushLong", result: "Max" },
        {
          name: "Avg. Yards per Carry",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.rushing.rushAtt", 0] }, 0, { "$divide": ["$totals.rushing.rushYards", "$totals.rushing.rushAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rush Yards": "$totals.rushing.rushYards", "Rush Att(s)": "$totals.rushing.rushAtt" }),
        },
      ],
    },
    {
      key: "receiving",
      name: "Receiving",
      values: [
        { name: "Receptions", value: "rcvNum" },
        { name: "Yards", value: "rcvYards" },
        { name: "Touchdowns", value: "rcvTd" },
        { name: "Longest Receptions", value: "rcvLong", result: "Max" },
        {
          name: "Avg. Yards per Reception",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.receiving.rcvNum", 0] }, 0, { "$divide": ["$totals.receiving.rcvYards", "$totals.receiving.rcvNum"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rcv Yards": "$totals.receiving.rcvYards", "Rcv Num": "$totals.receiving.rcvNum" }),
        },
      ],
    },
    {
      key: "scoring",
      name: "Scoring",
      values: [
        { name: "Touchdowns", value: "td" },
        { name: "Field Goals", value: "fg" },
        { name: "PAT Kicks", value: "patKick" },
        {
          // tslint:disable-next-line:max-line-length
          name: "Total Touchdowns",
          result: "Total",
          value: JSON.stringify({ "$sum": ["$totals.rushing.rushTd", "$totals.receiving.rcvTd", "$totals.intReturn.frTd", "$totals.intReturn.irTd", "$totals.kickReceiving.krTd", "$totals.puntReturn.prTd"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Rush TD(s)": "$totals.rushing.rushTd", "Rcv TD(s)": "$totals.receiving.rcvTd", "FB TD(s)": "$totals.fumbles.frTd", "Int TD(s)": "$totals.intReturn.irTd", "KR TD(s)": "$totals.kickReceiving.krTd", "PR TD(s)": "$totals.puntReturn.prTd" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Points", result: "Total", value: JSON.stringify({ "$sum": [{ "$multiply": ["$totals.scoring.td", 6] }, { "$multiply": ["$totals.scoring.fg", 3] }, { "$multiply": ["$totals.scoring.patKick", 1] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Touch Downs": "$totals.scoring.td", "FG": "$totals.scoring.fg", "PAT Kicks": "$totals.scoring.patKick" }),
        },
      ],
    },
    {
      key: "defense",
      name: "Defense",
      values: [
        { name: "Tackles(Unassisted)", value: "dTackUa" },
        { name: "Tackles(Assists)", value: "dTackA" },
        { name: "Tackle(Total)", value: "dTackTot" },
        { name: "Interceptions", value: "dInt" },
        { name: "Int. Return Yards", value: "dIntYards" },
        { name: "Passes Broken Up", value: "dBrup" },
        { name: "Sacks(Unassisted)", value: "dSackUa" },
        { name: "Sacks(Assisted)", value: "dSackA" },
        { name: "Sacks(Total)", value: "dSacks" },
        { name: "Sack Yards", value: "dSackYards" },
        { name: "Quarterback Hurries", value: "dQbh" },
        { name: "Forced Fumbles", value: "dFf" },
        { name: "Fumble Recoveries", value: "dFr" },
        { name: "Fumble Returns", value: "dFryds" },
        { name: "Kicks Blocked", value: "dblkd" },
        { name: "Tackles for Loss (Assisted)", value: "dTfla" },
        { name: "Tackles for Loss (Unassisted)", value: "dTflua" },
        { name: "Tackles for Loss (Total)", result: "Total", projections: JSON.stringify({ "UN-AST": "$totals.defense.dTflua", "AST": "$totals.defense.dTfla" }), value: JSON.stringify({ $add: ["$totals.defense.dTflua", { $multiply: [0.5, "$totals.defense.dTfla"] }] }) },
        { name: "Tackles for Loss (Yards)", value: "dTflyds" },
        { name: "Safety", value: "dSaf" },
        {
          // tslint:disable-next-line:max-line-length
          name: "Takeaways", result: "Total", value: JSON.stringify({ "$sum": ["$totals.defense.dInt", "$totals.defense.dFr"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Defence Interceptions": "$totals.defense.dInt", " Defence Fumble": "$totals.defense.dFr" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Defensive Touchdowns", result: "Total", value: JSON.stringify({ "$sum": ["$totals.intReturn.frTd", "$totals.intReturn.irTd"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Fumbles TD(s)": "$totals.intReturn.frTd", "Interception TD(s)": "$totals.intReturn.irTd" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Defensive Points", result: "Total", value: JSON.stringify({ "$sum": [{ "$multiply": ["$totals.intReturn.frTd", 6] }, { "$multiply": ["$totals.intReturn.irTd", 6] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Fumbles TD(s)": "$totals.intReturn.frTd", "Interception TD(s)": "$totals.intReturn.irTd" }),
        },
      ],
    },
    {
      key: "fieldgoal",
      name: "Field Goals",
      values: [
        { name: "Made", value: "fgMade" },
        { name: "Attempted", value: "fgAtt" },
        { name: "Long", value: "fgLong", result: "Max" },
        { name: "Blocked", value: "fgBlocked" },
        {
          name: "FG Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.fieldgoal.fgAtt", 0] }, 0, { "$divide": ["$totals.fieldgoal.fgMade", "$totals.fieldgoal.fgAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "FG Made": "$totals.fieldgoal.fgMade", "FG Att(s)": "$totals.fieldgoal.fgAtt" }),
        },
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
      key: "kickReceiving",
      name: "Kickoff Returns",
      values: [
        { name: "Total", value: "krNo" },
        { name: "Yards", value: "krYards" },
        { name: "Touchdowns", value: "krTd" },
        { name: "Long", value: "krLong", result: "Max" },
        {
          name: "Avg. Yards per Kickoff Return",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.kickReceiving.krNo", 0] }, 0, { "$divide": ["$totals.kickReceiving.krYards", "$totals.kickReceiving.krNo"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "KR Yards": "$totals.kickReceiving.krYards", "KR Number": "$totals.kickReceiving.krNo" }),
        },
      ],
    },
    {
      key: "puntReturn",
      name: "Punt Returns",
      values: [
        { name: "Total", value: "prNo" },
        { name: "Yards", value: "prYards" },
        { name: "Touchdowns", value: "prTd" },
        { name: "Long", value: "prLong", result: "Max" },
        {
          name: "Avg. Yards per Punt Return",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.puntReturn.prNo", 0] }, 0, { "$divide": ["$totals.puntReturn.prYards", "$totals.puntReturn.prNo"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "PR Yards": "$totals.puntReturn.prYards", "PR Number": "$totals.puntReturn.prNo" }),
        },
      ],
    },
    {
      key: "kickoff",
      name: "Kickoffs",
      values: [
        { name: "Total", value: "koNum" },
        { name: "Yards", value: "koYards" },
        { name: "Touchbacks", value: "koTb" },
        { name: "Out of Bounds", value: "koOb" },
      ],
    },
    {
      key: "punt",
      name: "Punting",
      values: [
        { name: "Total", value: "puntNum" },
        { name: "Yards", value: "puntYards" },
        { name: "Over 50 Yards", value: "puntPlus50" },
        { name: "Inside 20", value: "puntInside20" },
        { name: "Long", value: "puntLong", result: "Max" },
        { name: "Touchbacks", value: "puntTb" },
        { name: "Fair Catches", value: "puntFc" },
        { name: "Blocks", value: "puntBlocked" },
        {
          name: "Avg. Yards per Punt",
          result: "Average",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.punt.puntNum", 0] }, 0, { "$divide": ["$totals.punt.puntYards", "$totals.punt.puntNum"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "PT Yards": "$totals.punt.puntYards", "PT Number": "$totals.punt.puntNum" }),
        },
      ],
    },
    {
      key: "firstdowns",
      name: "First Downs",
      values: [
        { name: "Total", value: "fdTotal" },
        { name: "Rush", value: "fdRush" },
        { name: "Pass", value: "fdPass" },
        { name: "Penalty", value: "fdPenalty" },
      ],
    },
    {
      key: "conversions",
      name: "Conversion",
      values: [
        { name: "Third Down Att", value: "convThirdAtt" },
        { name: "Third Down Conversions", value: "convThird" },
        {
          name: "Third Down Conversion Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.conversions.convThirdAtt", 0] }, 0, { "$divide": ["$totals.conversions.convThird", "$totals.conversions.convThirdAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "3RD Down Conversions": "$totals.conversions.convThird", "3RD Down Conversion Att(s)": "$totals.conversions.convThirdAtt" }),
        },
        { name: "Fourth Down Attempts", value: "convFourthAtt" },
        { name: "Fourth Down Conversions", value: "convFourth" },
        {
          name: "Fourth Down Conversion Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.conversions.convFourthAtt", 0] }, 0, { "$divide": ["$totals.conversions.convFourth", "$totals.conversions.convFourthAtt"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "4TH Down Conversions": "$totals.conversions.convFourth", "4TH Down Conversion Att(s)": "$totals.conversions.convFourthAtt" }),
        },
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
      key: "penalties",
      name: "Penalties",
      values: [
        { name: "Total", value: "penTotal" },
        { name: "Yards", value: "penYards" },
      ],
    },
    {
      key: "redzone",
      name: "Red Zone",
      values: [
        { name: "Attempts", value: "redAtt" },
        { name: "Scores", value: "redScores" },
        { name: "Points", value: "redPoints" },
        { name: "Rush TDs", value: "redTdRush" },
        { name: "Pass TDs", value: "redTdPass" },
        { name: "FG Made", value: "redEndFgMade" },
        { name: "FG Attempted", value: "redEndFga" },
        { name: "Ended in Downs", value: "redEndDown" },
        { name: "Ended in Interception", value: "redEndInt" },
        { name: "Ended in Fumble", value: "redEndFumb" },
        { name: "Ended by Half", value: "redEndHalf" },
        { name: "Ended by Game", value: "redEndGame" },
      ],
    },
    {
      key: "offense",
      name: "Total offense",
      values: [
        {
          // tslint:disable-next-line:max-line-length
          name: "Total Offensive Yards", result: "Total", value: JSON.stringify({ "$sum": ["$totals.pass.passYards", "$totals.rushing.rushYards"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Pass Yards": "$totals.pass.passYards", "Rush Yards": "$totals.rushing.rushYards" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "All-Purpose Yards", result: "Total", value: JSON.stringify({ "$sum": ["$totals.rushing.rushYards", "$totals.receiving.rcvYards", "$totals.kickReceiving.krYards", "$totals.puntReturn.prYards", "$totals.intReturn.irYards", "$totals.defense.dFryds"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "KR Yds": "$totals.kickReceiving.krYards", "PR Yds": "$totals.puntReturn.prYards", "Rush Yds": "$totals.rushing.rushYards", "Rcv Yds": "$totals.receiving.rcvYards", "IR Yds": "$totals.intReturn.irYards", "FB Yds": "$totals.defense.dFryds" }),
        },
        {
          // tslint:disable-next-line:max-line-length
          name: "Turnovers", result: "Total", value: JSON.stringify({ "$sum": ["$totals.pass.passInt", "$totals.fumbles.fumbLost"] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "Fumbles Lost": "$totals.fumbles.fumbLost", "Pass Int(s)": "$totals.pass.passInt" }),
        },
      ],
    },
    {
      key: "misc",
      name: "Misc",
      values: [
        { name: "Yards", value: "yards" },
        { name: "Time of Possession", value: "top" },
        { name: "On-side Attempts", value: "ona" },
        { name: "On-side made", value: "onm" },
        { name: "Points from Turnovers", value: "ptsto" },
        {
          name: "Onside Kick Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.misc.ona", 0] }, 0, { "$divide": ["$totals.misc.onm", "$totals.misc.ona"] }] }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ "On-side Made": "$totals.misc.onm", "On-side Att(s)": "$totals.misc.ona" }),
        },
      ],
    },
    {
      key: "intReturn",
      name: "Interception returns",
      values: [
        { name: "Number", value: "irNo" },
        { name: "Yards", value: "irYards" },
        { name: "TDs", value: "irTd" },
        { name: "Long", value: "irLong", result: "Max" }
      ],
    },
    {
      key: "drive",
      name: "Drive",
      values: [
        { name: "Yards", value: "" },
        { name: "Number  of Plays", value: "numPlaysInDrive" },
        { name: "Time of Possession", value: "timeOfPossession" },
        { name: "Result TD", value: "driveEndPlayType" },
        { name: "Result FG", value: "driveEndPlayType" },
        { name: "Result Punt", value: "driveEndPlayType" },
        { name: "Result INT", value: "driveEndPlayType" },
        { name: "Result Fumble", value: "driveEndPlayType" },
        { name: "Result TO on Downs", value: "driveEndPlayType" },
      ],
    }
  ];
  public selectedTeamConference: string = this.conferences[0].key;
  public selectedOpponentConference: string = this.conferences[0].key;
  public selectedTeamDivision: string = "";
  public selectedOpponentDivision: string = "";
  public stats = this.playerStats;
  public conferenceTeamDict: { [selectedTeamConference: string]: number } = {};
  public conferenceOppDict: { [selectedOpponentConference: string]: number } = {};
  public entity: string = localStorage.getItem("entity") || "";
  public category: string = this.stats[0].key;
  public categoryDict: { [category: string]: number } = {};
  public statistic: string = "";
  public projections: string = "";
  public resultColumn: string = "Total";
  public opponent: number = 0;
  public team: number = 0;
  public selectedTeamText: any = "All";
  public selectedOppText: any = "All";
  public selectedTeamId: any = "All";
  public operator: string = this.operators[0].value;
  public teams: any[] = [];
  public availableTeams: any[] = [];
  public value: number = 0;

  @Output() public results = new EventEmitter<any>();
  @Output() public spinner = new EventEmitter<boolean>();
  @Output() public splitValue = new EventEmitter<any>();
  @Output() public selectedTeamChange = new EventEmitter<any>();
  @Output() public resultsMessage = new EventEmitter<any>();

  constructor(private queryService: QueryService, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) { }

  public ngOnInit() {
    this.gameTypes = getGameTypeData(this.sportId);
    let i = 0;
    this.stats.forEach((element) => {
      this.categoryDict[element.key] = i;
      i++;
    });
    let j = 0;
    this.conferences.forEach((element) => {
      this.conferenceTeamDict[element.key] = j;
      this.conferenceOppDict[element.key] = j;
      j++;
    });
    this.team = Number(localStorage.getItem("selectedTeam"));
    this.selectedTeamId = localStorage.getItem("selectedTeamId");
    this.selectedTeamText = localStorage.getItem("teamText");
    this.queryService.getAllTeams()
      .subscribe((teams: any) => {
        this.teams = teams.filter((item: any) => {
          return item.code !== this.team;
        });
        this.teams.unshift({ code: 1, name: "Conference", _id: this.selectedTeamId });
        this.teams.unshift({ code: this.team, name: this.selectedTeamText, _id: this.selectedTeamId });
        this.teams.unshift({ code: 0, name: "All", _id: this.selectedTeamId });
        this.availableTeams = this.teams;
      });
    if (this.conferences[this.conferenceTeamDict[this.selectedTeamConference]].divisions[0]) {
      this.selectedTeamDivision = this.conferences[this.conferenceTeamDict[this.selectedTeamConference]].divisions[0];
    }
    if (this.conferences[this.conferenceOppDict[this.selectedOpponentConference]].divisions[0]) {
      // tslint:disable-next-line:max-line-length
      this.selectedOpponentDivision = this.conferences[this.conferenceOppDict[this.selectedOpponentConference]].divisions[0];
    }
    this.statistic = this.stats[this.categoryDict[this.category]].values[0].value;
    if (this.entity === 'Player Statistics') {
      this.onEntityChange("player");
    } else {
      this.onEntityChange("team");
    }
    this.splitValue.emit(this.entity);
  }

  public onChange(newValue: any) {
    let i = 0;
    this.categoryDict = {};
    this.stats.forEach((element) => {
      this.categoryDict[element.key] = i;
      i++;
    });
    this.statistic = this.stats[this.categoryDict[this.category]].values[0].value;
    this.projections = this.stats[this.categoryDict[this.category]].values[0].projections;
    this.resultColumn = this.stats[this.categoryDict[this.category]].values[0].result;
  }
  public onEntityChange(newValue: any) {
    if (this.entity === "Player Statistics") {
      this.stats = this.playerStats;
      this.category = this.stats[0].key;
    } else if (this.entity === "Team Statistics") {
      this.stats = this.teamStats;
      this.category = this.stats[0].key;
    }
    let i = 0;
    this.categoryDict = {};
    this.stats.forEach((element) => {
      this.categoryDict[element.key] = i;
      i++;
    });
    this.statistic = this.stats[this.categoryDict[this.category]].values[0].value;
    this.projections = this.stats[this.categoryDict[this.category]].values[0].projections;
    this.resultColumn = this.stats[this.categoryDict[this.category]].values[0].result;

    this.splitValue.emit(newValue);

  }

  public onStatsChange(newValue: any, stat: any) {
    let i = 0;
    this.categoryDict = {};
    this.stats.forEach((element) => {
      this.categoryDict[element.key] = i;
      i++;
    });
    const projections = "projections";
    const resultCol = "result";
    // tslint:disable-next-line:max-line-length
    const selectedObject = this.stats[this.categoryDict[this.category]].values.find((x) => x.name === stat.selected.viewValue);
    this.projections = selectedObject[projections];
    this.resultColumn = selectedObject[resultCol];

  }
  public onTeamChange(newValue: any) {
    this.selectedTeamText = newValue.source.selected.viewValue;
    this.team = newValue.value;
    this.selectedTeamId = this.teams.find((x) => x.code === newValue.value)._id;
  }
  public onOppChange(newValue: any) {
    this.selectedOppText = newValue.source.selected.viewValue;
    this.opponent = newValue.value;
  }
  public onTeamConferenceChange(newValue: any) {
    if (this.conferences[this.conferenceTeamDict[newValue]].divisions[0]) {
      this.selectedTeamDivision = this.conferences[this.conferenceTeamDict[newValue]].divisions[0];
    }
  }
  public onOppConferenceChange(newValue: any) {
    if (this.conferences[this.conferenceOppDict[newValue]].divisions[0]) {
      this.selectedOpponentDivision = this.conferences[this.conferenceOppDict[newValue]].divisions[0];
    }
  }

  public onSubmit(f: any) {
    let gameTypeSelected = this.selectedgameType.indexOf("(All)") > 0 ? this.selectedgameType.split("(All)")[0].trim() : this.selectedgameType;
    let operatorValue = this.resultColumn && this.resultColumn === "Percentage" ? (this.value / 100).toString() : this.value.toString();
    this.selectedScheduleGame = this.selectedDayGame && this.selectedNightGame ? "All" : this.selectedDayGame ? "Day" : this.selectedNightGame ? "Night" : "All";
    if (this.selectedScheduleGame == "All") {
      this.selectedDayGame = true;
      this.selectedNightGame = true;
    }
    if (f != "drive" && this.category == "drive" && this.entity == "Player Statistics") {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Quarter/Half/Game/Season/Career Timebucket. Please Select Drive Timebucket to view the Stats");
      return;
    }
    else if (f != "drive" && this.category == "drive" && this.entity == "Team Statistics") {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Quarter/Half/Game/Season Timebucket. Please Select Drive Timebucket to view the Stats");
      return;
    }

    if ((f == "drive" || f == "quarter" || f == "half") && (this.category == "pass" || this.category == "punt" || this.category == "defense" || this.category == "firstdowns" || this.category == "receiving" || this.category == "rushing" || this.category == "puntReturn" || this.category == "kickReceiving")
      && (this.statistic == "passLong" || this.statistic == "puntLong" || this.statistic == "dTackUa" || this.statistic == "dTackA" || this.statistic == "dTackTot"
        || this.statistic == "dSackUa" || this.statistic == "dSackA" || this.statistic == "dQbh" || this.statistic == "dFf" || this.statistic == "dFr"
        || this.statistic == "dFryds" || this.statistic == "puntPlus50" || this.statistic == "puntInside20" || this.statistic == "fdPenalty" || this.statistic == "rcvTd" || this.statistic == "rushLong" || this.statistic == "prLong" || this.statistic == "krLong")) {
      this.results.emit([]);
      this.resultsMessage.emit("Not available at this time");
      return;
    }
    else if ((f == "drive" || f == "quarter" || f == "half") && (this.category == "conversions" || this.category == "fumbles" || this.category == "penalties" || this.category == "redzone" || this.category == "misc" || this.category == "intReturn" || this.category == "scoring")) {
      this.results.emit([]);
      this.resultsMessage.emit("Not available at this time");
      return;
    }
    this.results.emit([]);
    this.spinner.emit(true);

    let category = this.category;
    let statistic = this.statistic;
    let operator = this.operator;
    let team = this.team === 1 ? 0 : this.team;
    let opponent = this.opponent === 1 ? 0 : this.opponent;
    let sportId = this.sportId;
    let selectedlocation = this.selectedlocation;
    let selectedTeamConference = this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference;
    let selectedTeamDivision = this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision;
    let selectedOpponentConference = this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference;
    let selectedOpponentDivision = this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision;
    let projections = this.projections ? this.projections : "";
    let selectedScheduleGame = this.selectedScheduleGame;
    let resultColumn = this.resultColumn ? this.resultColumn : "Total";
    let selectedTeamId = "";
    if (this.entity === "Player Statistics") {
      selectedTeamId = this.selectedTeamId;
    }

    let obj = {
      f: f, category: category, statistic: statistic, operatorValue: operatorValue, operator: operator, team: team, opponent: opponent, sportId: sportId, selectedlocation: selectedlocation, selectedTeamConference: selectedTeamConference, selectedTeamDivision: selectedTeamDivision, selectedOpponentConference: selectedOpponentConference, selectedOpponentDivision: selectedOpponentDivision, gameTypeSelected: gameTypeSelected, projections: projections, selectedScheduleGame: selectedScheduleGame, resultColumn: resultColumn, selectedTeamId: selectedTeamId, entity: this.entity
    };

    this.googleAnalyticsEventsService.emitEvent("DE", JSON.stringify(obj), "", 1);
    switch (this.entity) {
      case "Player Statistics":
        if (f == "drive") {
          this.queryService.queryFootballDriveGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.selectedTeamId
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else if (f == "half") {
          this.queryService.queryFootballHalfGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.selectedTeamId
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else if (f == "quarter") {
          this.queryService.queryFootballQuarterGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.selectedTeamId
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else {
          this.queryService.queryPlayerGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.selectedTeamId
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
      case "Team Statistics":
        if (f == "drive") {
          this.queryService.queryDriveFootballTeamGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.selectedTeamId
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else if (f == "half") {
          this.queryService.queryHalfFootballTeamGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.team
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else if (f == "quarter") {
          this.queryService.queryQuarterFootballTeamGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.team
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
        else {
          this.queryService.queryTeamGames(
            f,
            this.category,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1 ? "NA" : this.selectedTeamConference === "All" ? "NA" : this.selectedTeamConference,
            this.team !== 1 ? "NA" : this.selectedTeamDivision === "All" ? "NA" : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentConference === "All" ? "NA" : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1 ? "NA" : this.selectedOpponentDivision === "All" ? "NA" : this.selectedOpponentDivision,
            gameTypeSelected,
            this.projections ? this.projections : "",
            this.selectedScheduleGame,
            this.resultColumn ? this.resultColumn : "Total",
            this.team
          )
            .subscribe(
              (results: any) => {
                this.selectedTeamChange.emit(this.team);
                this.results.emit(results);
                this.spinner.emit(false);
              },
              (err) => null,
            );
          break;
        }
    }

  }
}
