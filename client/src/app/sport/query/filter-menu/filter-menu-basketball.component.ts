import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { QueryService } from "app/sport/query/query.service";
import { getGameTypeData } from "../../../shared/helpers/game-type-filter";

@Component({
  selector: "app-filter-menu-basketball",
  templateUrl: "./filter-menu-basketball.component.html",
  styleUrls: ["./filter-menu-basketball.component.css"],
  providers: [QueryService],
})
export class FilterMenuBasketballComponent implements OnInit {
  @Input() public sportId: string;
  @Input() public selectedSplit: any;
  public entities = [
    { value: "player", viewValue: "Player", checked: true },
    { value: "team", viewValue: "Team", checked: false },
  ];
  public team2 = [{ code: 8, name: "Alabama" }, { code: 697, name: "Texas A&M" }];

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
  public operators = [
    { name: ">", value: "gt" },
    { name: "=", value: "eq" },
    { name: "<", value: "lt" },
    { name: ">=", value: "gte" },
    { name: "<=", value: "lte" },
  ];
  public playerStats: any[] = [
    {
      key: "Offense",
      name: "Offense",
      values: [
        { name: "Field Goals Made", value: "fgm" },
        { name: "Field Goals Attempted", value: "fga" },
        { name: "Three-point Field Goals Made", value: "fgm3" },
        { name: "Three-point Field Goals Attempted", value: "fga3" },
        { name: "Free Throws Made", value: "ftm" },
        { name: "Free Throws Attempted", value: "fta" },
        { name: "Total points", value: "tp" },
        { name: "Offensive Rebounds", value: "oreb" },
        { name: "Assists", value: "ast" },
        {
          name: "Average Assists", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.ast"] }, "$count"] }] }),
          projections: JSON.stringify({ "Assist": "$games.stats.ast" })
        },
        {
          name: "Average Scoring", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.tp"] }, "$count"] }] }),
          projections: JSON.stringify({ "TP": "$games.stats.tp" })
        },
      ],
    },
    {
      key: "Fouls",
      name: "Fouls",
      values: [
        { name: "Personal Fouls", value: "pf" },
        { name: "Technical Fouls", value: "tf" },
        { name: "Turnovers", value: "to" },
        { name: "Disqualifications", value: "dq" },
      ],
    },
    {
      key: "Defense",
      name: "Defense",
      values: [
        { name: "Blocks", value: "blk" },
        { name: "Steals", value: "stl" },
        { name: "Defensive Rebounds", value: "dreb" },
        {
          name: "Average Blocks", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.blk"] }, "$count"] }] }),
          projections: JSON.stringify({ "Blocks": "$games.stats.blk" })
        },
        {
          name: "Average Steals", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.stl"] }, "$count"] }] }),
          projections: JSON.stringify({ "Steals": "$games.stats.stl" })
        },
      ],
    },
    {
      key: "Offense And Defense",
      name: "Offense And Defense",
      values: [
        { name: "Minutes Played", value: "min" },
        { name: "Total Rebounds", value: "treb" },
        {
          name: "Assist/TO Ratio", value: JSON.stringify({ "$cond": [{ "$eq": ["$games.stats.to", 0] }, 0, { "$divide": ["$games.stats.ast", "$games.stats.to"] }] }),
          projections: JSON.stringify({ "Assist": "$games.stats.ast", "TO": "$games.stats.to" }),
        },
        {
          name: "Double Doubles", value: "dDoubles",
        },
        {
          name: "Triple Doubles", value: "tDoubles",
        },
        {
          name: "Average Rebounds", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.treb"] }, "$count"] }] }),
          projections: JSON.stringify({ "Rebounds": "$games.stats.treb" })
        },
        { name: "Games Played", value: "$GP", result: "GP" },
        {
          name: "Average Mins", result: "Average", value: JSON.stringify({ "$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$games.stats.min"] }, "$count"] }] }),
          projections: JSON.stringify({ "Minutes Played": "$games.stats.min" })
        }
      ],
    },
  ];
  public teamStats: any[] = [
    {
      key: "Offense",
      name: "Offense",
      values: [
        { name: "Assists", value: "ast" },
        { name: "Field Goals Made", value: "fgm" },
        { name: "Field Goals Attempted", value: "fga" },
        { name: "Three-point Field Goals Made", value: "fgm3" },
        { name: "Three-point Field Goals Attempted", value: "fga3" },
        { name: "Free Throws Made", value: "ftm" },
        { name: "Free Throws Attempted", value: "fta" },
        { name: "Total points", value: "tp" },
        { name: "Offensive Rebounds", value: "oreb" },
        {
          name: "Field Goals%", value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.stats.fga", 0] }, 0, { "$divide": ["$totals.stats.fgm", "$totals.stats.fga"] }] }),
          result: "Percentage",
          projections: JSON.stringify({ "FGM": "$totals.stats.fgm", "FGA": "$totals.stats.fga" })
        },
        {
          name: "Three Points%", value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.stats.fga3", 0] }, 0, { "$divide": ["$totals.stats.fgm3", "$totals.stats.fga3"] }] }),
          result: "Percentage",
          projections: JSON.stringify({ "FGM3": "$totals.stats.fgm3", "FGA3": "$totals.stats.fga3" })
        },
        {
          name: "Free Throws%", value: JSON.stringify({ "$cond": [{ "$eq": ["$totals.stats.fta", 0] }, 0, { "$divide": ["$totals.stats.ftm", "$totals.stats.fta"] }] }),
          result: "Percentage",
          projections: JSON.stringify({ "FTM": "$totals.stats.ftm", "FTA": "$totals.stats.fta" })
        },
        { name: "Points from Turnovers", value: "ptsTo" },
        { name: "Points from 2nd Chances", value: "ptsCh2" },
        { name: "Points in paint", value: "ptsPaint" },
        { name: "Points from fast breaks", value: "ptsFastb" },
        { name: "Points by bench", value: "ptsBench" },
        { name: "Number of ties", value: "ties" },
        { name: "Number of leads", value: "leads" },
        { name: "Number of possessions", value: "possCount" },
        { name: "Possesion time", value: "possTime" },
        { name: "Time Lead", value: "leadTime" },
        { name: "Time Tied", value: "tiedTime" },
        { name: "Largest Lead", value: "largeLead", result: "Large Lead" },
      ],
    },
    {
      key: "Defense",
      name: "Defense",
      values: [

        { name: "Blocks", value: "blk" },
        { name: "Steals", value: "stl" },
        { name: "Defensive Rebounds", value: "dreb" },
      ],
    },
    {
      key: "Fouls",
      name: "Fouls",
      values: [
        { name: "Personal Fouls", value: "pf" },
        { name: "Technical Fouls", value: "tf" },
        { name: "Turnovers", value: "to" },
        { name: "Deadball", value: "deadball" },
      ],
    },
    {
      key: "Offense And Defense",
      name: "Offense And Defense",
      values: [
        { name: "Minutes Played", value: "min" },
        { name: "Total Rebounds", value: "treb" },
      ],
    },
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

  constructor(private queryService: QueryService) { }

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
    this.selectedTeamText = localStorage.getItem("teamText");
    this.selectedTeamId = localStorage.getItem("selectedTeamId");
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
    const selectedObject = this.stats[this.categoryDict[this.category]].values.find((x: any) => x.name === stat.selected.viewValue);
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

  public seasonCorrection(season: any) {
    if (season && season !== "NaN") {
      switch (this.selectedSplit) {
        case "period":
          return season + '-' + (Number(season) + 1).toString().substr(-2);
        case "game":
          return season + '-' + (Number(season) + 1).toString().substr(-2);
        case "season":
          return season + '-' + (Number(season) + 1).toString().substr(-2);
        case "career":
          let firstSeason = season.toString().indexOf("-") > -1 ? Number(season.split("-")[0]) : Number(season);
          let lastSeason = season.toString().indexOf("-") > -1 ? Number(season.split("-")[1]) : Number(season);
          return firstSeason + '-' + (Number(lastSeason) + 1).toString().substr(-2);
      }
      return "NA";
    }
  }

  public onSubmit(f: any) {
    debugger;
    let gameTypeSelected = this.selectedgameType.indexOf("(All)") > 0 ? this.selectedgameType.split("(All)")[0].trim() : this.selectedgameType;
    if (this.entity == "Player Statistics" && (this.resultColumn == "Average" || this.resultColumn == "GP") && f == "game") {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Game Timebucket. Please Select Season/Career Timebucket to view the Stats.");
      return;
    }
    if (f == "period" && this.category == "Offense And Defense" && this.statistic == "min") {
      this.results.emit([]);
      this.resultsMessage.emit("Available for Game and Season only");
      return;
    }
    let operatorValue = this.resultColumn && this.resultColumn === "Percentage" ? (this.value / 100).toString() : this.value.toString();
    this.selectedScheduleGame = "All";
    this.results.emit([]);
    this.spinner.emit(true);
    switch (this.entity) {
      case "Player Statistics":
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
              let seasonCorrectionResults = results.map((x: any) => {
                x["Season"] = this.seasonCorrection(x["Season"]);
                return x;
              });
              this.results.emit(seasonCorrectionResults);
              this.spinner.emit(false);
            },
            (err) => null,
          );
        break;
      case "Team Statistics":
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
              let seasonCorrectionResults = results.map((x: any) => {
                x["Season"] = this.seasonCorrection(x["Season"]);
                return x;
              });
              this.results.emit(seasonCorrectionResults);
              this.spinner.emit(false);
            },
            (err) => null,
          );
        break;
    }

  }
}
