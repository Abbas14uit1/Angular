import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/platform-browser";
import { QueryBuilderClassNames, QueryBuilderConfig } from "angular2-query-builder";
import { QueryService } from "app/sport/query/query.service";
import * as moment from "moment";
import { HeaderConfig } from "../../shared/header/header.component";
import { QueryBuilderResultsComponent } from "app/sport/query-builderdb/query-builder-results/query-builder-results.component";
import { TeamColors } from "../../shared/team-colors";
import { projectedFieldsSoccer } from "./projectedFields-soccer";

@Component({
  selector: "app-newquery-builderdb-soccer",
  templateUrl: "./newquery-builderdb-soccer.component.html",
  styleUrls: ["./newquery-builderdb-soccer.component.css"],
  providers: [QueryService]
})
export class NewQueryBuilderdbSoccerComponent implements OnInit {
  public QBteams: any;
  public QBteamColors: any;
  public QBteamId: any;
  public QBsportId: any;
  public QBteamName: any;
  public QBshared: TeamColors = new TeamColors();
  public QBselectedSplit: string;

  public QBresults: any[];
  public QBshowResults: boolean = false;
  public QBspinner: boolean = false;
  public QBmessage: string = "No results found";

  public QBentities = [
    { value: "game", viewValue: "Game ", checked: true },
    { value: "period", viewValue: "Period", checked: false },
  ];
  public QBentity: string = this.QBentities[0].value;

  public config: any;

  public query: any = {
    condition: "and",
    rules: [
    ]
  };

  public mongoDbPipeline: any;
  public sortByField: any = {};
  public projections: any = {};
  public projectionObject: any = projectedFieldsSoccer;
  public playersConfig: any = {};
  public teamGameConfig: any = {};

  public GroupTeamCategory: any;
  public count = 0;

  public Field = [{
    category: 'Player',
    statistic: "name",
    operators: "=",
    values: "",
    condition: "",
  }];

  public Group: any = [{
    condition: "",
    Field: [{
      category: 'Player',
      statistic: "name",
      operators: "=",
      values: "",
    }]
  }]

  constructor(private queryService: QueryService, @Inject(DOCUMENT) private document: Document) {
    this.QBteamId = localStorage.getItem("selectedTeam");
    this.QBsportId = localStorage.getItem("selectedSport");
    this.QBteamName = localStorage.getItem("teamText");
    this.QBteamColors = this.QBshared.teamColors;
  }


