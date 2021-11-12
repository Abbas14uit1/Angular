import { Component, OnInit, ViewChild, Inject, ViewEncapsulation } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/platform-browser";
import { QueryBuilderClassNames, QueryBuilderConfig } from "angular2-query-builder";
import { QueryService } from "app/sport/query/query.service";
import * as moment from "moment";
import { HeaderConfig } from "../../shared/header/header.component";
import { QueryBuilderResultsComponent } from "app/sport/query-builderdb/query-builder-results/query-builder-results.component";
import { TeamColors } from "../../shared/team-colors";
import { projectedFieldsBaseball } from "./projectedFields-baseball";

@Component({
  selector: "app-query-builderdb-baseball",
  templateUrl: "./query-builderdb-baseball.component.html",
  styleUrls: ["./query-builderdb-baseball.component.css"],
  providers: [QueryService],
  encapsulation: ViewEncapsulation.None
})
export class QueryBuilderdbBaseballComponent implements OnInit {
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
  public projectionObject: any = projectedFieldsBaseball;
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
          BaseRunning: { name: "Base Running" },
          fielding: { name: "Fielding" },
          hitting: { name: "Hitting" },
          pitching: { name: "Pitching" },
          hitSituation: { name: "Situational Hitting" },
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
          "games.pos": {
            name: "POS",
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
          "games.stats.hitting.cs": { entity: "BaseRunning", name: "Caught Stealing", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.r": { entity: "BaseRunning", name: "Runs Scored", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.sb": { entity: "BaseRunning", name: "Stolen Bases (Steals)", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.sba": { entity: "BaseRunning", name: "Stolen Base Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.a": { entity: "fielding", name: "Assists", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.ci": { entity: "fielding", name: "CIA", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.e": { entity: "fielding", name: "Errors", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.pb": { entity: "fielding", name: "Passed Balls Allowed", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.po": { entity: "fielding", name: "Putouts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.fielding.sba": { entity: "fielding", name: "Stolen Base Attempts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.ab": { entity: "hitting", name: "At Bats", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.double": { entity: "hitting", name: "Doubles", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.hbp": { entity: "hitting", name: "Hit By Pitch", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.h": { entity: "hitting", name: "Hits", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.hr": { entity: "hitting", name: "Homeruns", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitSummary.lob": { entity: "hitting", name: "Left on Base", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.pa": { entity: "hitting", name: "Plate Appearances", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.rbi": { entity: "hitting", name: "RBI", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitSummary.rcherr": { entity: "hitting", name: "Reached Base on Error", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.single": { entity: "hitting", name: "Singles", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.so": { entity: "hitting", name: "Strikeouts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.tb": { entity: "hitting", name: "Total Bases", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.triple": { entity: "hitting", name: "Triples", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.bb": { entity: "hitting", name: "Walks", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.bk": { entity: "pitching", name: "Balks", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.bf": { entity: "pitching", name: "Batters Faced", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.double": { entity: "pitching", name: "Doubles Allowed", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.er": { entity: "pitching", name: "Earned Runs", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.gdp": { entity: "pitching", name: "Ground Ball Double Plays", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.hbp": { entity: "pitching", name: "Hit By Pitch", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.h": { entity: "pitching", name: "Hits", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.hr": { entity: "pitching", name: "Homeruns", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.ip": { entity: "pitching", name: "Innings Pitched", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.r": { entity: "pitching", name: "Runs", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.sha": { entity: "pitching", name: "Sac Bunts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.sfa": { entity: "pitching", name: "Sac Flies", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.so": { entity: "pitching", name: "Strikeouts", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.triple": { entity: "pitching", name: "Triples", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.bb": { entity: "pitching", name: "Walks", type: "number", defaultValue: 0, nullable: true },
          "games.stats.pitching.wp": { entity: "pitching", name: "Wild Pitches", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitSummary.rbi2Out": { entity: "hitSituation", name: "RBI with 2 Outs", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.sf": { entity: "hitSituation", name: "Sacrifice Flies", type: "number", defaultValue: 0, nullable: true },
          "games.stats.hitting.sh": { entity: "hitSituation", name: "Sacrifice Hits (Bunts)", type: "number", defaultValue: 0, nullable: true },
        }
      };

      this.teamGameConfig = {
        entities: {
          Date: { name: "Date" },
          Opponent: { name: "Opponent" },
          BaseRunning: { name: "Base Running" },
          fielding: { name: "Fielding" },
          hitting: { name: "Hitting" },
          pitching: { name: "Pitching" },
          hitSituation: { name: "Situational Hitting" },
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
          "totals.hitting.cs": { entity: "BaseRunning", name: "Caught Stealing", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.r": { entity: "BaseRunning", name: "Runs Scored", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.sb": { entity: "BaseRunning", name: "Stolen Bases (Steals)", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.sba": { entity: "BaseRunning", name: "Stolen Base Attempts", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.a": { entity: "fielding", name: "Assists", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.ci": { entity: "fielding", name: "CIA", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.e": { entity: "fielding", name: "Errors", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.pb": { entity: "fielding", name: "Passed Balls Allowed", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.po": { entity: "fielding", name: "Putouts", type: "number", defaultValue: 0, nullable: true },
          "totals.fielding.sba": { entity: "fielding", name: "Stolen Base Attempts", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.ab": { entity: "hitting", name: "At Bats", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.double": { entity: "hitting", name: "Doubles", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.hbp": { entity: "hitting", name: "Hit By Pitch", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.h": { entity: "hitting", name: "Hits", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.hr": { entity: "hitting", name: "Homeruns", type: "number", defaultValue: 0, nullable: true },
          "totals.hitSummary.lob": { entity: "hitting", name: "Left on Base", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.pa": { entity: "hitting", name: "Plate Appearances", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.rbi": { entity: "hitting", name: "RBI", type: "number", defaultValue: 0, nullable: true },
          "totals.hitSummary.rcherr": { entity: "hitting", name: "Reached Base on Error", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.single": { entity: "hitting", name: "Singles", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.so": { entity: "hitting", name: "Strikeouts", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.tb": { entity: "hitting", name: "Total Bases", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.triple": { entity: "hitting", name: "Triples", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.bb": { entity: "hitting", name: "Walks", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.bk": { entity: "pitching", name: "Balks", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.bf": { entity: "pitching", name: "Batters Faced", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.double": { entity: "pitching", name: "Doubles Allowed", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.er": { entity: "pitching", name: "Earned Runs", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.gdp": { entity: "pitching", name: "Ground Ball Double Plays", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.hbp": { entity: "pitching", name: "Hit By Pitch", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.h": { entity: "pitching", name: "Hits", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.hr": { entity: "pitching", name: "Homeruns", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.ip": { entity: "pitching", name: "Innings Pitched", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.r": { entity: "pitching", name: "Runs", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.sha": { entity: "pitching", name: "Sac Bunts", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.sfa": { entity: "pitching", name: "Sac Flies", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.so": { entity: "pitching", name: "Strikeouts", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.triple": { entity: "pitching", name: "Triples", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.bb": { entity: "pitching", name: "Walks", type: "number", defaultValue: 0, nullable: true },
          "totals.pitching.wp": { entity: "pitching", name: "Wild Pitches", type: "number", defaultValue: 0, nullable: true },
          "totals.hitSummary.rbi2Out": { entity: "hitSituation", name: "RBI with 2 Outs", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.sf": { entity: "hitSituation", name: "Sacrifice Flies", type: "number", defaultValue: 0, nullable: true },
          "totals.hitting.sh": { entity: "hitSituation", name: "Sacrifice Hits (Bunts)", type: "number", defaultValue: 0, nullable: true },
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
    if (eventSplit == "teamGames") {
      this.config = this.teamGameConfig;
    }
    else this.config = this.playersConfig;

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
