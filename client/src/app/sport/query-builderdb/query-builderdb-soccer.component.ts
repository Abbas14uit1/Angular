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
  selector: "app-query-builderdb-soccer",
  templateUrl: "./query-builderdb-soccer.component.html",
  styleUrls: ["./query-builderdb-soccer.component.css"],
  providers: [QueryService]
})
export class QueryBuilderdbSoccerComponent implements OnInit {
  @ViewChild(QueryBuilderResultsComponent) child: QueryBuilderResultsComponent;
  public headerConfig = HeaderConfig;
  public QBresults: any[];
  public QBteamColors: any;
  public QBteamId: any;
  public QBsportId: any;
  public QBteamName: any;
  public mongoDbPipeline: any;
  public QBteams: any;
  public QBshared: TeamColors = new TeamColors();
  public QBspinner: boolean = false;
  public QBshowResults: boolean = false;
  public QBmessage: string = "No results found";
  public QBTime: string = "Prd";
  public QBentities = [
    { value: "game", viewValue: "Game ", checked: true },
    { value: "period", viewValue: "Period", checked: false },
  ];
  public QBentity: string = this.QBentities[0].value;
  public QBselectedSplit: string;
  public query: any = {
    condition: "and",
    rules: [
    ]
  };
  public playersConfig: any = {};
  public playersPrdConfig: any = {};
  public teamGameConfig: any = {};
  public teamPrdConfig: any = {};
  public projections: any = {};
  public sortByField: any = {};
  public projectionObject: any = projectedFieldsSoccer;
  public config: QueryBuilderConfig;
  public bootstrapClassNames: QueryBuilderClassNames = {
    switchRow: 'd-flex px-2',
    switchGroup: 'mat-radio-group qb-radio-group ',
    switchRadio: 'mat-radio-button mat-info with-gap',
    switchLabel: 'mat-radio-label qb-radio-label',
    entityControl: 'mat-select',
    entityControlSize: 'mat-input-wrapper mat-form-field-wrapper mat-input-flex qb-entity-control',
    ruleSet: 'border',
    invalidRuleSet: 'alert alert-danger',
  }
  constructor(private queryService: QueryService, @Inject(DOCUMENT) private document: Document) {
    this.QBteamId = localStorage.getItem("selectedTeam");
    this.QBsportId = localStorage.getItem("selectedSport");
    this.QBteamName = localStorage.getItem("teamText");
    this.QBteamColors = this.QBshared.teamColors;
  }

