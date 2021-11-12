import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { QueryService } from "app/sport/query/query.service";
import { getGameTypeData } from "../../../shared/helpers/game-type-filter";

@Component({
  selector: "app-filter-menu-baseball",
  templateUrl: "./filter-menu-baseball.component.html",
  styleUrls: ["./filter-menu-baseball.component.css"],
  providers: [QueryService]
})
export class FilterMenuBaseballComponent implements OnInit {
  @Input() public sportId: any;
  @Input() public selectedSplit: any;
  public entities = [
    { value: "player", viewValue: "Player", checked: true },
    { value: "team", viewValue: "Team", checked: false }
  ];
  public team2 = [
    { code: 8, name: "Alabama" },
    { code: 697, name: "Texas A&M" }
  ];

  public team2All = [{ code: 0, name: "All" }];
  // tslint:disable-next-line:max-line-length
  public conferences = [
    {
      key: "All",
      divisions: ["All"]
    },
    {
      key: "American Athletic Conference",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Atlantic Coast Conference",
      divisions: ["All", "Atlantic", "Coastal"]
    },
    {
      key: "Big 12 Conference",
      divisions: []
    },
    {
      key: "Big Ten Conference",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Conference USA",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Division 1 FBS Independents",
      divisions: []
    },
    {
      key: "Mid-American Conference",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Mountain West Conference",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Pac-12 Conference",
      divisions: ["All", "North", "South"]
    },
    {
      key: "Sun Belt Conference",
      divisions: ["All", "East", "West"]
    },
    {
      key: "Southeastern Conference",
      divisions: ["All", "East", "West"]
    }
  ];
  public teamDivisions: string[] = [];
  public opponentDivisions: string[] = [];
  public location = ["All", "Home", "Away", "Neutral"];
  public gameTypes: any = [];
  public selectedlocation: string = "All";
  public selectedgameType: string = "All";
  public selectedScheduleGame: string = "All";
  public operators = [
    { name: ">", value: "gt" },
    { name: "=", value: "eq" },
    { name: "<", value: "lt" },
    { name: ">=", value: "gte" },
    { name: "<=", value: "lte" }
  ];

  public inns: number = localStorage.getItem("selectedSport") === "MBA"? 9:7;

