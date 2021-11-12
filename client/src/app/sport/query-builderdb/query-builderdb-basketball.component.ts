import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/platform-browser";
import { QueryBuilderClassNames, QueryBuilderConfig } from "angular2-query-builder";
import { QueryService } from "app/sport/query/query.service";
import * as moment from "moment";
import { HeaderConfig } from "../../shared/header/header.component";
import { QueryBuilderResultsComponent } from "app/sport/query-builderdb/query-builder-results/query-builder-results.component";
import { TeamColors } from "../../shared/team-colors";
import { projectedFieldsBasketball } from "./projectedFields-basketball";

@Component({
  selector: "app-query-builderdb-basketball",
  templateUrl: "./query-builderdb-basketball.component.html",
  styleUrls: ["./query-builderdb-basketball.component.css"],
  providers: [QueryService]
})
export class QueryBuilderdbBasketballComponent implements OnInit {
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
    rules: []
  };
  public playersConfig: any = {};
  public playersPrdConfig: any = {};
  public teamGameConfig: any = {};
  public teamPrdConfig: any = {};
  public projections: any = {};
  public sortByField: any = {};
  public projectionObject: any = projectedFieldsBasketball;
  public config: QueryBuilderConfig;
  public bootstrapClassNames: QueryBuilderClassNames = {
    switchRow: 'd-flex px-2',
    switchGroup: 'mat-radio-group qb-radio-group ',
    switchRadio: 'mat-radio-button mat-info with-gap',
    switchLabel: 'mat-radio-label qb-radio-label',
    entityControl: 'mat-select',
    entityControlSize: 'mat-input-wrapper mat-form-field-wrapper mat-input-flex qb-entity-control',
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
          Offense: { name: "Offense" },
          Defense: { name: "Defense" },
          Rebounds: { name: "Rebounds" },
          Combined: { name: "Combined" }
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
          "games.stats.tp": { entity: "Offense", name: "Points Scored", type: "number", defaultValue: 0, nullable: true },
          "games.stats.ast": { entity: "Offense", name: "Assists", type: "number", defaultValue: 0, nullable: true },
          "games.stats.stl": { entity: "Defense", name: "Steals", type: "number", defaultValue: 0, nullable: true },
          "games.stats.blk": { entity: "Defense", name: "Blocks", type: "number", defaultValue: 0, nullable: true },
          "games.stats.treb": { entity: "Combined", name: "Total Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fgm": { entity: "Offense", name: "FG Makes", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fga": { entity: "Offense", name: "FG Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fgpct": { entity: "Offense", name: "FG %", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fgm3": { entity: "Offense", name: "3PT  Makes", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fga3": { entity: "Offense", name: "3PT Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fg3pct": { entity: "Offense", name: "3PT %", type: "number", defaultValue: 0, nullable: true },
          "games.stats.ftm": { entity: "Offense", name: "FT Makes", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fta": { entity: "Offense", name: "FT Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.ftpct": { entity: "Offense", name: "FT %", type: "number", defaultValue: 0, nullable: true },
          "games.stats.oreb": { entity: "Rebounds", name: "Offensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.stats.dreb": { entity: "Rebounds", name: "Defensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.stats.to": { entity: "Offense", name: "Turnovers", type: "number", defaultValue: 0, nullable: true },
          "games.stats.min": { entity: "Combined", name: "Minutes", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pf": { entity: "Combined", name: "Personal Fouls", type: "number", defaultValue: 0, nullable: true },
          "games.stats.tf": { entity: "Combined", name: "Technical Fouls", type: "number", defaultValue: 0, nullable: true },
          "games.stats.dDoubles": { entity: "Combined", name: "Double Doubles", type: "number", defaultValue: 0, nullable: true },
          "games.stats.tDoubles": { entity: "Combined", name: "Triple Doubles", type: "number", defaultValue: 0, nullable: true }
        }
      };
      this.playersPrdConfig = {
        entities: {
          Player: { name: "Player" },
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Offense: { name: "Offense" },
          Defense: { name: "Defense" },
          Rebounds: { name: "Rebounds" },
          Combined: { name: "Combined" }
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
          "games.prdStats.tp": { entity: "Offense", name: "Points Scored", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.ast": { entity: "Offense", name: "Assists", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.stl": { entity: "Defense", name: "Steals", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.blk": { entity: "Defense", name: "Blocks", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.treb": { entity: "Combined", name: "Total Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fgm": { entity: "Offense", name: "FG Makes", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fga": { entity: "Offense", name: "FG Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fgpct": { entity: "Offense", name: "FG %", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fgm3": { entity: "Offense", name: "3PT  Makes", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fga3": { entity: "Offense", name: "3PT Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fg3pct": { entity: "Offense", name: "3PT %", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.ftm": { entity: "Offense", name: "FT Makes", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.fta": { entity: "Offense", name: "FT Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.ftpct": { entity: "Offense", name: "FT %", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.oreb": { entity: "Rebounds", name: "Offensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.dreb": { entity: "Rebounds", name: "Defensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.to": { entity: "Offense", name: "Turnovers", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.min": { entity: "Combined", name: "Minutes", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.pf": { entity: "Combined", name: "Personal Fouls", type: "number", defaultValue: 0, nullable: true },
          "games.prdStats.tf": { entity: "Combined", name: "Technical Fouls", type: "number", defaultValue: 0, nullable: true }
        }
      };
      this.teamGameConfig = {
        entities: {
          Date: { name: "Date" },
          Opponent: { name: "Opponent" },
          Offense: { name: "Offense" },
          Defense: { name: "Defense" },
          Rebounds: { name: "Rebounds" },
          Combined: { name: "Combined" }
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

          "totals.stats.tp": { entity: "Offense", name: "Points Scored", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.ast": { entity: "Defense", name: "Assists", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.stl": { entity: "Defense", name: "Steals", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.blk": { entity: "Defense", name: "Blocks", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.treb": { entity: "Rebounds", name: "Total Rebounds", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fgm": { entity: "Offense", name: "FG Makes", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fga": { entity: "Offense", name: "FG Attempts", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fgpct": { entity: "Offense", name: "FG %", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fgm3": { entity: "Offense", name: "3PT  Makes", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fga3": { entity: "Offense", name: "3PT Attempts", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fg3pct": { entity: "Offense", name: "3PT %", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.ftm": { entity: "Offense", name: "FT Makes", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.fta": { entity: "Offense", name: "FT Attempts", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.ftpct": { entity: "Offense", name: "FT %", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.oreb": { entity: "Rebounds", name: "Offensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.dreb": { entity: "Rebounds", name: "Defensive Rebounds", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.to": { entity: "Offense", name: "Turnovers", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.min": { entity: "Combined", name: "Minutes", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.pf": { entity: "Combined", name: "Personal Fouls", type: "number", defaultValue: 0, nullable: true },
          "totals.stats.tf": { entity: "Combined", name: "Technical Fouls", type: "number", defaultValue: 0, nullable: true },
        }
      };
      this.teamPrdConfig = {
        entities: {
          Date: { name: "Date" },
          Opponent: { name: "Opponent" },
          Offense: { name: "Offense" },
          Defense: { name: "Defense" },
          Rebounds: { name: "Rebounds" },
          Combined: { name: "Combined" }
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
          "totals.prdStats.tp": { entity: "Offense", name: "Points Scored", type: "number", nullable: true },
          "totals.prdStats.ast": { entity: "Offense", name: "Assists", type: "number", nullable: true },
          "totals.prdStats.stl": { entity: "Defense", name: "Steals", type: "number", nullable: true },
          "totals.prdStats.blk": { entity: "Defense", name: "Blocks", type: "number", nullable: true },
          "totals.prdStats.treb": { entity: "Rebounds", name: "Total Rebounds", type: "number", nullable: true },
          "totals.prdStats.fgm": { entity: "Offense", name: "FG Makes", type: "number", nullable: true },
          "totals.prdStats.fga": { entity: "Offense", name: "FG Attempts", type: "number", nullable: true },
          "totals.prdStats.fgpct": { entity: "Offense", name: "FG %", type: "number", nullable: true },
          "totals.prdStats.fgm3": { entity: "Offense", name: "3PT  Makes", type: "number", nullable: true },
          "totals.prdStats.fga3": { entity: "Offense", name: "3PT Attempts", type: "number", nullable: true },
          "totals.prdStats.fg3pct": { entity: "Offense", name: "3PT %", type: "number", nullable: true },
          "totals.prdStats.ftm": { entity: "Offense", name: "FT Makes", type: "number", nullable: true },
          "totals.prdStats.fta": { entity: "Offense", name: "FT Attempts", type: "number", nullable: true },
          "totals.prdStats.ftpct": { entity: "Offense", name: "FT %", type: "number", nullable: true },
          "totals.prdStats.oreb": { entity: "Rebounds", name: "Offensive Rebounds", type: "number", nullable: true },
          "totals.prdStats.dreb": { entity: "Rebounds", name: "Defensive Rebounds", type: "number", nullable: true },
          "totals.prdStats.to": { entity: "Combined", name: "Turnovers", type: "number", nullable: true },
          "totals.prdStats.min": { entity: "Combined", name: "Minutes", type: "number", nullable: true },
          "totals.prdStats.pf": { entity: "Combined", name: "Personal Fouls", type: "number", nullable: true },
          "totals.prdStats.tf": { entity: "Combined", name: "Technical Fouls", type: "number", nullable: true },

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
        Position: {
          $cond: [
            { $ne: ["$games.pos.opos", null] },
            "$games.pos.opos",
            "$games.pos.dpos"
          ]
        }
      };
    } else {
      this.projections = {
        Name: "$name",
        OppCode: "$opponentCode",
        OppName: "$opponentName",
        GameDate: "$gameDate",
        Season: "$season"
      };
    }
    if (this.QBentity !== "game" && this.QBselectedSplit == "players") this.projections["Period"] = "$games.prdStats.prd";
    if (this.QBentity !== "game" && this.QBselectedSplit == "teamGames") this.projections["Period"] = "$totals.prdStats.prd";
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
      if (!this.projections[projectionField] && rule.field !== "games.pos.pos" && rule.field !== "pos.pos" && rule.field !== "games.opponentCode" && rule.field !== "opponentCode") {
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
    else if (this.QBentity !== "game" && this.QBselectedSplit == "players") {
      finalPipeline.push({ $unwind: "$games.prdStats" });
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