  ngOnInit(): void {
    this.queryService.getAllTeams().subscribe((teams: any) => {

      let teamCode = Number(this.QBteamId);
      this.QBteams = teams
        .reduce((result: any[], item: any) => item.code !== teamCode ? result.concat({ name: item.name, value: item.code }) : result, []);
      this.playersConfig = {
        entities: [
          {
            name: "Player",
            fields: [
              {
                name: "Player Name", type: "string", entity: "Player", field: "name",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "contains", value: "$regex" },
                  { name: "like", value: "" },
                ]
              },
              {
                name: "Class",
                type: "category",
                entity: "Player",
                field: "games.playerClass",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
                defaultValue: "FR",
                options: [
                  {
                    "name": "FR", "value": "FR"
                  }, {
                    "name": "SO", "value": "SO"
                  }, {
                    "name": "JR", "value": "JR"
                  }, {
                    "name": "SR", "value": "SR"
                  }
                ]
              },
              {
                name: "Jersey #",
                type: "number",
                entity: "Player",
                field: "games.uniform",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "contains", value: "$regex" },
                  { name: "like", value: "" },
                ],
              },
              {
                name: "OPOS",
                type: "number",
                entity: "Player",
                field: "games.pos.pos",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "contains", value: "$regex" },
                  { name: "like", value: "" },
                ],
              }]
          },
          {
            name: "Opponent", fields: [
              {
                name: "Opponent Name",
                type: "category",
                entity: "Opponent",
                field: "games.opponentCode",
                options: this.QBteams,
                defaultValue: this.QBteams[0].value,
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
              },
              {
                name: "Conference Name",
                entity: "Opponent",
                field: "games.opponentConference",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
                type: "category",
                options: [
                  { name: "Big Ten Conference", value: "Big Ten Conference" },
                  {
                    name: "Mid-American Conference",
                    value: "Mid-American Conference"
                  },
                  {
                    name: "Atlantic Coast Conference",
                    value: "Atlantic Coast Conference"
                  },
                  { name: "Big 12 Conference", value: "Big 12 Conference" },
                  {
                    name: "American Athletic Conference",
                    value: "American Athletic Conference"
                  },
                  { name: "Pac-12 Conference", value: "Pac-12 Conference" },
                  {
                    name: "Mountain West Conference",
                    value: "Mountain West Conference"
                  },
                  {
                    name: "Division 1 FBS Independents",
                    value: "Division 1 FBS Independents"
                  },
                  { name: "Conference USA", value: "Conference USA" },
                  {
                    name: "Southeastern Conference",
                    value: "Southeastern Conference"
                  },
                  {
                    name: "Ohio Valley Conference",
                    value: "Ohio Valley Conference"
                  },
                  {
                    name: "Missouri Valley Conference",
                    value: "Missouri Valley Conference"
                  },
                  { name: "Big Sky Conference", value: "Big Sky Conference" },
                  { name: "Sun Belt Conference", value: "Sun Belt Conference" },
                  { name: "Southern Conference", value: "Southern Conference" },
                  { name: "Big South Conference", value: "Big South Conference" },
                  { name: "FCS Independent", value: "FCS Independent" },
                  {
                    name: "Western Athletic Conference",
                    value: "Western Athletic Conference"
                  },
                  { name: "Southland Conference", value: "Southland Conference" },
                  {
                    name: "Division I-A Independent",
                    value: "Division I-A Independent"
                  },
                  { name: "Big East Conference", value: "Big East Conference" },
                  { name: "Big West Conference", value: "Big West Conference" },
                  {
                    name: "Mid-Eastern Athletic Conference",
                    value: "Mid-Eastern Athletic Conference"
                  },
                  {
                    name: "Southwestern Athletic Conference",
                    value: "Southwestern Athletic Conference"
                  },
                  { name: "Independent", value: "Independent" },
                  { name: "Div. I-A Independent", value: "Div. I-A Independent" },
                  {
                    name: "Atlantic 10 Conference",
                    value: "Atlantic 10 Conference"
                  },
                  { name: "Missouri Valley", value: "Missouri Valley" },
                  {
                    name: "NCAA Division I-A independent",
                    value: "NCAA Division I-A independent"
                  },
                  { name: "Southwest Conference", value: "Southwest Conference" }
                ],
                defaultValue: "Big Ten Conference"

              },
              {
                name: "Division Name",
                entity: "Opponent",
                field: "games.opponentConferenceDivision",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
                type: "category",
                options: [
                  { name: "West", value: "West" },
                  { name: "East", value: "East" },
                  { name: "Atlantic", value: "Atlantic" },
                  { name: "South", value: "South" },
                  { name: "Coastal", value: "Coastal" },
                  { name: "North", value: "North" },
                  { name: "Mountain", value: "Mountain" },
                  { name: "West Division", value: "West Division" },
                  { name: "East Division", value: "East Division" },
                  { name: "Atlantic Division", value: "Atlantic Division" }
                ],
                defaultValue: "West"
              },]
          },
          {
            name: "Date", fields: [
              {
                name: "Season",
                type: "number",
                entity: "Date",
                field: "games.season",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
              },
              {
                name: "Date",
                type: "date",
                entity: "Date",
                field: "games.actualDate",
                format: "MM/DD/YYYY",
                operators: [{ name: "=", value: "$eq" }],
              },
            ]
          },
          {
            name: "Games", fields: [
              {
                name: "Games Played",
                type: "number",
                entity: "Games",
                field: "games.gp",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Games Started",
                type: "number",
                entity: "Games",
                field: "games.gs",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Minutes Played",
                type: "number",
                entity: "Games",
                field: "games.stats.misc.minutes",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Goal Types", fields: [
              {
                name: "First Goal (of the game)",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.fg",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Unassisted Goal",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.ua",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shoot Out Goal",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.so",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Game Tying Goal",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.gt",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Game Winning Goal",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.gw",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Third Goal of the Game",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.hat",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Goal in Overtime",
                type: "number",
                entity: "GoalTypes",
                field: "games.stats.goaltype.ot",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Goalie", fields: [
              {
                name: "Goals Allowed",
                type: "number",
                entity: "Goalie",
                field: "games.stats.goalie.ga",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Saves",
                type: "number",
                entity: "Goalie",
                field: "games.stats.goalie.saves",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shut outs",
                type: "number",
                entity: "Goalie",
                field: "games.stats.goalie.shutout",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shots Faced",
                type: "number",
                entity: "Goalie",
                field: "games.stats.goalie.sf",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Miscellaneous", fields: [
              {
                name: "Penalty Kicks - G",
                type: "number",
                entity: "Miscellaneous",
                field: "games.stats.shots.ps",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Penalty Kicks - Att",
                type: "number",
                entity: "Miscellaneous",
                field: "games.stats.shots.psatt",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Penalties", fields: [
              {
                name: "Fouls",
                type: "number",
                entity: "Penalties",
                field: "games.stats.planty.fouls",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Yellow Card",
                type: "number",
                entity: "Penalties",
                field: "games.stats.planty.yellow",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Red Card",
                type: "number",
                entity: "Penalties",
                field: "games.stats.planty.red",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Scoring", fields: [
              {
                name: "Goals",
                type: "number",
                entity: "Scoring",
                field: "games.stats.shots.g",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Assists",
                type: "number",
                entity: "Scoring",
                field: "games.stats.shots.a",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Shots", fields: [
              {
                name: "Shots",
                type: "number",
                entity: "Scoring",
                field: "games.stats.shots.sh",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shots on Goal",
                type: "number",
                entity: "Scoring",
                field: "games.stats.shots.sog",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          }
        ],
      };

      this.teamGameConfig = {
        entities: [
          {
            name: "Date",
            fields: [
              {
                name: "Season", type: "number", entity: "Date", field: "season",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                ],
              },
              { name: "Date", type: "date", entity: "Date", field: "actualDate", operators: [{ name: "=", value: "$eq" }], format: "MM/DD/YYYY" },
            ]
          },
          {
            name: "Opponent", fields: [
              {
                name: "Opponent Name",
                type: "category",
                entity: "Opponent",
                field: "opponentCode",
                options: this.QBteams,
                defaultValue: this.QBteams[0].value,
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
              },
              {
                name: "Conference Name",
                entity: "Opponent",
                field: "opponentConference",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
                type: "category",
                options: [
                  { name: "Big Ten Conference", value: "Big Ten Conference" },
                  {
                    name: "Mid-American Conference",
                    value: "Mid-American Conference"
                  },
                  {
                    name: "Atlantic Coast Conference",
                    value: "Atlantic Coast Conference"
                  },
                  { name: "Big 12 Conference", value: "Big 12 Conference" },
                  {
                    name: "American Athletic Conference",
                    value: "American Athletic Conference"
                  },
                  { name: "Pac-12 Conference", value: "Pac-12 Conference" },
                  {
                    name: "Mountain West Conference",
                    value: "Mountain West Conference"
                  },
                  {
                    name: "Division 1 FBS Independents",
                    value: "Division 1 FBS Independents"
                  },
                  { name: "Conference USA", value: "Conference USA" },
                  {
                    name: "Southeastern Conference",
                    value: "Southeastern Conference"
                  },
                  {
                    name: "Ohio Valley Conference",
                    value: "Ohio Valley Conference"
                  },
                  {
                    name: "Missouri Valley Conference",
                    value: "Missouri Valley Conference"
                  },
                  { name: "Big Sky Conference", value: "Big Sky Conference" },
                  { name: "Sun Belt Conference", value: "Sun Belt Conference" },
                  { name: "Southern Conference", value: "Southern Conference" },
                  { name: "Big South Conference", value: "Big South Conference" },
                  { name: "FCS Independent", value: "FCS Independent" },
                  {
                    name: "Western Athletic Conference",
                    value: "Western Athletic Conference"
                  },
                  { name: "Southland Conference", value: "Southland Conference" },
                  {
                    name: "Division I-A Independent",
                    value: "Division I-A Independent"
                  },
                  { name: "Big East Conference", value: "Big East Conference" },
                  { name: "Big West Conference", value: "Big West Conference" },
                  {
                    name: "Mid-Eastern Athletic Conference",
                    value: "Mid-Eastern Athletic Conference"
                  },
                  {
                    name: "Southwestern Athletic Conference",
                    value: "Southwestern Athletic Conference"
                  },
                  { name: "Independent", value: "Independent" },
                  { name: "Div. I-A Independent", value: "Div. I-A Independent" },
                  {
                    name: "Atlantic 10 Conference",
                    value: "Atlantic 10 Conference"
                  },
                  { name: "Missouri Valley", value: "Missouri Valley" },
                  {
                    name: "NCAA Division I-A independent",
                    value: "NCAA Division I-A independent"
                  },
                  { name: "Southwest Conference", value: "Southwest Conference" }
                ],
                defaultValue: "Big Ten Conference"

              },
              {
                name: "Division Name",
                entity: "Opponent",
                field: "opponentConferenceDivision",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: "in", value: "$in" },
                  { name: "not in", value: "$nin" },
                ],
                type: "category",
                options: [
                  { name: "West", value: "West" },
                  { name: "East", value: "East" },
                  { name: "Atlantic", value: "Atlantic" },
                  { name: "South", value: "South" },
                  { name: "Coastal", value: "Coastal" },
                  { name: "North", value: "North" },
                  { name: "Mountain", value: "Mountain" },
                  { name: "West Division", value: "West Division" },
                  { name: "East Division", value: "East Division" },
                  { name: "Atlantic Division", value: "Atlantic Division" }
                ],
                defaultValue: "West"
              }]
          },
          {
            name: "Goal Breakdown", fields: [
              {
                name: "Total Goals",
                type: "number",
                entity: "GoalBreakdown",
                field: "totals.otherStats.score",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Unassisted",
                type: "number",
                entity: "GoalBreakdown",
                field: "totals.goaltype.ua",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Overtime",
                type: "number",
                entity: "GoalBreakdown",
                field: "totals.goaltype.ot",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Goal Types", fields: [
              {
                name: "First Goal (of the game)",
                type: "number",
                entity: "GoalTypes",
                field: "totals.goaltype.fg",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shoot Out Goal",
                type: "number",
                entity: "GoalTypes",
                field: "totals.goaltype.so",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Game Tying Goal",
                type: "number",
                entity: "GoalTypes",
                field: "totals.goaltype.gt",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
                defaultValue: 0
              },
              {
                name: "Game Winning Goal",
                type: "number",
                entity: "GoalTypes",
                field: "totals.goaltype.gw",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
                defaultValue: 0
              },
              {
                name: "Third Goal of the Game",
                type: "number",
                entity: "GoalTypes",
                field: "totals.goaltype.hat",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$in" },
                  { name: ">=", value: "$nin" },
                  { name: "<", value: "$nin" },
                  { name: "<=", value: "$nin" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Miscellaneous", fields: [
              {
                name: "Saves",
                type: "number",
                entity: "Miscellaneous",
                field: "totals.misc.dsave",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Goals off Corner",
                type: "number",
                entity: "Miscellaneous",
                field: "totals.otherStats.corners",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Penalty Kick - G",
                type: "number",
                entity: "Miscellaneous",
                field: "totals.shots.ps",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Penalty Kick - Att",
                type: "number",
                entity: "Miscellaneous",
                field: "totals.shots.psatt",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Offsides",
                type: "number",
                entity: "Miscellaneous",
                field: "totals.otherStats.offsides",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Penalty Kicks", fields: [
              {
                name: "Fouls",
                type: "number",
                entity: "PenaltyKicks",
                field: "totals.planty.fouls",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Yellow Card",
                type: "number",
                entity: "PenaltyKicks",
                field: "totals.planty.yellow",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Red Card",
                type: "number",
                entity: "PenaltyKicks",
                field: "totals.planty.red",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
          {
            name: "Shot Statistics", fields: [
              {
                name: "Goals",
                type: "number",
                entity: "ShotStatistics",
                field: "totals.shots.g",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Shots on goal att",
                type: "number",
                entity: "ShotStatistics",
                field: "totals.shots.sog",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
              {
                name: "Assists",
                type: "number",
                entity: "ShotStatistics",
                field: "totals.shots.a",
                operators: [
                  { name: "=", value: "$eq" },
                  { name: "!=", value: "$ne" },
                  { name: ">", value: "$gt" },
                  { name: ">=", value: "$gte" },
                  { name: "<", value: "$lt" },
                  { name: "<=", value: "$lte" },
                  { name: "is null", value: "" },
                  { name: "is not null", value: "" },
                ],
                defaultValue: 0
              },
            ]
          },
        ]
      };

      if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
        this.Field = [{
          category: 'Player',
          statistic: "name",
          operators: "=",
          values: "",
          condition: "",
        }];

        this.Group = [{
          condition: "",
          Field: [{
            category: 'Player',
            statistic: "name",
            operators: "=",
            values: "",
          }]
        }]

        this.QBsplitSectionChange("players");
      } else {
        this.Field = [{
          category: 'Date',
          statistic: "season",
          operators: "=",
          values: "",
          condition: "",
        }];

        this.Group = [{
          condition: "",
          Field: [{
            category: 'Date',
            statistic: "season",
            operators: "=",
            values: "",
          }]
        }]

        this.QBsplitSectionChange("teamGames");
      }

    });
  }

  public QBsplitSectionChange(eventSplit: any) {
    this.query.rules = [];
    this.QBresults = [];
    this.QBshowResults = false;
    this.mongoDbPipeline = {};
    this.sortByField = {};
    this.QBselectedSplit = eventSplit;
    this.GroupTeamCategory = eventSplit;
    if (this.QBentity == "game" && eventSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else if (this.QBentity == "period" && eventSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else if (this.QBentity == "game" && eventSplit == "players") {
      this.config = this.playersConfig;
    }
    else if (this.QBentity == "period" && eventSplit == "players") {
      this.config = this.playersConfig;
    }
  }

  public QBonEntityChange(event: any) {
    this.query.rules = [];
    this.QBresults = [];
    this.QBshowResults = false;
    this.mongoDbPipeline = {};
    this.sortByField = {};
    this.QBentity = event;
    if (event == "game" && this.QBselectedSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else if (event == "period" && this.QBselectedSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else if (event == "game" && this.QBselectedSplit == "players") {
      this.config = this.playersConfig;
    } else if (event == "period" && this.QBselectedSplit == "players") {
      this.config = this.playersConfig;
    }
  }

  addfield = () => {
    // this.count += 1;
    if (this.Field.length >= 4) {
      this.QBmessage = "We Can Add Only Four Condition's";
      this.QBshowResults = true;
      return;
    }

    if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
      this.Field = [...this.Field, {
        category: 'Player',
        statistic: "name",
        operators: "=",
        values: "",
        condition: "",
      }];
    } else {
      this.Field = [...this.Field, {
        category: 'Date',
        statistic: "season",
        operators: "=",
        values: "",
        condition: "",
      }];
    }

    // this.Field=[...this.Field,{
    //   category:'Player',
    //   statistic: "name",
    //   operators: "=",
    //   values:"",
    //   condition:"",
    // }]
  }

  delField = (i: any, e: any) => {
    if (this.Field.length == 1) {
      return;
    }
    this.count = i;
    this.QBshowResults = false;
    let FielsDta = [...this.Field];
    FielsDta.splice(i, 1);
    this.Field = FielsDta;
  }

  handledropTextChanges(i: any, e: any, type: any) {
    const value = e.value;
    let fieldDta = [...this.Field];
    switch (type) {
      case 'category':
        let categorys = this.config.entities.find((x: any) => x.name == fieldDta[i].category).fields;
        fieldDta[i] = { ...fieldDta[i], category: value, statistic: categorys[0].field, values: categorys.type == "category" ? categorys.defaultValue : "" };
        break;
      case 'statistic':
        let category = this.config.entities.find((x: any) => x.name == fieldDta[i].category).fields;
        let stats = category.find((g: any) => g.field == value);

        fieldDta[i] = { ...fieldDta[i], statistic: value, values: stats.type == "category" ? stats.defaultValue : "" };
        break;
      case 'operators':
        fieldDta[i] = { ...fieldDta[i], operators: value };
        break;
      case 'values':
        fieldDta[i] = { ...fieldDta[i], values: value };
        break;
      default:
        break;
    }
    this.Field = fieldDta;
  }
  handleTextChanges(i: any, e: any, type: any) {
    const { name, value } = e.source ? e.source : e.target;
    let fieldDta = [...this.Field];
    switch (type) {
      case 'number':
        fieldDta[i] = { ...fieldDta[i], [name]: parseInt(value) };
        break;
      default:
        fieldDta[i] = { ...fieldDta[i], [name]: value };
        break;
    }
    this.Field = fieldDta
  }

  handleaddgroup() {
    if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
      this.Group = [...this.Group, {
        condition: "",
        Field: [{
          category: 'Player',
          statistic: "name",
          operators: "=",
          values: "",
        }]
      }]
    } else {
      this.Group = [...this.Group, {
        condition: "",
        Field: [{
          category: 'Date',
          statistic: "season",
          operators: "=",
          values: "",
        }]
      }]
    }


  }
  handleViewResult(i: any) {
    var validatedata: any = this.Field[i];
    for (var key in validatedata) {
      if (validatedata[key] == "") {
        switch (key) {
          case 'category':
            this.QBmessage = "category is required";
            this.QBshowResults = true;
            break;
          case 'statistic':
            this.QBmessage = "statistic is required";
            this.QBshowResults = true;
            break;
          case 'operators':
            this.QBmessage = "operator is required";
            this.QBshowResults = true;
            break;
          case 'values':
            this.QBmessage = "value is required";
            this.QBshowResults = true;
            break;
          case 'condition':
            this.QBmessage = "condition is required";
            this.QBshowResults = true;
            break;
          default:
            this.QBmessage = "fill required field";
            this.QBshowResults = true;
            break;
        }
        return;
      }
    }
    this.query = {
      condition: validatedata.condition,
      rules: [{ entity: validatedata.category, field: validatedata.statistic, operator: validatedata.operators, value: validatedata.values }]
    };

    this.convertToMongodbPipeline();
  }

  public convertToMongodbPipeline() {
    let forkResults: boolean = false;
    this.QBspinner = true;
    this.QBresults = [];
    this.QBshowResults = false;
    this.mongoDbPipeline = {};
    this.sortByField = {};
    if (this.QBselectedSplit == "players") {
      this.projections = {
        PlayerName: "$name",
        OppCode: "$games.opponentCode",
        OppName: "$games.opponentName",
        GameDate: "$games.gameDate",
        Season: "$games.season",
        Class: "$games.playerClass",
        Position: "$games.pos",
      };
    } else {
      this.projections = {
        Name: "$name",
        OppCode: "$opponentCode",
        OppName: "$opponentName",
        GameDate: "$gameDate",
        Season: "$season",
      };
    }
    if (this.QBentity !== "game" && this.QBselectedSplit == "players") this.projections["TimeBucket"] = "$games.prdStats.prd";
    if (this.QBentity !== "game" && this.QBselectedSplit == "teamGames") this.projections["TimeBucket"] = "$totals.prdStats.prd";
    const conditions: { [key: string]: string } = { and: "$and", or: "$or" };
    const operators: { [key: string]: string } = {
      "=": "$eq",
      "!=": "$ne",
      "<": "$lt",
      "<=": "$lte",
      ">": "$gt",
      ">=": "$gte",
      "in": "$in",
      "not in": "$nin",
      contains: "$regex"
    };
    const mapRule = (rule: any) => {
      let field = rule.field;
      let value =
        rule.field == rule.field.indexOf("actualDate") > -1
          ? moment(rule.value).format("M/D/YYYY")
          : rule.value;
      let projectionField = this.projectionObject[field];
      if (!this.projections[projectionField] && rule.field !== "games.pos" && rule.field !== "pos.pos" && rule.field !== "games.opponentCode" && rule.field !== "opponentCode") {
        this.projections[projectionField] = { "$ifNull": ["$" + field, Number(0)] };
        this.sortByField[projectionField] = -1;
        forkResults = forkResults == false && (rule.entity == "Player" || rule.entity == "Opponent" || rule.entity == "Date") ? false : true;
      }
      const operator = operators[rule.operator]
        ? operators[rule.operator]
        : "$eq";
      return { [field]: { [operator]: value } };
    };

    const mapRuleSet = (ruleSet: any) => {
      return {
        [conditions[ruleSet.condition]]: ruleSet.rules.map((rule: any) =>
          rule.operator ? mapRule(rule) : mapRuleSet(rule)
        )
      };
    };
    let mongoDbQuery = mapRuleSet(this.query);
    this.QBshowResults = false;
    this.mongoDbPipeline = mongoDbQuery;
    if (forkResults) {
      this.getResults();
    }
    else {
      this.QBspinner = false;
      this.QBshowResults = true;
      this.QBmessage = "Please select any stat field to view the results.";
    }
  }

  public getResults() {
    let teamProperty = this.QBselectedSplit == "players" ? "teamCode" : "code";
    let teamMatch: any[] = [{ [teamProperty]: Number(this.QBteamId) }, { "sportCode": this.QBsportId }];
    let finalPipeline: any = [];
    if (!this.sortByField["GameDate"]) {
      this.sortByField["GameDate"] = -1;
    }
    finalPipeline.push({
      $match: {
        $and: teamMatch
      }
    });


    if (this.QBselectedSplit == "players") {
      finalPipeline.push({ $unwind: "$games" });
    }
    if (this.QBentity !== "game" && this.QBselectedSplit == "teamGames") {
      finalPipeline.push({ $unwind: "$totals.prdStats" });
    }
    finalPipeline.push({ $match: this.mongoDbPipeline });
    finalPipeline.push({ $project: this.projections });
    finalPipeline.push({ $sort: this.sortByField });
    finalPipeline.push({ $limit: 25 });
    var mongoDBDiv = document.getElementById('mongoQB')!;
    console.log(mongoDBDiv.style.height);
    this.queryService
      .getQueryResults(this.QBselectedSplit, JSON.stringify(finalPipeline))
      .subscribe(
        (results: any) => {
          let seasonCorrectionResults = results.map((x: any) => {
            x["Season"] = x["Season"] && x["Season"] !== "NaN" ? x["Season"] + '-' + (Number(x["Season"]) + 1).toString().substr(-2) : "NA";
            return x;
          });
          this.QBresults = results;
          this.QBshowResults = true;
          this.QBspinner = false;
          this.QBmessage = "No results found.";
        },
        err => {
          this.QBspinner = false;
          this.QBshowResults = true;
          this.QBmessage =
            "Error occurred in query please add rules and give appropriate fields and retry";
        }
      );
  }

  // Grouping Query start
  grouphandleTextChanges(i: any, e: any) {
    const { name, value } = e.source;
    let fieldDta = [...this.Group];
    fieldDta[i] = { ...fieldDta[i], [name]: value };
    this.Group = fieldDta;
  }

  delGroup = (i: any, e: any) => {
    let FielsDta = [...this.Group];
    FielsDta.splice(i, 1);
    this.Group = FielsDta;
  }
  addGroupfield = (i: any) => {
    if (this.Group[i].Field.length >= 4) {
      this.QBmessage = "We Can Add Only Four Condition's";
      this.QBshowResults = true;
      return;
    }

    if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
      this.Group[i].Field = [...this.Group[i].Field, {
        category: 'Player',
        statistic: "name",
        operators: "=",
        values: "",
      }]
    }
    else {
      this.Group[i].Field = [...this.Group[i].Field, {
        category: 'Date',
        statistic: "season",
        operators: "=",
        values: "",
      }]
    }
  }

  delGroupField = (i: any, j: any, e: any) => {
    let FielsDta = [...this.Group[i].Field];
    FielsDta.splice(j, 1);
    this.Group[i].Field = FielsDta;
  }

  handledropGroupTextChanges(i: any, j: any, e: any, type: any) {
    let value: any;
    if (type == "category") {
      value = e.value; //e.target.options[e.target.options.selectedIndex].value;
    } else {
      value = e.value ? e.value : e.target.value;
    }

    let fieldDta = [...this.Group[i].Field];
    switch (type) {
      case 'category':
        let categorys = this.config.entities.find((x: any) => x.name == fieldDta[j].category).fields;
        fieldDta[j] = { ...fieldDta[j], category: value, statistic: categorys[0].field, values: categorys[0].type == "category" ? categorys[0].defaultValue : "" };
        break;
      case 'statistic':
        let category = this.config.entities.find((x: any) => x.name == fieldDta[j].category).fields;
        let stats = category.find((g: any) => g.field == value);

        fieldDta[j] = { ...fieldDta[j], statistic: value, values: stats.type == "category" ? stats.defaultValue : "" };
        break;
      case 'operators':
        fieldDta[j] = { ...fieldDta[j], operators: value };
        break;
      case 'values':
        fieldDta[j] = { ...fieldDta[j], values: value };
        break;
      case 'number':
        fieldDta[j] = { ...fieldDta[j], values: parseInt(value) };
        break;
      default:
        break;
    }
    this.Group[i].Field = fieldDta;
  }

  handleGroupViewResult(i: any) {
    let pipeline: any = {}
    var validatedata: any = this.Group[i];

    for (var key in validatedata) {
      switch (key) {
        case "condition":
          if (validatedata.condition == "") {
            this.QBmessage = "condition is required";
            this.QBshowResults = true;
            return;
          }
          break;


        case "Field":
          for (var e in validatedata.Field) {
            if (validatedata.Field[e].category == "") {
              this.QBmessage = "category is required";
              this.QBshowResults = true;
              return;
            }
            else if (validatedata.Field[e].operators == "") {
              this.QBmessage = "operator is required";
              this.QBshowResults = true;
              return;
            }
            else if (validatedata.Field[e].statistic == "") {
              this.QBmessage = "statistic is required";
              this.QBshowResults = true;
              return;
            }
            else if (validatedata.Field[e].values == "") {
              this.QBmessage = "value is required";
              this.QBshowResults = true;
              return;
            }
          }
      }
    }

    this.query = {
      condition: validatedata.condition,
      rules: []
    };
    validatedata.Field.forEach((e: any) => {
      let results = { entity: e.category, field: e.statistic, operator: e.operators, value: e.values };
      this.query.rules.push(results);
    });
    this.convertToMongodbPipeline();
  }
}