  public ngOnInit() {
    localStorage.setItem(
      "headerTitle",
      localStorage.getItem("entity") + "- " + localStorage.getItem("sportText")
    );
    this.queryService.getAllTeams().subscribe((teams: any) => {
      let teamCode = Number(this.QBteamId);
      this.QBteams = teams
        .reduce((result: any[], item: any) => item.code !== teamCode ? result.concat({ name: item.name, value: item.code }) : result, []);
      this.playersConfig = {
        entities: {
          Player: { name: "Player" },
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Games: { name: "Games" },
          GoalTypes: { name: "Goal Types" },
          Goalie: { name: "Goalie" },
          Miscellaneous: { name: "Miscellaneous" },
          Penalties: { name: "Penalties" },
          Scoring: { name: "Scoring" },
          Shots: { name: "Shots" }
        },
        fields: {
          name: { name: "Player Name", type: "string", entity: "Player" },
          "games.playerClass": {
            name: "Class",
            type: "category",
            entity: "Player",
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
          "games.uniform": {
            name: "Jersey #",
            type: "string",
            entity: "Player"
          },
          "games.pos.pos": {
            name: "OPOS",
            type: "string",
            entity: "Player"
          },
          "games.opponentCode": {
            name: "Opponent Name",
            type: "category",
            options: this.QBteams,
            entity: "Opponent",
            defaultValue: this.QBteams[0].value
          },
          "games.opponentConference": {
            name: "Conference Name",
            entity: "Opponent",
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
          "games.opponentConferenceDivision": {
            name: "Division Name",
            entity: "Opponent",
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
          },
          "games.season": { name: "Season", type: "number", entity: "Date" },
          "games.actualDate": {
            name: "Date",
            type: "date",
            entity: "Date",
            operators: ["="],
            format: "MM/DD/YYYY"
          },

          //games
          "games.gp": { entity: "Games", name: "Games Played", type: "number", defaultValue: 0, nullable: true },
          "games.gs": { entity: "Games", name: "Games Started", type: "number", defaultValue: 0, nullable: true },
          "games.stats.misc.minutes": { entity: "Games", name: "Minutes Played", type: "number", defaultValue: 0, nullable: true },

          //GoalTypes
          "games.stats.goaltype.fg": { entity: "GoalTypes", name: "First Goal (of the game)", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.ua": { entity: "GoalTypes", name: "Unassisted Goal", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.so": { entity: "GoalTypes", name: "Shoot Out Goal", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.gt": { entity: "GoalTypes", name: "Game Tying Goal", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.gw": { entity: "GoalTypes", name: "Game Winning Goal", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.hat": { entity: "GoalTypes", name: "Third Goal of the Game", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goaltype.ot": { entity: "GoalTypes", name: "Goal in Overtime", type: "number", defaultValue: 0, nullable: true },
          
          //Goalie 
          "games.stats.goalie.ga": { entity: "Goalie", name: "Goals Allowed", type: "number", defaultValue: 0, nullable: true },
          //"games.stats.goaltype.ot": { entity: "Goalie", name: "Goals Allowed Avg", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goalie.saves": { entity: "Goalie", name: "Saves", type: "number", defaultValue: 0, nullable: true },
          //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save %", type: "number", defaultValue: 0, nullable: true },
          //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save Ration", type: "number", defaultValue: 0, nullable: true },
          //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save Avg", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goalie.shutout": { entity: "Goalie", name: "Shut outs", type: "number", defaultValue: 0, nullable: true },
          "games.stats.goalie.sf": { entity: "Goalie", name: "Shots Faced", type: "number", defaultValue: 0, nullable: true },

          //Miscellaneous
          //"games.stats.goaltype.gw": { entity: "Miscellaneous", name: "Game Winning Goals", type: "number", defaultValue: 0, nullable: true },
          "games.stats.shots.ps": { entity: "Miscellaneous", name: "Penalty Kicks - G", type: "number", defaultValue: 0, nullable: true },
          "games.stats.shots.psatt": { entity: "Miscellaneous", name: "Penalty Kicks - Att", type: "number", defaultValue: 0, nullable: true },

          //Penalties
          "games.stats.planty.fouls": { entity: "Penalties", name: "Fouls", type: "number", defaultValue: 0, nullable: true },
          "games.stats.planty.yellow": { entity: "Penalties", name: "Yellow Card", type: "number", defaultValue: 0, nullable: true },
          "games.stats.planty.red": { entity: "Penalties", name: "Red Card", type: "number", defaultValue: 0, nullable: true },
          
          //Scoring
          "games.stats.shots.g": { entity: "Scoring", name: "Goals", type: "number", defaultValue: 0, nullable: true },
          "games.stats.shots.a": { entity: "Scoring", name: "Assists", type: "number", defaultValue: 0, nullable: true },

          //Shots
          "games.stats.shots.sh": { entity: "Shots", name: "Shots", type: "number", defaultValue: 0, nullable: true },
          "games.stats.shots.sog": { entity: "Shots", name: "Shots on Goal", type: "number", defaultValue: 0, nullable: true },
        }
      };
      this.playersPrdConfig = {
        entities: {
          Player: { name: "Player" },
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Games: { name: "Games" },
          GoalTypes: { name: "Goal Types" },
          Goalie: { name: "Goalie" },
          Miscellaneous: { name: "Miscellaneous" },
          Penalties: { name: "Penalties" },
          Scoring: { name: "Scoring" },
          Shots: { name: "Shots" }
        },
        fields: {
          name: { name: "Player Name", type: "string", entity: "Player" },
          "games.playerClass": {
            name: "Class",
            type: "category",
            entity: "Player",
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
          "games.uniform": {
            name: "Jersey #",
            type: "string",
            entity: "Player"
          },
          "games.pos.pos": {
            name: "OPOS",
            type: "string",
            entity: "Player"
          },
          "games.opponentCode": {
            name: "Opponent Name",
            type: "category",
            options: this.QBteams,
            entity: "Opponent",
            defaultValue: this.QBteams[0].value
          },
          "games.opponentConference": {
            name: "Conference Name",
            entity: "Opponent",
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
          "games.opponentConferenceDivision": {
            name: "Division Name",
            entity: "Opponent",
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
          },
          "games.season": { name: "Season", type: "number", entity: "Date" },
          "games.actualDate": {
            name: "Date",
            type: "date",
            entity: "Date",
            operators: ["="],
            format: "MM/DD/YYYY"
          },
           //games
           "games.gp": { entity: "Games", name: "Games Played", type: "number", defaultValue: 0, nullable: true },
           "games.gs": { entity: "Games", name: "Games Started", type: "number", defaultValue: 0, nullable: true },
           "games.stats.misc.minutes": { entity: "Games", name: "Minutes Played", type: "number", defaultValue: 0, nullable: true },
 
           //GoalTypes
           "games.stats.goaltype.fg": { entity: "GoalTypes", name: "First Goal (of the game)", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.ua": { entity: "GoalTypes", name: "Unassisted Goal", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.so": { entity: "GoalTypes", name: "Shoot Out Goal", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.gt": { entity: "GoalTypes", name: "Game Tying Goal", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.gw": { entity: "GoalTypes", name: "Game Winning Goal", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.hat": { entity: "GoalTypes", name: "Third Goal of the Game", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goaltype.ot": { entity: "GoalTypes", name: "Goal in Overtime", type: "number", defaultValue: 0, nullable: true },
           
           //Goalie 
           "games.stats.goalie.ga": { entity: "Goalie", name: "Goals Allowed", type: "number", defaultValue: 0, nullable: true },
           //"games.stats.goaltype.ot": { entity: "Goalie", name: "Goals Allowed Avg", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goalie.saves": { entity: "Goalie", name: "Saves", type: "number", defaultValue: 0, nullable: true },
           //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save %", type: "number", defaultValue: 0, nullable: true },
           //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save Ration", type: "number", defaultValue: 0, nullable: true },
           //"games.stats.goaltype.ot": { entity: "Goalie", name: "Save Avg", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goalie.shutout": { entity: "Goalie", name: "Shut outs", type: "number", defaultValue: 0, nullable: true },
           "games.stats.goalie.sf": { entity: "Goalie", name: "Shots Faced", type: "number", defaultValue: 0, nullable: true },
 
           //Miscellaneous
           //"games.stats.goaltype.gw": { entity: "Miscellaneous", name: "Game Winning Goals", type: "number", defaultValue: 0, nullable: true },
           "games.stats.shots.ps": { entity: "Miscellaneous", name: "Penalty Kicks - G", type: "number", defaultValue: 0, nullable: true },
           "games.stats.shots.psatt": { entity: "Miscellaneous", name: "Penalty Kicks - Att", type: "number", defaultValue: 0, nullable: true },
 
           //Penalties
           "games.stats.planty.fouls": { entity: "Penalties", name: "Fouls", type: "number", defaultValue: 0, nullable: true },
           "games.stats.planty.yellow": { entity: "Penalties", name: "Yellow Card", type: "number", defaultValue: 0, nullable: true },
           "games.stats.planty.red": { entity: "Penalties", name: "Red Card", type: "number", defaultValue: 0, nullable: true },
           
           //Scoring
           "games.stats.shots.g": { entity: "Scoring", name: "Goals", type: "number", defaultValue: 0, nullable: true },
           "games.stats.shots.a": { entity: "Scoring", name: "Assists", type: "number", defaultValue: 0, nullable: true },
 
           //Shots
           "games.stats.shots.sh": { entity: "Shots", name: "Shots", type: "number", defaultValue: 0, nullable: true },
           "games.stats.shots.sog": { entity: "Shots", name: "Shots on Goal", type: "number", defaultValue: 0, nullable: true },
        }
      };
      this.teamGameConfig = {
        entities: {
          Date: { name: "Date" },
          Opponent: { name: "Opponent" },
          GoalBreakdown: { name: "Goal Breakdown" },
          GoalTypes: { name: "Goal Types" },
          Miscellaneous: { name: "Miscellaneous" },
          PenaltyKicks: { name: "Penalty Kicks" },
          ShotStatistics: { name: "Shot Statistics" }
        },
        fields: {
          "season": { name: "Season", type: "number", entity: "Date" },
          "actualDate": {
            name: "Date",
            type: "date",
            entity: "Date",
            operators: ["="],
            format: "MM/DD/YYYY"
          },
          "opponentCode": {
            name: "Opponent Name",
            type: "category",
            options: this.QBteams,
            entity: "Opponent",
            defaultValue: this.QBteams[0].value
          },
          "opponentConference": {
            name: "Conference Name",
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
            entity: "Opponent",
            defaultValue: "Big Ten Conference"
          },
          "opponentConferenceDivision": {
            name: "Division Name",
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
            entity: "Opponent",
            defaultValue: "West"
          },

          //GoalBreakdown
          "totals.otherStats.score": { entity: "GoalBreakdown", name: "Total Goals", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.ua": { entity: "GoalBreakdown", name: "Unassisted", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.ot": { entity: "GoalBreakdown", name: "Overtime", type: "number", defaultValue: 0, nullable: true },
          
          //GoalTypes
          "totals.goaltype.fg": { entity: "GoalTypes", name: "First Goal (of the game)", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.so": { entity: "GoalTypes", name: "Shoot Out Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.gt": { entity: "GoalTypes", name: "Game Tying Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.gw": { entity: "GoalTypes", name: "Game Winning Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.hat": { entity: "GoalTypes", name: "Third Goal of the Game", type: "number", defaultValue: 0, nullable: true },
        
          //Miscellaneous
          "totals.misc.dsave": { entity: "Miscellaneous", name: "Saves", type: "number", defaultValue: 0, nullable: true },
          "totals.otherStats.corners": { entity: "Miscellaneous", name: "Goals off Corner", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.ps": { entity: "Miscellaneous", name: "Penalty Kick - G", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.psatt": { entity: "Miscellaneous", name: "Penalty Kick - Att", type: "number", defaultValue: 0, nullable: true },
          "totals.otherStats.offsides": { entity: "Miscellaneous", name: "Offsides", type: "number", defaultValue: 0, nullable: true },

          //PenaltyKicks
          "totals.planty.fouls": { entity: "PenaltyKicks", name: "Fouls", type: "number", defaultValue: 0, nullable: true },
          "totals.planty.yellow": { entity: "PenaltyKicks", name: "Yellow Card", type: "number", defaultValue: 0, nullable: true },
          "totals.planty.red": { entity: "PenaltyKicks", name: "Red Card", type: "number", defaultValue: 0, nullable: true },

          //ShotStatistics
          "totals.shots.g": { entity: "ShotStatistics", name: "Goals", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.sog": { entity: "ShotStatistics", name: "Shots on goal att", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.a": { entity: "ShotStatistics", name: "Assists", type: "number", defaultValue: 0, nullable: true },
        }
      };
      this.teamPrdConfig = {
        entities: {
          Date: { name: "Date" },
          Opponent: { name: "Opponent" },
          GoalBreakdown: { name: "Goal Breakdown" },
          GoalTypes: { name: "Goal Types" },
          Miscellaneous: { name: "Miscellaneous" },
          PenaltyKicks: { name: "Penalty Kicks" },
          ShotStatistics: { name: "Shot Statistics" }
        },
        fields: {
          "season": { name: "Season", type: "number", entity: "Date" },
          "actualDate": {
            name: "Date",
            type: "date",
            entity: "Date",
            operators: ["="],
            format: "MM/DD/YYYY"
          },
          "opponentCode": {
            name: "Opponent Name",
            type: "category",
            options: this.QBteams,
            entity: "Opponent",
            defaultValue: this.QBteams[0].value
          },
          "opponentConference": {
            name: "Conference Name",
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
            entity: "Opponent",
            defaultValue: "Big Ten Conference"
          },
          "opponentConferenceDivision": {
            name: "Division Name",
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
            entity: "Opponent",
            defaultValue: "West"
          },
          "linescore.score": {
            entity: "linescore",
            name: "Linescore",
            type: "number",
            nullable: true
          },
          //GoalBreakdown
          "totals.otherStats.score": { entity: "GoalBreakdown", name: "Total Goals", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.ua": { entity: "GoalBreakdown", name: "Unassisted", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.ot": { entity: "GoalBreakdown", name: "Overtime", type: "number", defaultValue: 0, nullable: true },
          
          //GoalTypes
          "totals.goaltype.fg": { entity: "GoalTypes", name: "First Goal (of the game)", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.so": { entity: "GoalTypes", name: "Shoot Out Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.gt": { entity: "GoalTypes", name: "Game Tying Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.gw": { entity: "GoalTypes", name: "Game Winning Goal", type: "number", defaultValue: 0, nullable: true },
          "totals.goaltype.hat": { entity: "GoalTypes", name: "Third Goal of the Game", type: "number", defaultValue: 0, nullable: true },
        
          //Miscellaneous
          "totals.misc.dsave": { entity: "Miscellaneous", name: "Saves", type: "number", defaultValue: 0, nullable: true },
          "totals.otherStats.corners": { entity: "Miscellaneous", name: "Goals off Corner", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.ps": { entity: "Miscellaneous", name: "Penalty Kick - G", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.psatt": { entity: "Miscellaneous", name: "Penalty Kick - Att", type: "number", defaultValue: 0, nullable: true },
          "totals.otherStats.offsides": { entity: "Miscellaneous", name: "Offsides", type: "number", defaultValue: 0, nullable: true },

          //PenaltyKicks
          "totals.planty.fouls": { entity: "PenaltyKicks", name: "Fouls", type: "number", defaultValue: 0, nullable: true },
          "totals.planty.yellow": { entity: "PenaltyKicks", name: "Yellow Card", type: "number", defaultValue: 0, nullable: true },
          "totals.planty.red": { entity: "PenaltyKicks", name: "Red Card", type: "number", defaultValue: 0, nullable: true },

          //ShotStatistics
          "totals.shots.g": { entity: "ShotStatistics", name: "Goals", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.sog": { entity: "ShotStatistics", name: "Shots on goal att", type: "number", defaultValue: 0, nullable: true },
          "totals.shots.a": { entity: "ShotStatistics", name: "Assists", type: "number", defaultValue: 0, nullable: true },
        }
      };
      
      if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
        this.QBsplitSectionChange("players");
      } else {
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
    if (this.QBentity == "game" && eventSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else if (this.QBentity == "period" && eventSplit == "teamGames") {
      this.config = this.teamPrdConfig;
    }
    else if (this.QBentity == "game" && eventSplit == "players") {
      this.config = this.playersConfig;
    }
    else if (this.QBentity == "period" && eventSplit == "players") {
      this.config = this.playersPrdConfig;
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
      this.config = this.teamPrdConfig;
    }
    else if (event == "game" && this.QBselectedSplit == "players") {
      this.config = this.playersConfig;
    } else if (event == "period" && this.QBselectedSplit == "players") {
      this.config = this.playersPrdConfig;
    }
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
        // {
        //   $cond: [
        //     { $ne: ["$games.pos.opos", null] },
        //     "$games.pos.opos",
        //     //"$games.pos.dpos"
        //   ]
        // }
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
}
