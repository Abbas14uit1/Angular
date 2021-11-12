import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/platform-browser";
import { QueryBuilderClassNames, QueryBuilderConfig } from "angular2-query-builder";
import { QueryService } from "app/sport/query/query.service";
import * as moment from "moment";
import { HeaderConfig } from "../../shared/header/header.component";
import { QueryBuilderResultsComponent } from "app/sport/query-builderdb/query-builder-results/query-builder-results.component";
import { TeamColors } from "../../shared/team-colors";
import { projectedFieldsFootball } from "./projectedFields-football";
import { GoogleAnalyticsEventsService } from "../../services/google-analytics-events-service";

@Component({
  selector: "app-query-builderdb-football",
  templateUrl: "./query-builderdb-football.component.html",
  styleUrls: ["./query-builderdb-football.component.css"],
  providers: [QueryService]
})
export class QueryBuilderdbFootballComponent implements OnInit {
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
  public QBTime: string = "Qtr";
  public QBentities = [
    { value: "game", viewValue: "Game ", checked: true },
    { value: "half", viewValue: "Half", checked: false },
    { value: "quarter", viewValue: "Quarter", checked: false },
    { value: "drive", viewValue: "Drive", checked: false }
  ];
  public QBentity: string = this.QBentities[0].value;

  public QBselectedSplit: string;
  public query: any = {
    condition: "and",
    rules: []
  };
  public playersConfig: any = {};
  public teamGameConfig: any = {};
  public teamQtrConfig: any = {};
  public teamHalfConfig: any = {};
  public teamDrConfig: any = {};
  public projections: any = {};
  public sortByField: any = {};
  public projectionObject: any = projectedFieldsFootball;
  public config: QueryBuilderConfig;
  constructor(private queryService: QueryService, @Inject(DOCUMENT) private document: Document, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
    this.QBteamId = localStorage.getItem("selectedTeam");
    this.QBsportId = localStorage.getItem("selectedSport");
    this.QBteamName = localStorage.getItem("teamText");
    this.QBteamColors = this.QBshared.teamColors;
    this.query = {
      condition: "and",
      rules: []
    };
  }
  public bootstrapClassNames: QueryBuilderClassNames = {
    switchRow: 'd-flex px-2',
    switchGroup: 'mat-radio-group qb-radio-group ',
    switchRadio: 'mat-radio-button mat-info with-gap',
    switchLabel: 'mat-radio-label qb-radio-label',
    entityControl: 'mat-select',
    entityControlSize: 'mat-input-wrapper mat-form-field-wrapper mat-input-flex qb-entity-control',
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
          Passing: { name: "Passing" },
          Rushing: { name: "Rushing" },
          Receiving: { name: "Receiving" },
          Scoring: { name: "Scoring" },
          Fumbles: { name: "Fumbles" },
          Defense: { name: "Defense" },
          KickReturns: { name: "Kick Returns" },
          PuntReturns: { name: "Punt Returns" },
          Kickoffs: { name: "Kickoffs" },
          Punts: { name: "Punts" },
          FieldGoals: { name: "Field Goals" },
          PATs: { name: "PATs" },
          Drive: { name: "Drive" }
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
          "games.pos.opos": {
            name: "OPOS",
            type: "string",
            entity: "Player"
          },
          "games.pos.dpos": {
            name: "DPOS",
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
          "games.stats.pass.passAtt": {
            entity: "Passing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passComp": {
            entity: "Passing",
            name: "Completions",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passInt": {
            entity: "Passing",
            name: "INTs Thrown",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passLong": {
            entity: "Passing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passSacks": {
            entity: "Passing",
            name: "Sacked",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passSacksYards": {
            entity: "Passing",
            name: "Sacked (Yards)",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passTd": {
            entity: "Passing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "games.stats.pass.passYards": {
            entity: "Passing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.rushing.rushAtt": {
            entity: "Rushing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.rushing.rushLong": {
            entity: "Rushing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "games.stats.rushing.rushTd": {
            entity: "Rushing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "games.stats.rushing.rushYards": {
            entity: "Rushing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.receiving.rcvNum": {
            entity: "Receiving",
            name: "Receptions",
            type: "number",
            nullable: true
          },
          "games.stats.receiving.rcvLong": {
            entity: "Receiving",
            name: "Long",
            type: "number",
            nullable: true
          },
          "games.stats.receiving.rcvTd": {
            entity: "Receiving",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "games.stats.receiving.rcvYards": {
            entity: "Receiving",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.scoring.td": {
            entity: "Scoring",
            name: "Touchdowns",
            type: "number",
            nullable: true
          },
          "games.stats.scoring.fg": {
            entity: "Scoring",
            name: "FieldGoals",
            type: "number",
            nullable: true
          },
          // "games.stats.scoring.tp": {
          //   entity: "Scoring",
          //   name: "Total Points",
          //   type: "number",
          //   nullable: true
          // },
          "games.stats.scoring.patKick": {
            entity: "Scoring",
            name: "PATs",
            type: "number",
            nullable: true
          },
          "games.stats.fumbles.fumbLost": {
            entity: "Fumbles",
            name: "Lost",
            type: "number",
            nullable: true
          },
          "games.stats.fumbles.fumbTotal": {
            entity: "Fumbles",
            name: "Total",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dFf": {
            entity: "Defense",
            name: "Forced Fumbles",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dFr": {
            entity: "Defense",
            name: "Fumble Recoveries",
            type: "number",
            nullable: true
          },
          "games.stats.intReturn.irYards": {
            entity: "Defense",
            name: "Int Return Yards",
            type: "number",
            nullable: true
          },
          "games.stats.intReturn.irNo": {
            entity: "Defense",
            name: "Interceptions",
            type: "number",
            nullable: true
          },
          "games.stats.intReturn.irLong": {
            entity: "Defense",
            name: "IntReturn (Long)",
            type: "number",
            nullable: true
          },
          "games.stats.intReturn.irTd": {
            entity: "Defense",
            name: "IntReturn TDs",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dBrup": {
            entity: "Defense",
            name: "Pass Break Up",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dQbh": {
            entity: "Defense",
            name: "QB Hurries",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dFryds": {
            entity: "Defense",
            name: "Return Yards",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dSackYards": {
            entity: "Defense",
            name: "Sack Yards",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dSacks": {
            entity: "Defense",
            name: "Sacks",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dSaf": {
            entity: "Defense",
            name: "Safety",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dTfla": {
            entity: "Defense",
            name: "Tackles for Loss (A)",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dTflua": {
            entity: "Defense",
            name: "Tackles for Loss (UA)",
            type: "number",
            nullable: true
          },
          "games.stats.defense.dTackTot": {
            entity: "Defense",
            name: "Total Tackles",
            type: "number",
            nullable: true
          },
          "games.stats.kickReceiving.krNo": {
            entity: "KickReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.kickReceiving.krYards": {
            entity: "KickReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.kickReceiving.krTd": {
            entity: "KickReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "games.stats.kickReceiving.krLong": {
            entity: "KickReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "games.stats.puntReturn.prNo": {
            entity: "PuntReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.puntReturn.prYards": {
            entity: "PuntReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.puntReturn.prTd": {
            entity: "PuntReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "games.stats.puntReturn.prLong": {
            entity: "PuntReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "games.stats.kickoff.koNum": {
            entity: "Kickoffs",
            name: "Number",
            type: "number",
            nullable: true
          },
          "games.stats.kickoff.koYards": {
            entity: "Kickoffs",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.kickoff.koOb": {
            entity: "Kickoffs",
            name: "Out of Bounds",
            type: "number",
            nullable: true
          },
          "games.stats.kickoff.koTb": {
            entity: "Kickoffs",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntNum": {
            entity: "Punts",
            name: "Number",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntYards": {
            entity: "Punts",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntLong": {
            entity: "Punts",
            name: "Long",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntTb": {
            entity: "Punts",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntFc": {
            entity: "Punts",
            name: "Fair Catches",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntPlus50": {
            entity: "Punts",
            name: "50+",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntInside20": {
            entity: "Punts",
            name: "Inside 20",
            type: "number",
            nullable: true
          },
          "games.stats.punt.puntBlocked": {
            entity: "Punts",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "games.stats.fieldgoal.fgAtt": {
            entity: "FieldGoals",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.fieldgoal.fgMade": {
            entity: "FieldGoals",
            name: "Made",
            type: "number",
            nullable: true
          },
          "games.stats.fieldgoal.fgLong": {
            entity: "FieldGoals",
            name: "Long",
            type: "number",
            nullable: true
          },
          "games.stats.fieldgoal.fgBlocked": {
            entity: "FieldGoals",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.kickatt": {
            entity: "PATs",
            name: "Kick Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.kickmade": {
            entity: "PATs",
            name: "Kicks Made",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.passatt": {
            entity: "PATs",
            name: "Pass Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.passmade": {
            entity: "PATs",
            name: "Pass Made",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.rushatt": {
            entity: "PATs",
            name: "Rush Attempts",
            type: "number",
            nullable: true
          },
          "games.stats.pointAfter.rushmade": {
            entity: "PATs",
            name: "Rush Made",
            type: "number",
            nullable: true
          },
          "periodDetails.dr": {
            entity: "Drive",
            name: "Yards",
            type: "string",
            nullable: true
          },
          "periodDetails.numPlaysInDrive": {
            entity: "Drive",
            name: "Number of Plays",
            type: "number",
            nullable: true
          },
          "periodDetails.TimeofPossession": {
            entity: "Drive",
            name: "Time of Possession",
            type: "string",
            nullable: true
          },
          "periodDetails.driveEndPlayType": {
            entity: "Drive",
            name: "Result TD",
            type: "numstringber",
            nullable: true
          },
          "periodDetails.": {
            entity: "Drive",
            name: "Result FG",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultPunt": {
            entity: "Drive",
            name: "Result Punt",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultINT": {
            entity: "Drive",
            name: "Result INT",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultFumble": {
            entity: "Drive",
            name: "Result Fumble",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultTOon ": {
            entity: "Drive",
            name: "Result TO on ",
            type: "string",
            nullable: true
          },
          "periodDetails.Downs": {
            entity: "Drive",
            name: "Downs",
            type: "string",
            nullable: true
          }
        }
      };
      this.teamGameConfig = {
        entities: {
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Passing: { name: "Passing" },
          Rushing: { name: "Rushing" },
          Receiving: { name: "Receiving" },
          Scoring: { name: "Scoring" },
          Fumbles: { name: "Fumbles" },
          Defense: { name: "Defense" },
          KickReturns: { name: "Kick Returns" },
          PuntReturns: { name: "Punt Returns" },
          Kickoffs: { name: "Kickoffs" },
          Punts: { name: "Punts" },
          FieldGoals: { name: "Field Goals" },
          PATs: { name: "PATs" },
          misc: { name: "Misc" },
          FirstDowns: { name: "FirstDowns" },
          redzone: { name: "Redzone" },
          conversions: { name: "Conversions" },
          Penalties: { name: "Penalties" },
          Drive: { name: "Drive" }

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
          "totals.pass.passAtt": {
            entity: "Passing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.pass.passComp": {
            entity: "Passing",
            name: "Completions",
            type: "number",
            nullable: true
          },
          "totals.pass.passInt": {
            entity: "Passing",
            name: "INTs Thrown",
            type: "number",
            nullable: true
          },
          "totals.pass.passLong": {
            entity: "Passing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "totals.pass.passSacks": {
            entity: "Passing",
            name: "Sacked",
            type: "number",
            nullable: true
          },
          "totals.pass.passSacksYards": {
            entity: "Passing",
            name: "Sacked (Yards)",
            type: "number",
            nullable: true
          },
          "totals.pass.passTd": {
            entity: "Passing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "totals.pass.passYards": {
            entity: "Passing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.rushing.rushAtt": {
            entity: "Rushing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.rushing.rushLong": {
            entity: "Rushing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "totals.rushing.rushTd": {
            entity: "Rushing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "totals.rushing.rushYards": {
            entity: "Rushing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.receiving.rcvNum": {
            entity: "Receiving",
            name: "Receptions",
            type: "number",
            nullable: true
          },
          "totals.receiving.rcvLong": {
            entity: "Receiving",
            name: "Long",
            type: "number",
            nullable: true
          },
          "totals.receiving.rcvTd": {
            entity: "Receiving",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "totals.receiving.rcvYards": {
            entity: "Receiving",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.scoring.td": {
            entity: "Scoring",
            name: "Touchdowns",
            type: "number",
            nullable: true
          },
          "totals.scoring.fg": {
            entity: "Scoring",
            name: "FieldGoals",
            type: "number",
            nullable: true
          },
          // "totals.scoring.tp": {
          //   entity: "Scoring",
          //   name: "Total Points",
          //   type: "number",
          //   nullable: true
          // },
          "totals.scoring.patKick": {
            entity: "Scoring",
            name: "PATs",
            type: "number",
            nullable: true
          },
          "totals.fumbles.fumbLost": {
            entity: "Fumbles",
            name: "Lost",
            type: "number",
            nullable: true
          },
          "totals.fumbles.fumbTotal": {
            entity: "Fumbles",
            name: "Total",
            type: "number",
            nullable: true
          },
          "totals.defense.dFf": {
            entity: "Defense",
            name: "Forced Fumbles",
            type: "number",
            nullable: true
          },
          "totals.defense.dFr": {
            entity: "Defense",
            name: "Fumble Recoveries",
            type: "number",
            nullable: true
          },
          "totals.intReturn.irYards": {
            entity: "Defense",
            name: "Int Return Yards",
            type: "number",
            nullable: true
          },
          "totals.intReturn.irNo": {
            entity: "Defense",
            name: "Interceptions",
            type: "number",
            nullable: true
          },
          "totals.intReturn.irLong": {
            entity: "Defense",
            name: "IntReturn (Long)",
            type: "number",
            nullable: true
          },
          "totals.intReturn.irTd": {
            entity: "Defense",
            name: "IntReturn TDs",
            type: "number",
            nullable: true
          },
          "totals.defense.dBrup": {
            entity: "Defense",
            name: "Pass Break Up",
            type: "number",
            nullable: true
          },
          "totals.defense.dQbh": {
            entity: "Defense",
            name: "QB Hurries",
            type: "number",
            nullable: true
          },
          "totals.defense.dFryds": {
            entity: "Defense",
            name: "Return Yards",
            type: "number",
            nullable: true
          },
          "totals.defense.dSackYards": {
            entity: "Defense",
            name: "Sack Yards",
            type: "number",
            nullable: true
          },
          "totals.defense.dSacks": {
            entity: "Defense",
            name: "Sacks",
            type: "number",
            nullable: true
          },
          "totals.defense.dSaf": {
            entity: "Defense",
            name: "Safety",
            type: "number",
            nullable: true
          },
          "totals.defense.dTfla": {
            entity: "Defense",
            name: "Tackles for Loss (A)",
            type: "number",
            nullable: true
          },
          "totals.defense.dTflua": {
            entity: "Defense",
            name: "Tackles for Loss (UA)",
            type: "number",
            nullable: true
          },
          "totals.defense.dTackTot": {
            entity: "Defense",
            name: "Total Tackles",
            type: "number",
            nullable: true
          },
          "totals.kickReceiving.krNo": {
            entity: "KickReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.kickReceiving.krYards": {
            entity: "KickReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.kickReceiving.krTd": {
            entity: "KickReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "totals.kickReceiving.krLong": {
            entity: "KickReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "totals.puntReturn.prNo": {
            entity: "PuntReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.puntReturn.prYards": {
            entity: "PuntReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.puntReturn.prTd": {
            entity: "PuntReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "totals.puntReturn.prLong": {
            entity: "PuntReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "totals.kickoff.koNum": {
            entity: "Kickoffs",
            name: "Number",
            type: "number",
            nullable: true
          },
          "totals.kickoff.koYards": {
            entity: "Kickoffs",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.kickoff.koOb": {
            entity: "Kickoffs",
            name: "Out of Bounds",
            type: "number",
            nullable: true
          },
          "totals.kickoff.koTb": {
            entity: "Kickoffs",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "totals.punt.puntNum": {
            entity: "Punts",
            name: "Number",
            type: "number",
            nullable: true
          },
          "totals.punt.puntYards": {
            entity: "Punts",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.punt.puntLong": {
            entity: "Punts",
            name: "Long",
            type: "number",
            nullable: true
          },
          "totals.punt.puntTb": {
            entity: "Punts",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "totals.punt.puntFc": {
            entity: "Punts",
            name: "Fair Catches",
            type: "number",
            nullable: true
          },
          "totals.punt.puntPlus50": {
            entity: "Punts",
            name: "50+",
            type: "number",
            nullable: true
          },
          "totals.punt.puntInside20": {
            entity: "Punts",
            name: "Inside 20",
            type: "number",
            nullable: true
          },
          "totals.punt.puntBlocked": {
            entity: "Punts",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "totals.fieldgoal.fgAtt": {
            entity: "FieldGoals",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.fieldgoal.fgMade": {
            entity: "FieldGoals",
            name: "Made",
            type: "number",
            nullable: true
          },
          "totals.fieldgoal.fgLong": {
            entity: "FieldGoals",
            name: "Long",
            type: "number",
            nullable: true
          },
          "totals.fieldgoal.fgBlocked": {
            entity: "FieldGoals",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.kickatt": {
            entity: "PATs",
            name: "Kick Attempts",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.kickmade": {
            entity: "PATs",
            name: "Kicks Made",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.passatt": {
            entity: "PATs",
            name: "Pass Attempts",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.passmade": {
            entity: "PATs",
            name: "Pass Made",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.rushatt": {
            entity: "PATs",
            name: "Rush Attempts",
            type: "number",
            nullable: true
          },
          "totals.pointAfter.rushmade": {
            entity: "PATs",
            name: "Rush Made",
            type: "number",
            nullable: true
          },
          "totals.firstdowns.fdTotal": {
            entity: "FirstDowns",
            name: "Total",
            type: "number",
            nullable: true
          },
          "totals.firstdowns.fdRush": {
            entity: "FirstDowns",
            name: "Rush",
            type: "number",
            nullable: true
          },
          "totals.firstdowns.fdPass": {
            entity: "FirstDowns",
            name: "Pass",
            type: "number",
            nullable: true
          },
          "totals.firstdowns.fdPenalty": {
            entity: "FirstDowns",
            name: "Penalty",
            type: "number",
            nullable: true
          },
          "totals.penalties.penTotal": {
            entity: "Penalties",
            name: "Total",
            type: "number",
            nullable: true
          },
          "totals.penalties.penYards": {
            entity: "Penalties",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.conversions.convThird": {
            entity: "conversions",
            name: "Third Down Att",
            type: "number",
            nullable: true
          },
          "totals.conversions.convThirdAtt": {
            entity: "conversions",
            name: "Third Down Conversions",
            type: "number",
            nullable: true
          },
          "totals.conversions.convFourth": {
            entity: "conversions",
            name: "Fourth Down Attempts",
            type: "number",
            nullable: true
          },
          "totals.conversions.convFourthAtt": {
            entity: "conversions",
            name: "Fourth Down Conversions",
            type: "number",
            nullable: true
          },
          "totals.redzone.redAtt": {
            entity: "redzone",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "totals.redzone.redScores": {
            entity: "redzone",
            name: "Scores",
            type: "number",
            nullable: true
          },
          "totals.redzone.redPoints": {
            entity: "redzone",
            name: "Points",
            type: "number",
            nullable: true
          },
          "totals.redzone.redTdRush": {
            entity: "redzone",
            name: "Rush TDs",
            type: "number",
            nullable: true
          },
          "totals.redzone.redTdPass": {
            entity: "redzone",
            name: "Pass TDs",
            type: "number",
            nullable: true
          },
          "totals.redzone.redFgMade": {
            entity: "redzone",
            name: "FG Made",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndFga": {
            entity: "redzone",
            name: "FG Attempted",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndDown": {
            entity: "redzone",
            name: "Ended in Downs",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndInt": {
            entity: "redzone",
            name: "Ended in Interception",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndFumb": {
            entity: "redzone",
            name: "Ended in Fumble",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndHalf": {
            entity: "redzone",
            name: "Ended by Half",
            type: "number",
            nullable: true
          },
          "totals.redzone.redEndGame": {
            entity: "redzone",
            name: "Ended by Game",
            type: "number",
            nullable: true
          },
          "totals.misc.yards": {
            entity: "misc",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "totals.misc.top": {
            entity: "misc",
            name: "Time of Possession",
            type: "number",
            nullable: true
          },
          "totals.misc.ona": {
            entity: "misc",
            name: "On-side Attempts",
            type: "number",
            nullable: true
          },
          "totals.misc.onm": {
            entity: "misc",
            name: "On-side made",
            type: "number",
            nullable: true
          },
          "totals.misc.ptsto": {
            entity: "misc",
            name: "Points from Turnovers",
            type: "number",
            nullable: true
          },
          "periodDetails.Yards": {
            entity: "Drive",
            name: "Yards",
            type: "string",
            nullable: true
          },
          "periodDetails.numPlaysInDrive": {
            entity: "Drive",
            name: "Number of Plays",
            type: "number",
            nullable: true
          },
          "periodDetails.TimeofPossession": {
            entity: "Drive",
            name: "Time of Possession",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultTD": {
            entity: "Drive",
            name: "Result TD",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultFG": {
            entity: "Drive",
            name: "Result FG",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultPunt": {
            entity: "Drive",
            name: "Result Punt",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultINT": {
            entity: "Drive",
            name: "Result INT",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultFumble": {
            entity: "Drive",
            name: "Result Fumble",
            type: "string",
            nullable: true
          },
          "periodDetails.ResultTOon": {
            entity: "Drive",
            name: "Result TO on",
            type: "string",
            nullable: true
          },
          "periodDetails.Downs": {
            entity: "Drive",
            name: "Downs",
            type: "string",
            nullable: true
          },

        }
      };
      this.teamQtrConfig = {
        entities: {
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Passing: { name: "Passing" },
          Rushing: { name: "Rushing" },
          Receiving: { name: "Receiving" },
          Scoring: { name: "Scoring" },
          Fumbles: { name: "Fumbles" },
          Defense: { name: "Defense" },
          KickReturns: { name: "Kick Returns" },
          PuntReturns: { name: "Punt Returns" },
          Kickoffs: { name: "Kickoffs" },
          Punts: { name: "Punts" },
          FieldGoals: { name: "Field Goals" },
          PATs: { name: "PATs" },
          misc: { name: "Misc" },
          FirstDowns: { name: "FirstDowns" },
          redzone: { name: "Redzone" },
          conversions: { name: "Conversions" },
          Penalties: { name: "Penalties" }
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
          "qtrTotals.pass.passAtt": {
            entity: "Passing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passComp": {
            entity: "Passing",
            name: "Completions",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passInt": {
            entity: "Passing",
            name: "INTs Thrown",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passLong": {
            entity: "Passing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passSacks": {
            entity: "Passing",
            name: "Sacked",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passSacksYards": {
            entity: "Passing",
            name: "Sacked (Yards)",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passTd": {
            entity: "Passing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.pass.passYards": {
            entity: "Passing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.rushing.rushAtt": {
            entity: "Rushing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.rushing.rushLong": {
            entity: "Rushing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "qtrTotals.rushing.rushTd": {
            entity: "Rushing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.rushing.rushYards": {
            entity: "Rushing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.receiving.rcvNum": {
            entity: "Receiving",
            name: "Receptions",
            type: "number",
            nullable: true
          },
          "qtrTotals.receiving.rcvLong": {
            entity: "Receiving",
            name: "Long",
            type: "number",
            nullable: true
          },
          "qtrTotals.receiving.rcvTd": {
            entity: "Receiving",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.receiving.rcvYards": {
            entity: "Receiving",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.scoring.td": {
            entity: "Scoring",
            name: "Touchdowns",
            type: "number",
            nullable: true
          },
          "qtrTotals.scoring.fg": {
            entity: "Scoring",
            name: "FieldGoals",
            type: "number",
            nullable: true
          },
          "qtrTotals.scoring.patKick": {
            entity: "Scoring",
            name: "PATs",
            type: "number",
            nullable: true
          },
          "qtrTotals.fumbles.fumbLost": {
            entity: "Fumbles",
            name: "Lost",
            type: "number",
            nullable: true
          },
          "qtrTotals.fumbles.fumbTotal": {
            entity: "Fumbles",
            name: "Total",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dTackTot": {
            entity: "Defense",
            name: "Total Tackles",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dSacks": {
            entity: "Defense",
            name: "Sacks",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dSackYards": {
            entity: "Defense",
            name: "Sack Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dQbh": {
            entity: "Defense",
            name: "QB Hurries",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dFf": {
            entity: "Defense",
            name: "Forced Fumbles",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dFr": {
            entity: "Defense",
            name: "Fumble Recoveries",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dFryds": {
            entity: "Defense",
            name: "Return Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.intReturn.irLong": {
            entity: "Defense",
            name: "IntReturn (Long)",
            type: "number",
            nullable: true
          },
          "qtrTotals.intReturn.irNo": {
            entity: "Defense",
            name: "Interceptions",
            type: "number",
            nullable: true
          },
          "qtrTotals.intReturn.irTd": {
            entity: "Defense",
            name: "IntReturn TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.intReturn.irYards": {
            entity: "Defense",
            name: "Int Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dBrup": {
            entity: "Defense",
            name: "Pass Deflections",
            type: "number",
            nullable: true
          },
          "qtrTotals.defense.dSaf": {
            entity: "Defense",
            name: "Safety",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickReceiving.krNo": {
            entity: "KickReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickReceiving.krYards": {
            entity: "KickReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickReceiving.krTd": {
            entity: "KickReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickReceiving.krLong": {
            entity: "KickReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "qtrTotals.puntReturn.prNo": {
            entity: "PuntReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.puntReturn.prYards": {
            entity: "PuntReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.puntReturn.prTd": {
            entity: "PuntReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.puntReturn.prLong": {
            entity: "PuntReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickoff.koNum": {
            entity: "Kickoffs",
            name: "Number",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickoff.koYards": {
            entity: "Kickoffs",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickoff.koOb": {
            entity: "Kickoffs",
            name: "Out of Bounds",
            type: "number",
            nullable: true
          },
          "qtrTotals.kickoff.koTb": {
            entity: "Kickoffs",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntNum": {
            entity: "Punts",
            name: "Number",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntYards": {
            entity: "Punts",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntLong": {
            entity: "Punts",
            name: "Long",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntTb": {
            entity: "Punts",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntFc": {
            entity: "Punts",
            name: "Fair Catches",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntPlus50": {
            entity: "Punts",
            name: "50+",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntInside20": {
            entity: "Punts",
            name: "Inside 20",
            type: "number",
            nullable: true
          },
          "qtrTotals.punt.puntBlocked": {
            entity: "Punts",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "qtrTotals.fieldgoal.fgAtt": {
            entity: "FieldGoals",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.fieldgoal.fgMade": {
            entity: "FieldGoals",
            name: "Made",
            type: "number",
            nullable: true
          },
          "qtrTotals.fieldgoal.fgLong": {
            entity: "FieldGoals",
            name: "Long",
            type: "number",
            nullable: true
          },
          "qtrTotals.fieldgoal.fgBlocked": {
            entity: "FieldGoals",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.kickatt": {
            entity: "PATs",
            name: "Kick Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.kickmade": {
            entity: "PATs",
            name: "Kicks Made",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.passatt": {
            entity: "PATs",
            name: "Pass Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.passmade": {
            entity: "PATs",
            name: "Pass Made",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.rushatt": {
            entity: "PATs",
            name: "Rush Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.pointAfter.rushmade": {
            entity: "PATs",
            name: "Rush Made",
            type: "number",
            nullable: true
          },
          "qtrTotals.firstdowns.fdTotal": {
            entity: "FirstDowns",
            name: "Total",
            type: "number",
            nullable: true
          },
          "qtrTotals.firstdowns.fdRush": {
            entity: "FirstDowns",
            name: "Rush",
            type: "number",
            nullable: true
          },
          "qtrTotals.firstdowns.fdPass": {
            entity: "FirstDowns",
            name: "Pass",
            type: "number",
            nullable: true
          },
          "qtrTotals.firstdowns.fdPenalty": {
            entity: "FirstDowns",
            name: "Penalty",
            type: "number",
            nullable: true
          },
          "qtrTotals.penalties.penTotal": {
            entity: "Penalties",
            name: "Total",
            type: "number",
            nullable: true
          },
          "qtrTotals.penalties.penYards": {
            entity: "Penalties",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.conversions.convThird": {
            entity: "conversions",
            name: "Third Down Att",
            type: "number",
            nullable: true
          },
          "qtrTotals.conversions.convThirdAtt": {
            entity: "conversions",
            name: "Third Down Conversions",
            type: "number",
            nullable: true
          },
          "qtrTotals.conversions.convFourth": {
            entity: "conversions",
            name: "Fourth Down Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.conversions.convFourthAtt": {
            entity: "conversions",
            name: "Fourth Down Conversions",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redAtt": {
            entity: "redzone",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redScores": {
            entity: "redzone",
            name: "Scores",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redPoints": {
            entity: "redzone",
            name: "Points",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redTdRush": {
            entity: "redzone",
            name: "Rush TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redTdPass": {
            entity: "redzone",
            name: "Pass TDs",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redFgMade": {
            entity: "redzone",
            name: "FG Made",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndFga": {
            entity: "redzone",
            name: "FG Attempted",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndDown": {
            entity: "redzone",
            name: "Ended in Downs",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndInt": {
            entity: "redzone",
            name: "Ended in Interception",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndFumb": {
            entity: "redzone",
            name: "Ended in Fumble",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndHalf": {
            entity: "redzone",
            name: "Ended by Half",
            type: "number",
            nullable: true
          },
          "qtrTotals.redzone.redEndGame": {
            entity: "redzone",
            name: "Ended by Game",
            type: "number",
            nullable: true
          },
          "qtrTotals.misc.yards": {
            entity: "misc",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "qtrTotals.misc.top": {
            entity: "misc",
            name: "Time of Possession",
            type: "number",
            nullable: true
          },
          "qtrTotals.misc.ona": {
            entity: "misc",
            name: "On-side Attempts",
            type: "number",
            nullable: true
          },
          "qtrTotals.misc.onm": {
            entity: "misc",
            name: "On-side made",
            type: "number",
            nullable: true
          },
          "qtrTotals.misc.ptsto": {
            entity: "misc",
            name: "Points from Turnovers",
            type: "number",
            nullable: true
          }
        }
      };
      this.teamHalfConfig = {
        entities: {
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Passing: { name: "Passing" },
          Rushing: { name: "Rushing" },
          Receiving: { name: "Receiving" },
          Scoring: { name: "Scoring" },
          Fumbles: { name: "Fumbles" },
          Defense: { name: "Defense" },
          KickReturns: { name: "Kick Returns" },
          PuntReturns: { name: "Punt Returns" },
          Kickoffs: { name: "Kickoffs" },
          Punts: { name: "Punts" },
          FieldGoals: { name: "Field Goals" },
          PATs: { name: "PATs" },
          misc: { name: "Misc" },
          FirstDowns: { name: "FirstDowns" },
          redzone: { name: "Redzone" },
          conversions: { name: "Conversions" },
          Penalties: { name: "Penalties" }
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
          "halfTotals.pass.passAtt": {
            entity: "Passing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passComp": {
            entity: "Passing",
            name: "Completions",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passInt": {
            entity: "Passing",
            name: "INTs Thrown",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passLong": {
            entity: "Passing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passSacks": {
            entity: "Passing",
            name: "Sacked",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passSacksYards": {
            entity: "Passing",
            name: "Sacked (Yards)",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passTd": {
            entity: "Passing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.pass.passYards": {
            entity: "Passing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.rushing.rushAtt": {
            entity: "Rushing",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.rushing.rushLong": {
            entity: "Rushing",
            name: "Long",
            type: "number",
            nullable: true
          },
          "halfTotals.rushing.rushTd": {
            entity: "Rushing",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.rushing.rushYards": {
            entity: "Rushing",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.receiving.rcvNum": {
            entity: "Receiving",
            name: "Receptions",
            type: "number",
            nullable: true
          },
          "halfTotals.receiving.rcvLong": {
            entity: "Receiving",
            name: "Long",
            type: "number",
            nullable: true
          },
          "halfTotals.receiving.rcvTd": {
            entity: "Receiving",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.receiving.rcvYards": {
            entity: "Receiving",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.scoring.td": {
            entity: "Scoring",
            name: "Touchdowns",
            type: "number",
            nullable: true
          },
          "halfTotals.scoring.fg": {
            entity: "Scoring",
            name: "FieldGoals",
            type: "number",
            nullable: true
          },
          "halfTotals.scoring.patKick": {
            entity: "Scoring",
            name: "PATs",
            type: "number",
            nullable: true
          },
          "halfTotals.fumbles.fumbLost": {
            entity: "Fumbles",
            name: "Lost",
            type: "number",
            nullable: true
          },
          "halfTotals.fumbles.fumbTotal": {
            entity: "Fumbles",
            name: "Total",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dTackTot": {
            entity: "Defense",
            name: "Total Tackles",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dSacks": {
            entity: "Defense",
            name: "Sacks",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dSackYards": {
            entity: "Defense",
            name: "Sack Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dQbh": {
            entity: "Defense",
            name: "QB Hurries",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dFf": {
            entity: "Defense",
            name: "Forced Fumbles",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dFr": {
            entity: "Defense",
            name: "Fumble Recoveries",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dFryds": {
            entity: "Defense",
            name: "Return Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.intReturn.irLong": {
            entity: "Defense",
            name: "IntReturn (Long)",
            type: "number",
            nullable: true
          },
          "halfTotals.intReturn.irNo": {
            entity: "Defense",
            name: "Interceptions",
            type: "number",
            nullable: true
          },
          "halfTotals.intReturn.irTd": {
            entity: "Defense",
            name: "IntReturn TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.intReturn.irYards": {
            entity: "Defense",
            name: "Int Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dBrup": {
            entity: "Defense",
            name: "Pass Deflections",
            type: "number",
            nullable: true
          },
          "halfTotals.defense.dSaf": {
            entity: "Defense",
            name: "Safety",
            type: "number",
            nullable: true
          },
          "halfTotals.kickReceiving.krNo": {
            entity: "KickReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.kickReceiving.krYards": {
            entity: "KickReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.kickReceiving.krTd": {
            entity: "KickReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.kickReceiving.krLong": {
            entity: "KickReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "halfTotals.puntReturn.prNo": {
            entity: "PuntReturns",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.puntReturn.prYards": {
            entity: "PuntReturns",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.puntReturn.prTd": {
            entity: "PuntReturns",
            name: "TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.puntReturn.prLong": {
            entity: "PuntReturns",
            name: "Longest",
            type: "number",
            nullable: true
          },
          "halfTotals.kickoff.koNum": {
            entity: "Kickoffs",
            name: "Number",
            type: "number",
            nullable: true
          },
          "halfTotals.kickoff.koYards": {
            entity: "Kickoffs",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.kickoff.koOb": {
            entity: "Kickoffs",
            name: "Out of Bounds",
            type: "number",
            nullable: true
          },
          "halfTotals.kickoff.koTb": {
            entity: "Kickoffs",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntNum": {
            entity: "Punts",
            name: "Number",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntYards": {
            entity: "Punts",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntLong": {
            entity: "Punts",
            name: "Long",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntTb": {
            entity: "Punts",
            name: "Touchbacks",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntFc": {
            entity: "Punts",
            name: "Fair Catches",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntPlus50": {
            entity: "Punts",
            name: "50+",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntInside20": {
            entity: "Punts",
            name: "Inside 20",
            type: "number",
            nullable: true
          },
          "halfTotals.punt.puntBlocked": {
            entity: "Punts",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "halfTotals.fieldgoal.fgAtt": {
            entity: "FieldGoals",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.fieldgoal.fgMade": {
            entity: "FieldGoals",
            name: "Made",
            type: "number",
            nullable: true
          },
          "halfTotals.fieldgoal.fgLong": {
            entity: "FieldGoals",
            name: "Long",
            type: "number",
            nullable: true
          },
          "halfTotals.fieldgoal.fgBlocked": {
            entity: "FieldGoals",
            name: "Blocked",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.kickatt": {
            entity: "PATs",
            name: "Kick Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.kickmade": {
            entity: "PATs",
            name: "Kicks Made",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.passatt": {
            entity: "PATs",
            name: "Pass Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.passmade": {
            entity: "PATs",
            name: "Pass Made",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.rushatt": {
            entity: "PATs",
            name: "Rush Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.pointAfter.rushmade": {
            entity: "PATs",
            name: "Rush Made",
            type: "number",
            nullable: true
          },
          "halfTotals.firstdowns.fdTotal": {
            entity: "FirstDowns",
            name: "Total",
            type: "number",
            nullable: true
          },
          "halfTotals.firstdowns.fdRush": {
            entity: "FirstDowns",
            name: "Rush",
            type: "number",
            nullable: true
          },
          "halfTotals.firstdowns.fdPass": {
            entity: "FirstDowns",
            name: "Pass",
            type: "number",
            nullable: true
          },
          "halfTotals.firstdowns.fdPenalty": {
            entity: "FirstDowns",
            name: "Penalty",
            type: "number",
            nullable: true
          },
          "halfTotals.penalties.penTotal": {
            entity: "Penalties",
            name: "Total",
            type: "number",
            nullable: true
          },
          "halfTotals.penalties.penYards": {
            entity: "Penalties",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.conversions.convThird": {
            entity: "conversions",
            name: "Third Down Att",
            type: "number",
            nullable: true
          },
          "halfTotals.conversions.convThirdAtt": {
            entity: "conversions",
            name: "Third Down Conversions",
            type: "number",
            nullable: true
          },
          "halfTotals.conversions.convFourth": {
            entity: "conversions",
            name: "Fourth Down Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.conversions.convFourthAtt": {
            entity: "conversions",
            name: "Fourth Down Conversions",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redAtt": {
            entity: "redzone",
            name: "Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redScores": {
            entity: "redzone",
            name: "Scores",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redPoints": {
            entity: "redzone",
            name: "Points",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redTdRush": {
            entity: "redzone",
            name: "Rush TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redTdPass": {
            entity: "redzone",
            name: "Pass TDs",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redFgMade": {
            entity: "redzone",
            name: "FG Made",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndFga": {
            entity: "redzone",
            name: "FG Attempted",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndDown": {
            entity: "redzone",
            name: "Ended in Downs",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndInt": {
            entity: "redzone",
            name: "Ended in Interception",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndFumb": {
            entity: "redzone",
            name: "Ended in Fumble",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndHalf": {
            entity: "redzone",
            name: "Ended by Half",
            type: "number",
            nullable: true
          },
          "halfTotals.redzone.redEndGame": {
            entity: "redzone",
            name: "Ended by Game",
            type: "number",
            nullable: true
          },
          "halfTotals.misc.yards": {
            entity: "misc",
            name: "Yards",
            type: "number",
            nullable: true
          },
          "halfTotals.misc.top": {
            entity: "misc",
            name: "Time of Possession",
            type: "number",
            nullable: true
          },
          "halfTotals.misc.ona": {
            entity: "misc",
            name: "On-side Attempts",
            type: "number",
            nullable: true
          },
          "halfTotals.misc.onm": {
            entity: "misc",
            name: "On-side made",
            type: "number",
            nullable: true
          },
          "halfTotals.misc.ptsto": {
            entity: "misc",
            name: "Points from Turnovers",
            type: "number",
            nullable: true
          }
        }
      };
      this.teamDrConfig = {
        entities: {
          Opponent: { name: "Opponent" },
          Date: { name: "Date" },
          Passing: { name: "Passing" },
          Rushing: { name: "Rushing" },
          Receiving: { name: "Receiving" },
          Scoring: { name: "Scoring" },
          Fumbles: { name: "Fumbles" },
          Defense: { name: "Defense" },
          KickReturns: { name: "Kick Returns" },
          PuntReturns: { name: "Punt Returns" },
          Kickoffs: { name: "Kickoffs" },
          Punts: { name: "Punts" },
          FieldGoals: { name: "Field Goals" },
          PATs: { name: "PATs" },
          misc: { name: "Misc" },
          FirstDowns: { name: "FirstDowns" },
          redzone: { name: "Redzone" },
          conversions: { name: "Conversions" },
          Penalties: { name: "Penalties" },
          Drive: { name: "Drive" }
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
          "periodDetails.numPlaysInDrive": {
            entity: "Drive",
            name: "Number of Plays",
            type: "number",
            nullable: true
          },
          "periodDetails.timeOfPossession": {
            entity: "Drive",
            name: "timeOfPossession",
            type: "string",
            nullable: true
          },

        }
      };
      if (localStorage.getItem("entity") === "Advance Player Statistics Search") {
        this.QBsplitSectionChange("players");
      }
      else {
        this.QBsplitSectionChange("teamGames");
      }
    });
  }

  public QBsplitSectionChange(event: any) {
    this.query.rules = [];
    this.QBresults = [];
    this.QBshowResults = false;
    this.mongoDbPipeline = {};
    this.sortByField = {};
    this.QBselectedSplit = event;
    if (event == "players") {
      this.config = this.playersConfig;
    }
    else if (event == "IntermediateData") {
      this.config = this.teamDrConfig;
    }
    else {
      this.config = this.teamGameConfig;
    }
  }
  public QBonEntityChange(event: any) {
    this.query.rules = [];
    this.QBresults = [];
    this.QBshowResults = false;
    this.mongoDbPipeline = {};
    this.sortByField = {};
    this.QBentity = event;
    if (event == "game") {
      this.config = this.teamGameConfig;
    } else if (event == "quarter") {
      this.config = this.teamQtrConfig;
    } else if (event == "drive") {
      this.config = this.teamDrConfig;
    } else {
      this.config = this.teamHalfConfig;
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
      if (this.QBentity !== "game" && this.QBentity !== "half" && this.QBselectedSplit == "teamGames") this.projections["TimeBucket"] = { "$add": ["$qtrTotals.qtrNum", Number(1)] };
      if (this.QBentity !== "game" && this.QBentity !== "quarter" && this.QBselectedSplit == "teamGames") this.projections["TimeBucket"] = { "$add": ["$halfTotals.halfNum", Number(1)] };

    }
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
      if (!this.projections[projectionField] && rule.field !== "games.pos.opos" && rule.field !== "games.pos.dpos" && rule.field !== "pos.opos" && rule.field !== "pos.dpos" && rule.field !== "games.opponentCode" && rule.field !== "opponentCode") {
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
    if (this.QBentity == "quarter" && this.QBselectedSplit == "teamGames") {
      finalPipeline.push({ $unwind: "$qtrTotals" });
      this.QBTime = "Qtr";
    }
    if (this.QBentity == "half" && this.QBselectedSplit == "teamGames") {
      finalPipeline.push({ $unwind: "$halfTotals" });
      this.QBTime = "Half";
    }
    finalPipeline.push({ $match: this.mongoDbPipeline });
    finalPipeline.push({ $project: this.projections });
    finalPipeline.push({ $sort: this.sortByField });
    finalPipeline.push({ $limit: 25 });
    var mongoDBDiv = document.getElementById('mongoQB')!;
    let QBselectedSplit = this.QBselectedSplit;
    this.googleAnalyticsEventsService.emitEvent(QBselectedSplit + " " + this.QBentity + " Query", JSON.stringify(finalPipeline), QBselectedSplit, 2);
    console.log(mongoDBDiv.style.height);
    this.queryService
      .getQueryResults(this.QBselectedSplit, JSON.stringify(finalPipeline))
      .subscribe(
        (results: any) => {
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