  public playerStats: any[] = [
    {
      key: "hitSummary",
      name: "Baserunning",
      values: [
        { name: "Caught Stealing", value: "cs", category: "hitting" },
        {
          name: "Runs Scored", value: "r", category: "hitting"
        },
        { name: "Stolen Bases (Steals)", value: "sb", category: "hitting" },
        {
          name: "Stolen Base Attempts",
          value: "sba",
          category: "hitting"
        },
        {
          name: "Stolen Base Percentage",
          result: "Total",
          category: "hitting",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.sba", 0] },
              0,
              {
                $divide: [
                  "$games.stats.hitting.sb",
                  "$games.stats.hitting.sba"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SB: "$games.stats.hitting.sb",
            SBA: "$games.stats.hitting.sba"
          })
        }
      ]
    },
    {
      key: "fielding",
      name: "Fielding",
      values: [
        { name: "Assists", value: "a", category: "fielding" },
        {
          name: "Catcher Interference Against",
          value: "ci",
          category: "fielding"
        },
        { name: "Errors", value: "e", category: "fielding" },
        {
          name: "Fielding Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [ 
              { $or: [{ $eq: ["$games.stats.fielding.poae", 0] },
                      { $eq: ["$games.stats.fielding.poae", "$games.stats.fielding.poa"] } 
                      ]},
              0,
              {
                $divide: [
                  "$games.stats.fielding.poa",
                  "$games.stats.fielding.poae"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            POA: "$games.stats.fielding.poa",
            POAE: "$games.stats.fielding.poae"
          }),
          category: "fielding"
        },
        { name: "Passed Balls Allowed", value: "pb", category: "fielding" },
        { name: "Putouts", value: "po", category: "fielding" },
        {
          value: "sba",
          name: "Stolen Base Attempts",
          category: "fielding"
        },
        {
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $or: [{ $eq: ["$games.stats.fieldSituation.sbcs", 0] },
                      { $eq: ["$games.stats.fieldSituation.sba", "$games.stats.fieldSituation.sbcs"] } 
                      ]},
              0,
              {
                $divide: [
                  "$games.stats.fieldSituation.sba",
                  "$games.stats.fieldSituation.sbcs"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SB: "$games.stats.fieldSituation.sba",
            SBCS: "$games.stats.fieldSituation.sbcs"
          }),
          name: "Stolen Base Percentage Against",
          category: "fieldSituation"
        }
      ]
    },
    {
      key: "hitting",
      name: "Hitting",
      values: [
        { name: "At Bats", value: "ab", category: "hitting" },
        { name: "Doubles", value: "double", category: "hitting" },
        { name: "Hit By Pitch", value: "hbp", category: "hitting" },
        { name: "Hits", value: "h", category: "hitting" },
        { name: "Homeruns", value: "hr", category: "hitting" },
        { name: "Left on Base", value: "lob", category: "hitSummary" },
        { name: "Plate Appearances", value: "pa", category: "hitting" },
        { name: "RBI", value: "rbi", category: "hitting" },
        {
          name: "Reached Base on Error",
          value: "rcherr",
          category: "hitSummary"
        },
        { name: "Runs", value: "r", category: "hitting" },
        { name: "Singles", value: "single", category: "hitting" },
        { name: "Strikeouts", value: "so", category: "hitting" },
        { name: "Total Bases", value: "tb", category: "hitting" },
        { name: "Triples", value: "triple", category: "hitting" },
        { name: "Walks", value: "bb", category: "hitting" }
      ]
    },
    {
      key: "hittingRates",
      name: "Hitting Rates",
      values: [
        {
          name: "Batting Average",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.ab", 0] },
              0,
              { $divide: ["$games.stats.hitting.h", "$games.stats.hitting.ab"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$games.stats.hitting.h",
            AB: "$games.stats.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Batting Average on Balls in Play",
          result: "BABIP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.babp", 0] },
              0,
              {
                $divide: [
                  "$games.stats.hitting.hhr",
                  "$games.stats.hitting.babp"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HHR: "$games.stats.hitting.hhr",
            BABP: "$games.stats.hitting.babp"
          }),
          category: "hittingRates"
        },
        {
          name: "On Base Percentage",
          result: "OBP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.pa", 0] },
              0,
              {
                $divide: [
                  "$games.stats.hitting.hwhp",
                  "$games.stats.hitting.pa"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP: "$games.stats.hitting.hwhp",
            "PA": "$games.stats.hitting.pa"
          }),
          category: "hittingRates"
        },
        {
          name: "On Base Plus Slugging",
          result: "OPS",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $add: [
              {$cond: [
                { $eq: ["$games.stats.hitting.pa", 0] },
                0,
                {
                  $divide: [
                    "$games.stats.hitting.hwhp",
                    "$games.stats.hitting.pa"
                  ]
                }
              ]}, 
              {$cond: [
                { $eq: ["$games.stats.hitting.ab", 0] },
                0,
                {
                  $divide: ["$games.stats.hitting.tb", "$games.stats.hitting.ab"]
                }
              ]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP: "$games.stats.hitting.hwhp",
            PA: "$games.stats.hitting.pa",
            TB: "$games.stats.hitting.tb",
            AB: "$games.stats.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Slugging Percentage",
          result: "SLG",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.ab", 0] },
              0,
              {
                $divide: ["$games.stats.hitting.tb", "$games.stats.hitting.ab"]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            "Total Bases": "$games.stats.hitting.tb",
            "At Bats": "$games.stats.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Strikeout Percentage",
          result: "K Pct",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.pa", 0] },
              0,
              {
                $multiply: [ {$divide: ["$games.stats.hitting.so", "$games.stats.hitting.pa"]}, 100]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SO: "$games.stats.hitting.so",
            PA: "$games.stats.hitting.pa"
          }),
          category: "hittingRates"
        },
        {
          name: "Walk Percentage",
          result: "BB Pct",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.hitting.pa", 0] },
              0,
              {
                $multiply: [ {$divide: ["$games.stats.hitting.bb", "$games.stats.hitting.pa"]}, 100]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            BB: "$games.stats.hitting.bb",
            PA: "$games.stats.hitting.pa"
          }),
          category: "hittingRates"
        }
      ]
    },
    {
      key: "pitching",
      name: "Pitching",
      values: [
        { name: "Balks", value: "bk", category: "pitching" },
        { name: "Batters Faced", value: "bf", category: "pitching" },
        { name: "Doubles Allowed", value: "double", category: "pitching" },
        {
          name: "Earned Runs",
          value: "er",
          category: "pitching"
        },
        {
          name: "Ground Ball Double Plays",
          value: "gdp",
          category: "pitching"
        },
        { name: "Hit By Pitch", value: "hbp", category: "pitching" },
        { name: "Hits", value: "h", category: "pitching" },
        { name: "Homeruns", value: "hr", category: "pitching" },
        { 
          name: "Innings Pitched",
          value: "ip",
          category: "pitching" 
        },
        { name: "Runs", value: "r", category: "pitching" },
        { name: "Sac Bunts", value: "sha", category: "pitching" },
        { name: "Sac Flies", value: "sfa", category: "pitching" },
        { name: "Strikeouts", value: "so", category: "pitching" },
        { name: "Triples", value: "triple", category: "pitching" },
        { name: "Walks", value: "bb", category: "pitching" },
        { name: "Wild Pitches", value: "wp", category: "pitching" }
      ]
    },
    {
      key: "pitchingrates",
      name: "Pitching Rates",
      values: [
        {
          name: "BABIP",
          result: "BABIP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.abkhrsf", 0] },
              0,
              {
                $divide: [
                  "$games.stats.pitching.hhr",
                  "$games.stats.pitching.abkhrsf"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HHR: "$games.stats.pitching.hhr",
            ABHRSF: "$games.stats.pitching.abkhrsf"
          }),
          category: "pitching"
        },
        {
          name: "Earned Runs Average",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.ip", 0] },
              0,
              { $divide: [{$multiply: ["$games.stats.pitching.er", this.inns]}, "$games.stats.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
            ER: "$games.stats.pitching.er", 
            IP: "$games.stats.pitching.ip" }),
          category: "EarnedRunsAverage"
        },
        {
          name: "Hits per " + this.inns.toString() + " innings",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.ip", 0] },
              0,
              { $divide: [{$multiply: ["$games.stats.pitching.h", this.inns]}, "$games.stats.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
            H: "$games.stats.pitching.h", 
            IP: "$games.stats.pitching.ip"}),
          category: "Hitsper9innings"
        },
        {
          name: "OnBase %",
          result: "OBP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.pa", 0] },
              0,
              {
                $divide: [
                  "$games.stats.pitching.hwhp",
                  "$games.stats.pitching.pa"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP : "$games.stats.pitching.hwhp",
            PA : "$games.stats.pitching.pa"
          }),
          category: "pitching"
        },
        {
          name: "Opponent Batting Average",
          result: "OBA",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.ab", 0] },
              0,
              {
                $divide: [
                  "$games.stats.pitching.h",
                  "$games.stats.pitching.ab"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$games.stats.pitching.h",
            AB: "$games.stats.pitching.ab"
          }),
          category: "pitching"
        },
        {
          name: "Slugging %",
          result: "SLG",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.ab", 0] },
              0,
              {
                $divide: ["$games.stats.pitching.tb", "$games.stats.pitching.ab"]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            "Total Bases": "$games.stats.pitching.tb",
            "At Bats": "$games.stats.pitching.ab"
          }),
          category: "pitching"
        },
        {
          name: "Strikeout to Walk Ratio",
          result: "KWR",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.bb", 0] },
              0,
              {
                $divide: [
                  "$games.stats.pitching.so",
                  "$games.stats.pitching.bb"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SO: "$games.stats.pitching.so",
            BB: "$games.stats.pitching.bb"
          }),
          category: "pitching"
        },
        {
          name: "Strikeouts per " + this.inns.toString() + " innings",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$games.stats.pitching.ip", 0] },
              0,
              { $divide: [{$multiply: ["$games.stats.pitching.so", this.inns]}, "$games.stats.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
            K: "$games.stats.pitching.so", 
            IP: "$games.stats.pitching.ip"}),
          category: "SOper9innings"
        }
      ]
    },
    {
      key: "hitSituation",
      name: "Situational Hitting",
      values: [
        { name: "RBI with 2 Outs", value: "rbi2Out", category: "hitSummary" },
        { name: "Sacrifice Flies", value: "sf", category: "hitting" },
        {
          name: "Sacrifice Hits (Bunts)",
          value: "sh",
          category: "hitting"
        },
        {
          name: "Batting Avg with Runners on Base",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$games.stats.hitSummary.wRunnersH", 0] },
                      { $eq: ["$games.stats.hitSummary.wRunnersAB", 0] } 
                      ]},
              0,
              {$divide: ["$games.stats.hitSummary.wRunnersH", "$games.stats.hitSummary.wRunnersAB"]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$games.stats.hitSummary.wRunnersH",
            AB: "$games.stats.hitSummary.wRunnersAB"
          }),
          category: "hitSummaryAvg"
        },
        {
          name: "Batting Avg with Bases Loaded",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$games.stats.hitSummary.wLoadedH", 0] },
                      { $eq: ["$games.stats.hitSummary.wLoadedAB", 0] } 
                      ]},
              0,
              {$divide: ["$games.stats.hitSummary.wLoadedH", "$games.stats.hitSummary.wLoadedAB"]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$games.stats.hitSummary.wLoadedH",
            AB: "$games.stats.hitSummary.wLoadedAB"
          }),
          category: "hitSummaryAvg"
        },
        {
          name: "Batting Avg with 2 Outs",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$games.stats.hitSummary.w2OutsH", 0] },
                      { $eq: ["$games.stats.hitSummary.w2OutsAB", 0] } 
                      ]},
              0,
              {$divide: ["$games.stats.hitSummary.w2OutsH", "$games.stats.hitSummary.w2OutsAB"]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$games.stats.hitSummary.w2OutsH",
            AB: "$games.stats.hitSummary.w2OutsAB"
          }),
          category: "hitSummaryAvg"
        }
      ]
    }
  ];
  public teamStats: any[] = [
    {
      key: "hitSummary",
      name: "Baserunning",
      values: [
        { name: "Caught Stealing", value: "cs", category: "hitting" },
        {
          name: "Runs Scored", value: "r", category: "hitting"
        },
        { name: "Stolen Bases (Steals)", value: "sb", category: "hitting" },
        { name: "Stolen Base Attempts", value: "sba", category: "hitting" },
	      {
          name: "Stolen Base Percentage",
          result: "Total",
          category: "hitting",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.sba", 0] },
              0,
              {
                $divide: [
                  "$totals.hitting.sb",
                  "$totals.hitting.sba"
                ]
              }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SB: "$totals.hitting.sb",
            SBA: "$totals.hitting.sba"
          })
        }
      ]
    },
    {
      key: "fielding",
      name: "Fielding",
      values: [
        { name: "Assists", value: "a", category: "fielding" },
        {
          name: "Catcher Interference Against",
          value: "ci",
          category: "fielding"
        },
        { name: "Errors", value: "e", category: "fielding" },
        {
          name: "Fielding Percentage",
          result: "Percentage",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $or: [{ $eq: ["$totals.fielding.poae", 0] },
                      { $eq: ["$totals.fielding.poae", "$totals.fielding.poa"] } 
                      ]},
              0,
              { $divide: ["$totals.fielding.poa", "$totals.fielding.poae"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            POA: "$totals.fielding.poa",
            POAE: "$totals.fielding.poae"
          }),
          category: "fielding"
        },
        { name: "Passed Balls Allowed", value: "pb", category: "fielding" },
        { name: "Putouts", value: "po", category: "fielding" },
        {
          value: "sba",
          name: "Stolen Base Attempts",
          category: "fielding"
        }
      ]
    },
    {
      key: "hitting",
      name: "Hitting",
      values: [
        { name: "At Bats", value: "ab", category: "hitting" },
        { name: "Doubles", value: "double", category: "hitting" },
        { name: "Hit By Pitch", value: "hbp", category: "hitting" },
        { name: "Hits", value: "h", category: "hitting" },
        { name: "Homeruns", value: "hr", category: "hitting" },
        { name: "Left on Base", value: "lob", category: "hitSummary" },
        { name: "Plate Appearances", value: "pa", category: "hitting" },
        { name: "RBI", value: "rbi", category: "hitting" },
        {
          name: "Reached Base on Error",
          value: "rcherr",
          category: "hitSummary"
        },
        { name: "Runs", value: "r", category: "hitting" },
        { name: "Singles", value: "single", category: "hitting" },
        { name: "Strikeouts", value: "so", category: "hitting" },
        { name: "Total Bases", value: "tb", category: "hitting" },
        { name: "Triples", value: "triple", category: "hitting" },
        { name: "Walks", value: "bb", category: "hitting" }
      ]
    },
    {
      key: "hittingRates",
      name: "Hitting Rates",
      values: [
        {
          name: "Batting Average",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.ab", 0] },
              0,
              { $divide: ["$totals.hitting.h", "$totals.hitting.ab"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$totals.hitting.h",
            AB: "$totals.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Batting Average on Balls in Play",
          result: "BABIP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.babp", 0] },
              0,
              { $divide: ["$totals.hitting.hhr", "$totals.hitting.babp"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HHR: "$totals.hitting.hhr",
            BABP: "$totals.hitting.babp"
          }),
          category: "hittingRates"
        },
        {
          name: "On Base Percentage",
          result: "OBP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.pa", 0] },
              0,
              { $divide: ["$totals.hitting.hwhp", "$totals.hitting.pa"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP: "$totals.hitting.hwhp",
            PA: "$totals.hitting.pa"
          }),
          category: "hittingRates"
        },
	      {
          name: "On Base Plus Slugging",
          result: "OPS",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $add: [
              {$cond: [
                { $eq: ["$totals.hitting.pa", 0] },
                0,
                {
                  $divide: [
                    "$totals.hitting.hwhp",
                    "$totals.hitting.pa"
                  ]
                }
              ]}, 
              {$cond: [
                { $eq: ["$totals.hitting.ab", 0] },
                0,
                {
                  $divide: ["$totals.hitting.tb", "$totals.hitting.ab"]
                }
              ]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP: "$totals.hitting.hwhp",
            PA: "$totals.hitting.pa",
            TB: "$totals.hitting.tb",
            AB: "$totals.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Slugging Percentage",
          result: "SLG",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.ab", 0] },
              0,
              { $divide: ["$totals.hitting.tb", "$totals.hitting.ab"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            "Total Bases": "$totals.hitting.tb",
            "At Bats": "$totals.hitting.ab"
          }),
          category: "hittingRates"
        },
        {
          name: "Strikeout Percentage",
          result: "K Pct",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.pa", 0] },
              0,
              { $divide: ["$totals.hitting.so", "$totals.hitting.pa"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SO: "$totals.hitting.so",
            PA: "$totals.hitting.pa"
          }),
          category: "hittingRates"
        },
        {
          name: "Walk Percentage",
          result: "BB Pct",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.hitting.pa", 0] },
              0,
              { $divide: ["$totals.hitting.bb", "$totals.hitting.pa"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            BB: "$totals.hitting.bb",
            PA: "$totals.hitting.pa"
          }),
          category: "hittingRates"
        }
      ]
    },
    {
      key: "pitching",
      name: "Pitching",
      values: [
        { name: "Balks", value: "bk", category: "pitching" },
        { name: "Batters Faced", value: "bf", category: "pitching" },
        { name: "Doubles Allowed", value: "double", category: "pitching" },
        {
          name: "Earned Runs",
          value: "er",
          category: "pitching"
        },
        {
          name: "Ground Ball Double Plays",
          value: "gdp",
          category: "pitching"
        },
        { name: "Hit By Pitch", value: "hbp", category: "pitching" },
        { name: "Hits", value: "h", category: "pitching" },
        { name: "Homeruns", value: "hr", category: "pitching" },
	      { name: "Innings Pitched", value: "ip", category: "pitching" },
        { name: "Runs", value: "r", category: "pitching" },
        { name: "Sac Bunts", value: "sha", category: "pitching" },
        { name: "Sac Flies", value: "sfa", category: "pitching" },
        { name: "Strikeouts", value: "so", category: "pitching" },
        { name: "Triples", value: "triple", category: "pitching" },
        { name: "Walks", value: "bb", category: "pitching" },
        { name: "Wild Pitches", value: "wp", category: "pitching" }
      ]
    },
    {
      key: "pitchingRates",
      name: "Pitching Rates",
      values: [
        {
          name: "BABIP",
          result: "BABIP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.abkhrsf", 0] },
              0,
              { $divide: ["$totals.pitching.hhr", "$totals.pitching.abkhrsf"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HHR: "$totals.pitching.hhr",
            ABHRSF: "$totals.pitching.abkhrsf"
          }),
          category: "pitching"
        },
        {
          name: "Earned Runs Average",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.ip", 0] },
              0,
              { $divide: [{$multiply: ["$totals.pitching.er", this.inns]}, "$totals.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
          ER: "$totals.pitching.er",
          IP: "$totals.pitching.ip"
          }),
          category: "EarnedRunsAverage"
        },
        {
          name: "Hits per " + this.inns.toString() + " innings",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.ip", 0] },
              0,
              { $divide: [{$multiply: ["$totals.pitching.h", this.inns]}, "$totals.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
	    H: "$totals.pitching.h",
	    IP: "$totals.pitching.ip" }),
          category: "Hitsper9innings"
        },
        {
          name: "OnBase %",
          result: "OBP",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.pa", 0] },
              0,
              { $divide: ["$totals.pitching.hwhp", 
                          "$totals.pitching.pa"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            HWHP: "$totals.pitching.hwhp",
            PA: "$totals.pitching.pa"
          }),
          category: "pitching"
        },
        {
          name: "Opponent Batting Average",
          result: "OBA",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.ab", 0] },
              0,
              { $divide: ["$totals.pitching.h", "$totals.pitching.ab"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$totals.pitching.h",
            AB: "$totals.pitching.ab"
          }),
          category: "pitching"
        },
        {
          name: "Slugging %",
          result: "SLG",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.ab", 0] },
              0,
              { $divide: ["$totals.pitching.tb", "$totals.pitching.ab"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            "Total Bases": "$totals.pitching.tb",
            "At Bats": "$totals.pitching.ab"
          }),
          category: "pitching"
        },
        {
          name: "Strikeout to Walk Ratio",
          result: "KWR",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.bb", 0] },
              0,
              { $divide: ["$totals.pitching.so", "$totals.pitching.bb"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            SO: "$totals.pitching.so",
            BB: "$totals.pitching.bb"
          }),
          category: "pitching"
        },
        {
          name: "Strikeouts per " + this.inns.toString() + " innings",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $eq: ["$totals.pitching.so", 0] },
              0,
              { $divide: [{$multiply: ["$totals.pitching.so", this.inns]}, "$totals.pitching.ip"] }
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({ 
            K: "$totals.pitching.so",
            IP: "$totals.pitching.ip" }),
          category: "SOper9innings"
        }
      ]
    },
    {
      key: "hitSituation",
      name: "Situational Hitting",
      values: [
        { name: "RBI with 2 Outs", value: "rbi2Out", category: "hitSummary" },
        { name: "Sacrifice Flies", value: "sf", category: "hitting" },
        {
          name: "Sacrifice Hits (Bunts)",
          value: "sh",
          category: "hitting"
        },
        {
          name: "Batting Avg with Runners on Base",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$totals.hitSummary.wRunnersH", 0] },
                      { $eq: ["$totals.hitSummary.wRunnersAB", 0] } 
                      ]},
              0,
              {$divide: ["$totals.hitSummary.wRunnersH", "$totals.hitSummary.wRunnersAB"]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$totals.hitSummary.wRunnersH",
            AB: "$totals.hitSummary.wRunnersAB"
          }),
          category: "hitSummaryAvg"
        },
        {
          name: "Batting Avg with Bases Loaded",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$totals.hitSummary.wLoadedH", 0] },
                      { $eq: ["$totals.hitSummary.wLoadedAB", 0] } 
                      ]},
              0,
              {$divide: ["$totals.hitSummary.wLoadedH", "$totals.hitSummary.wLoadedAB"]}
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$totals.hitSummary.wLoadedH",
            AB: "$totals.hitSummary.wLoadedAB"
          }),
          category: "hitSummaryAvg"
        },
        {
          name: "Batting Avg with 2 Outs",
          result: "BatAvg",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({
            $cond: [
              { $and: [{ $eq: ["$totals.hitSummary.w2OutsH", 0] },
                      { $eq: ["$totals.hitSummary.w2OutsAB", 0] } 
                      ]},
              0,
              {$divide: ["$totals.hitSummary.w2OutsH", "$totals.hitSummary.w2OutsAB"]}, 
            ]
          }),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({
            H: "$totals.hitSummary.w2OutsH",
            AB: "$totals.hitSummary.w2OutsAB"
          }),
          category: "hitSummaryAvg"
        }
      ]
    }
  ];
  public selectedTeamConference: string = this.conferences[0].key;
  public selectedOpponentConference: string = this.conferences[0].key;
  public selectedTeamDivision: string = "";
  public selectedOpponentDivision: string = "";
  public stats = this.playerStats;
  public conferenceTeamDict: { [selectedTeamConference: string]: number } = {};
  public conferenceOppDict: {
    [selectedOpponentConference: string]: number;
  } = {};
  public entity: string = localStorage.getItem("entity") || "";
  public category: string = this.stats[0].key;
  public categoryDict: { [category: string]: number } = {};
  public statistic: string = "";
  public projections: string = "";
  public statCategory: string = "";
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

  constructor(private queryService: QueryService) { }

  public ngOnInit() {
    this.gameTypes = getGameTypeData(this.sportId);
    let i = 0;
    this.stats.forEach(element => {
      this.categoryDict[element.key] = i;
      i++;
    });
    let j = 0;
    this.conferences.forEach(element => {
      this.conferenceTeamDict[element.key] = j;
      this.conferenceOppDict[element.key] = j;
      j++;
    });
    this.team = Number(localStorage.getItem("selectedTeam"));
    this.selectedTeamText = localStorage.getItem("teamText");
    this.selectedTeamId = localStorage.getItem("selectedTeamId");
    this.queryService.getAllTeams().subscribe((teams: any) => {
      this.teams = teams.filter((item: any) => {
        return item.code !== this.team;
      });
      this.teams.unshift({
        code: 1,
        name: "Conference",
        _id: this.selectedTeamId
      });
      this.teams.unshift({
        code: this.team,
        name: this.selectedTeamText,
        _id: this.selectedTeamId
      });
      this.teams.unshift({ code: 0, name: "All", _id: this.selectedTeamId });
      this.availableTeams = this.teams;
    });
    if (
      this.conferences[this.conferenceTeamDict[this.selectedTeamConference]]
        .divisions[0]
    ) {
      this.selectedTeamDivision = this.conferences[
        this.conferenceTeamDict[this.selectedTeamConference]
      ].divisions[0];
    }
    if (
      this.conferences[this.conferenceOppDict[this.selectedOpponentConference]]
        .divisions[0]
    ) {
      // tslint:disable-next-line:max-line-length
      this.selectedOpponentDivision = this.conferences[
        this.conferenceOppDict[this.selectedOpponentConference]
      ].divisions[0];
    }
    this.statistic = this.stats[
      this.categoryDict[this.category]
    ].values[0].value;
    if (this.entity === "Player Statistics") {
      this.onEntityChange("player");
    } else {
      this.onEntityChange("team");
    }
    this.splitValue.emit(this.entity);
  }

  public onChange(newValue: any) {
    let i = 0;
    this.categoryDict = {};
    this.stats.forEach(element => {
      this.categoryDict[element.key] = i;
      i++;
    });
    this.statistic = this.stats[
      this.categoryDict[this.category]
    ].values[0].value;
    this.projections = this.stats[
      this.categoryDict[this.category]
    ].values[0].projections;
    this.statCategory = this.stats[
      this.categoryDict[this.category]
    ].values[0].category;
    this.resultColumn = this.stats[
      this.categoryDict[this.category]
    ].values[0].result;
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
    this.stats.forEach(element => {
      this.categoryDict[element.key] = i;
      i++;
    });
    this.statistic = this.stats[
      this.categoryDict[this.category]
    ].values[0].value;
    this.projections = this.stats[
      this.categoryDict[this.category]
    ].values[0].projections;
    this.resultColumn = this.stats[
      this.categoryDict[this.category]
    ].values[0].result;
    this.statCategory = this.stats[
      this.categoryDict[this.category]
    ].values[0].category;
    this.splitValue.emit(newValue);
  }

  public onStatsChange(newValue: any, stat: any) {
    let i = 0;
    this.categoryDict = {};
    this.stats.forEach(element => {
      this.categoryDict[element.key] = i;
      i++;
    });
    const projections = "projections";
    const resultCol = "result";
    const statCategory = "category";
    // tslint:disable-next-line:max-line-length
    const selectedObject = this.stats[
      this.categoryDict[this.category]
    ].values.find((x: any) => x.name === stat.selected.viewValue);
    this.projections = selectedObject[projections];
    this.resultColumn = selectedObject[resultCol];
    this.statCategory = selectedObject[statCategory];
  }
  public onTeamChange(newValue: any) {
    this.selectedTeamText = newValue.source.selected.viewValue;
    this.team = newValue.value;
    this.selectedTeamId = this.teams.find(x => x.code === newValue.value)._id;
  }
  public onOppChange(newValue: any) {
    this.selectedOppText = newValue.source.selected.viewValue;
    this.opponent = newValue.value;
  }
  public onTeamConferenceChange(newValue: any) {
    if (this.conferences[this.conferenceTeamDict[newValue]].divisions[0]) {
      this.selectedTeamDivision = this.conferences[
        this.conferenceTeamDict[newValue]
      ].divisions[0];
    }
  }
  public onOppConferenceChange(newValue: any) {
    if (this.conferences[this.conferenceOppDict[newValue]].divisions[0]) {
      this.selectedOpponentDivision = this.conferences[
        this.conferenceOppDict[newValue]
      ].divisions[0];
    }
  }

  public onSubmit(f: any) {
    let gameTypeSelected =
      this.selectedgameType.indexOf("(All)") > 0
        ? this.selectedgameType.split("(All)")[0].trim()
        : this.selectedgameType;
    if (
      this.resultColumn &&
      this.resultColumn.indexOf("per game") > -1 &&
      f === "game"
    ) {
      this.results.emit([]);
      this.resultsMessage.emit(
        "Selected Stats is not support for Game Timebucket. Please Select Season Timebucket to view the Stats."
      );
      return;
    }
    let operatorValue =
      this.resultColumn && this.resultColumn === "Percentage"
        ? (this.value / 100).toString()
        : this.value.toString();
    this.selectedScheduleGame = "All";
    this.results.emit([]);
    this.spinner.emit(true);
    switch (this.entity) {
      case "Player Statistics":
        this.queryService
          .queryPlayerGames(
            f,
            this.statCategory,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1
              ? "NA"
              : this.selectedTeamConference === "All"
                ? "NA"
                : this.selectedTeamConference,
            this.team !== 1
              ? "NA"
              : this.selectedTeamDivision === "All"
                ? "NA"
                : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1
              ? "NA"
              : this.selectedOpponentConference === "All"
                ? "NA"
                : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1
              ? "NA"
              : this.selectedOpponentDivision === "All"
                ? "NA"
                : this.selectedOpponentDivision,
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
            err => null
          );
        break;
      case "Team Statistics":
        this.queryService
          .queryTeamGames(
            f,
            this.statCategory,
            this.statistic,
            operatorValue,
            this.operator,
            this.team === 1 ? 0 : this.team,
            this.opponent === 1 ? 0 : this.opponent,
            this.sportId,
            this.selectedlocation,
            this.team !== 1
              ? "NA"
              : this.selectedTeamConference === "All"
                ? "NA"
                : this.selectedTeamConference,
            this.team !== 1
              ? "NA"
              : this.selectedTeamDivision === "All"
                ? "NA"
                : this.selectedTeamDivision,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1
              ? "NA"
              : this.selectedOpponentConference === "All"
                ? "NA"
                : this.selectedOpponentConference,
            // tslint:disable-next-line:max-line-length
            this.opponent !== 1
              ? "NA"
              : this.selectedOpponentDivision === "All"
                ? "NA"
                : this.selectedOpponentDivision,
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
            err => null
          );
        break;
    }
  }
}
