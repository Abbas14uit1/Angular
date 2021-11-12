import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { QueryService } from "app/sport/query/query.service";
import { getGameTypeData } from "../../../shared/helpers/game-type-filter";
import { IAvailableStatDetails } from "../../../../../../typings/server/availablePlayerStats.d";
import { GoogleAnalyticsEventsService } from "../../../services/google-analytics-events-service";

@Component({
  selector: "app-filter-menu-soccer",
  templateUrl: "./filter-menu-soccer.component.html",
  styleUrls: ["./filter-menu-soccer.component.css"],
  providers: [QueryService],
})

export class FilterMenuSoccerComponent implements OnInit {
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
  },
  {
    key: "Empire 8",
    divisions: [
      // "All",
    ],
  },
];

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
      key: "games",
      name: "Games",
      values: [
        { name: "Games Played", value: "games.gp" },
        { name: "Games Started", value: "games.gs" },
        { name: "Minutes Played", value: "games.stats.misc.minutes", },
      ],
    },
    {
      key: "goaltype",
      name: "Goal Types",
      values: [
        { name: "First Goal (of the game)", value: "games.stats.goaltype.fg" },
        { name: "Game Tying Goal", value: "games.stats.goaltype.gt" }, 
        { name: "Game Winning Goal", value: "games.stats.goaltype.gw" },
        { name: "Goal in Overtime", value: "games.stats.goaltype.ot" },
        { name: "Shoot Out Goal", value: "games.stats.goaltype.so" },
        { name: "Third Goal of the Game", value: "games.stats.goaltype.hat" },
        { name: "Unassisted Goal", value: "games.stats.goaltype.ua" },
      ],
    },
    {
      key: "goalie",
      name: "Goalie",
      values: [
        { name: "Goals Allowed", value: "games.stats.goalie.ga" },
        { 
          name: "Goals Allowed Avg",
          result: "GAA",
           // tslint:disable-next-line:max-line-length
          value: JSON.stringify({"$cond": [{ "$eq": ["$games.stats.misc.minutes", 0] }, 0,{"$divide":[{"$multiply":["$games.stats.goalie.ga",90]}, "$games.stats.misc.minutes"]}]}),
           // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({"GA": "$games.stats.goalie.ga", "Mp": "$games.stats.misc.minutes"}),
        },
        { 
          name: "Save %",
           // tslint:disable-next-line:max-line-length
          result: "SavesAvg",
          value: JSON.stringify({"$cond": [{ "$eq": ["$games.stats.goalie.oppoSog", 0] }, 0,{"$divide":["$games.stats.goalie.saves","$games.stats.goalie.oppoSog"]}]}),
           // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({"Saves": "$games.stats.goalie.saves", "OppoSog": "$games.stats.goalie.oppoSog"}),
        },
        { name: "Save Avg", value: "" },
        { name: "Save Ration", value: "" },
        { name: "Saves", value: "games.stats.goalie.saves" },
        { name: "Shots Faced", value: "games.stats.goalie.sf" },
        { name: "Shut outs", value: "games.stats.goalie.shutout" },
      ],
    },
    {
      key: "misc",
      name: "Miscellaneous",
      values: [
        { name: "Game Winning Goals", result: "Total", value: "games.stats.goaltype.gw"},
        { name: "Penalty Kicks - Att", result: "Total", value: "games.stats.shots.psatt"},
        { name: "Penalty Kicks - G", result: "Total", value: "games.stats.shots.ps"},
      ],
    },
    {
      key: "planty",
      name: "Penalties",
      values: [
        { name: "Fouls", value: "games.stats.planty.fouls" },
        { name: "Red Card", value: "games.stats.planty.red" },
        { name: "Yellow Card", value: "games.stats.planty.yellow" },
      ],
    },
    {
      key: "scoring",
      name: "Scoring",
      values: [
        { name: "Assists", value: "games.stats.shots.a", },
        { 
          name: "Goals",
          value: "games.stats.shots.g",
        },
        {
          name: "Points",
          result: "Total",
          // tslint:disable-next-line:max-line-length
          // value: JSON.stringify({"$multiply":[{ "$sum": ["$games.stats.shots.g", "$games.stats.shots.a"]},2]}),
          value: JSON.stringify({"$sum":[{ "$multiply": [2,"$games.stats.shots.g"]}, "$games.stats.shots.a"]}),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({"Goal": "$games.stats.shots.g", "Assists": "$games.stats.shots.a" }),
        },
      ],
    },
    {
      key: "shots",
      name: "Shots",
      values: [
        {
          name: "Shot %",
          result: "SHP",
           // tslint:disable-next-line:max-line-length
           value: JSON.stringify({"$cond": [{ "$eq": ["$games.stats.shots.sh", 0] }, 0,{"$divide":["$games.stats.shots.g","$games.stats.shots.sh"]}]}),
           // tslint:disable-next-line:max-line-length
           projections: JSON.stringify({"Goal": "$games.stats.shots.g", "Shots": "$games.stats.shots.sh" }),
        },
        { name: "Shots", value: "games.stats.shots.sh" },
        { name: "Shots on Goal", value: "games.stats.shots.sog" },
        { 
          name: "Shots on Goal %",
          result: "SOG",
           // tslint:disable-next-line:max-line-length
           value: JSON.stringify({"$cond": [{ "$eq": ["$games.stats.shots.sh", 0] }, 0,{"$divide":["$games.stats.shots.sog","$games.stats.shots.sh"]}]}),
           // tslint:disable-next-line:max-line-length
           projections: JSON.stringify({ "Shots on Goal": "$games.stats.shots.sog", "Sh": "$games.stats.shots.sh"}),
        },
      ],
    }
  ];
  public teamStats: IAvailableStatDetails[] = [
    {
      key: "goalbreakdown",
      name: "Goal Breakdown",
      values: [
        { name: "Overtime", value: "totals.goaltype.ot"},
        { name: "Total Goals", value: "totals.otherStats.score" },
        { name: "Unassisted", value: "totals.goaltype.ua"},
      ],
    },
    {
      key: "goaltype",
      name: "Goal Types",
      values: [
        { name: "First Goal (of the game)", value: "totals.goaltype.fg" },
        { name: "Game Tying Goal", value: "totals.goaltype.gt" }, 
        { name: "Game Winning Goal", value: "totals.goaltype.gw" },
        { name: "Shoot Out Goal", value: "totals.goaltype.so" },
        { name: "Third Goal of the Game", value: "totals.goaltype.hat" },
      ],
    },
    {
      key: "misc", 
      name: "Miscellaneous",
      values: [
        { name: "Goals off Corner", value: "totals.otherStats.corners" },
        { name: "Offsides", value: "totals.otherStats.offsides" },         
        { name: "Penalty Kick - Att", value: "totals.shots.psatt" },
        { name: "Penalty Kick - G", value: "totals.shots.ps" },
        { name: "Saves", value: "totals.misc.dsave" },
      ],
    },
    {
      key: "planty",
      name: "Penalty Kicks",
      values: [
        { name: "Fouls", value: "totals.planty.fouls" },
        { name: "Red Card", value: "totals.planty.red" },
        { name: "Yellow Card", value: "totals.planty.yellow" },
      ],
    },
    {
      key: "shot",
      name: "Shot Statistics",
      values: [
        { name: "Assists", value: "totals.shots.a" },
        { name: "Goals", value: "totals.shots.g" },
        {
          name: "Goals per game", 
          result: "GpAvg",
          value: JSON.stringify({"$cond": [{ "$eq": ["$count", 0] }, 0,{ "$divide": [{ "$sum": ["$totals.shots.g"] }, "$count"] }]}),
          projections: JSON.stringify({ "Goals": "$totals.shots.g","No of Game":"$count"}),
        },
        {
          name: "Shot %",
          result: "SHP",
           // tslint:disable-next-line:max-line-length
           value: JSON.stringify({"$cond": [{ "$eq": ["$totals.shots.sh", 0] }, 0,{"$divide":["$totals.shots.g","$totals.shots.sh"]}]}),
           // tslint:disable-next-line:max-line-length
           projections: JSON.stringify({"Goals": "$totals.shots.g", "Shots": "$totals.shots.sh" }),
        },
        { name: "Shots on goal", value: "totals.shots.sog" },
        { 
          name: "Shots on Goal %",
          result: "SOG",
          // tslint:disable-next-line:max-line-length
          value: JSON.stringify({"$cond": [{ "$eq": ["$totals.shots.sh", 0] }, 0,{"$divide":["$totals.shots.sog","$totals.shots.sh"]}]}),
          // tslint:disable-next-line:max-line-length
          projections: JSON.stringify({"Shots on Goal": "$totals.shots.sog","Shots": "$totals.shots.sh"}),
        },
        {
          name: "Shots per game", 
          result: "SH-G",
          value: JSON.stringify({"$cond": [{ "$eq": ["$count", 0] }, 0, { "$divide": [{ "$sum": ["$totals.shots.sog"] }, "$count"] }]}),
          projections: JSON.stringify({ "SOG": "$totals.shots.sog","No of Game":"$count" }),
        },
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

  statvalueofcat:any;
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
    this.statvalueofcat = selectedObject.name;
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
    if (f == "game" && this.category == "games") {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Game Timebucket. Please Select Season/Career Timebucket to view the Stats");
      return;
    }
    if (f == "game" && (this.category == "shot" && this.statvalueofcat == "Goals per game") ) {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Game Timebucket. Please Select Season/Career Timebucket to view the Stats");
      return;
    }
    if (f == "game" && (this.category == "shot" && this.statvalueofcat == "Shots per game") ) {
      this.results.emit([]);
      this.resultsMessage.emit("Selected Stats is not support for Game Timebucket. Please Select Season/Career Timebucket to view the Stats");
      return;
    }
    if (this.selectedScheduleGame == "All") {
      this.selectedDayGame = true;
      this.selectedNightGame = true;
    }

    // this.selectedDayGame = true;
    // this.selectedNightGame = true;
    this.results.emit([]);
    this.spinner.emit(true);

    let category = this.category === "games" ? "NA" : this.category;
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
        this.queryService.queryPlayerGames(
          f,
          this.category === "games" ? "NA" : this.category,
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
      case "Team Statistics":
        this.queryService.queryTeamGames(
          f,
          this.category === "games" ? "NA" : this.category,
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