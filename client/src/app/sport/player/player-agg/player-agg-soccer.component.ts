import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { string } from "yargs";
import { TeamColors } from "../../../shared/team-colors";
import { PlayerService } from "../player.service";

@Component({
  selector: "player-agg-soccer",
  templateUrl: "./player-agg-soccer.component.html",
  styleUrls: ["./player-agg-soccer.component.css"],
})
export class PlayerAggSoccerComponent implements OnInit {

  @Input() public sportId: any;
  @Input() public playerId: any;
  @Input() public teamCode: any;
  @Input() public seasonStats: any[];
  @Input() public careerStats: any;
  @Input() public careerStatsGoalTypeStats: any;
  
  public displayedTabs: string[] = [];
  public tabsDone: boolean = false;
  public shared: TeamColors = new TeamColors();

  public gameStats: any[];

  public teamColors: any;

  public columnGroups: {
    [key: string]: any[];
  } = {};

  public dataSources: {
    [key: string]: PlayerAggSoccerDataSource;
  } = {};

  public columnDisplayNames: {
    [key: string]: string;
  } = {};

  public displayedColumnsWithSeason: {
    [key: string]: string[];
  } = {};

  public displayedColumns: {
    [key: string]: string[];
  } = {};


  constructor(public route: ActivatedRoute,private playerService: PlayerService) {
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {
try{
  this.fillDataSources();
  this.fillDisplayedColumns();
  this.fillColumnGroups();
  this.fillColumnDisplayNames();
  this.getTabs();
  this.teamColors = this.shared.teamColors;
}catch (ex) {
  console.log(ex);
}
  }
  public fillDataSources() {
    switch (this.sportId) {
      case "MSO":
      case "WSO":{
        this.dataSources.Scoring = new PlayerAggSoccerDataSource(
          this.seasonStats,
          this.careerStats.shots,
          this.sportId,
          "scoring",
          this.careerStatsGoalTypeStats,
        );
        this.dataSources.Shots = new PlayerAggSoccerDataSource(
          this.seasonStats,
          this.careerStats.shots,
          this.sportId,
          "shots",
          this.careerStatsGoalTypeStats,
        );
        this.dataSources.Penalties = new PlayerAggSoccerDataSource(
          this.seasonStats,
          this.careerStats.planty,
          this.sportId,
          "penalties",
          this.careerStatsGoalTypeStats,
        );
        this.dataSources.Misc = new PlayerAggSoccerDataSource(
          this.seasonStats,
          this.careerStats.shots,
          this.sportId,
          "misc",
          this.careerStatsGoalTypeStats = this.careerStats.goaltype,
        );
        this.dataSources.Goalie = new PlayerAggSoccerDataSource(
          this.seasonStats,
          this.careerStats.goalie,
          this.sportId,
          "goalie",
          this.careerStatsGoalTypeStats,
        );
      } 
      break; 
    }
  }

  public fillDisplayedColumns() {
    switch (this.sportId) {
      case "WSO":
      case "MSO":
        {
          this.displayedColumns.Scoring = [
            "opponentName",
            "ScoringGp",
            "ScoringGs",
            "ScoringMin",
            "ScoringG",
            "ScoringA",
            "ScoringPTS"
          
          ];
          this.displayedColumnsWithSeason.Scoring = ["season"].concat(
            this.displayedColumns.Scoring,
          );

          this.displayedColumns.Shots = [
            "ShotsGp",
            "ShotsGs",
            "ShotsMin",
            "ShotsG",
            "ShotsSh",
            "ShotsPct",
            "ShotsSog",
            "ShotsSogPct"
          ];
          this.displayedColumnsWithSeason.Shots = ["season"].concat(
            this.displayedColumns.Shots,
          );
          this.displayedColumns.Penalties = [
            "PenaltiesGP",
            "PenaltiesGs",
            "PenaltiesMin",
            "PenaltiesF",
            "PenaltiesYc",
            "PenaltiesRc"
          ];
          this.displayedColumnsWithSeason.Penalties = ["season"].concat(
            this.displayedColumns.Penalties,
          );
          this.displayedColumns.Misc = [
            "MiscGp",
            "MiscGs",
            "MiscMin",
            "MiscGwg",
            "MiscG",
            "MiscAtt"
          ];
          this.displayedColumnsWithSeason.Misc = ["season"].concat(
            this.displayedColumns.Misc,
          );
          this.displayedColumns.Goalie = [
            "GoalieGp",
            "GoalieGs",
            "GoalieMin",
            "GoalieGa",
            "GoalieGaa",
            "GoalieSv",
            "GoaliePct",
            "GoalieSho",
            "GoalieSf"
          ];
          this.displayedColumnsWithSeason.Goalie = ["season"].concat(
            this.displayedColumns.Goalie,
          );
        }
      }
    }
    public fillColumnGroups() {
      switch (this.sportId) {
        case "MSO":
        case "WSO":
          {
            this.columnGroups.Scoring = [];
            this.columnGroups.Shots = [];
            this.columnGroups.Penalties = [];
            this.columnGroups.Misc = [
              {
                name: "GP",
                colSpan: 1,
              },
              {
                name: "GP",
                colSpan: 1,
              },
              {
                name: "PENALTY KICKS",
                colSpan: 3,
              },
            ];
            this.columnGroups.Goalie = [];
          }
          break;
      }
    }
  public getTabs() {
    switch (this.sportId) {
      case "MSO":
      case "WSO":{
      this.displayedTabs.push("Scoring");
      this.displayedTabs.push("Shots");
      this.displayedTabs.push("Penalties");
      this.displayedTabs.push("Misc");
      this.displayedTabs.push("Goalie");

      }
    }

    this.tabsDone = true;
  }

  public getTabLabels(tab: string){
    let tabLabel = tab;
    switch (tab) {
      case "Scoring":
        tabLabel = "Scoring";
        break;
      case "Shots":
        tabLabel = "Shots";
        break;
      case "Penalties":
        tabLabel = "Penalties";
        break;
      case "Misc":
        tabLabel = "Misc";  
        break;    
        case "Goalie":
          tabLabel =  "Goalie";  
          break;    
    }
    return tabLabel;
  }


  public fillColumnDisplayNames() {
    switch (this.sportId) {
      case "MSO":
      case "WSO":
        {
          //scoring
          this.columnDisplayNames.ScoringGp = "GP";
          this.columnDisplayNames.ScoringGs = "GS";
          this.columnDisplayNames.ScoringMin = "MIN";
          this.columnDisplayNames.ScoringG = "G";
          this.columnDisplayNames.ScoringA = "A";
          this.columnDisplayNames.ScoringPTS = "PTS";

          //Shots
          this.columnDisplayNames.ShotsGp = "GP";
          this.columnDisplayNames.ShotsGs = "GS";
          this.columnDisplayNames.ShotsMin = "MIN";
          this.columnDisplayNames.ShotsG = "G";
          this.columnDisplayNames.ShotsSh = "SH";
          this.columnDisplayNames.ShotsPct = "SH%";
          this.columnDisplayNames.ShotsSog = "SOG";
          this.columnDisplayNames.ShotsSogPct = "SOG%";

          //Penalties
          this.columnDisplayNames.PenaltiesGP = "GP";
          this.columnDisplayNames.PenaltiesGs = "GS";
          this.columnDisplayNames.PenaltiesMin = "MIN";
          this.columnDisplayNames.PenaltiesF = "F";
          this.columnDisplayNames.PenaltiesYc = "YC";
          this.columnDisplayNames.PenaltiesRc = "RC";

          //Misc
          this.columnDisplayNames.MiscGp = "GP";
          this.columnDisplayNames.MiscGs = "GS";
          this.columnDisplayNames.MiscMin = "MIN";
          this.columnDisplayNames.MiscGwg = "GWG";
          this.columnDisplayNames.MiscG = "G";
          this.columnDisplayNames.MiscAtt = "ATT";

          //Goalie
          this.columnDisplayNames.GoalieGp = "GP";
          this.columnDisplayNames.GoalieGs = "GS";
          this.columnDisplayNames.GoalieMin = "MP";
          this.columnDisplayNames.GoalieGa = "GA";
          this.columnDisplayNames.GoalieGaa = "GAA";
          this.columnDisplayNames.GoalieSv = "SV";
          this.columnDisplayNames.GoaliePct = "SV%";
          this.columnDisplayNames.GoalieSho = "SHO";
          this.columnDisplayNames.GoalieSf = "SF";

        }
        break;
    }
  }

}

 export class  PlayerAggSoccerDataSource extends DataSource<any> {
//   /** Connect function called by the table to retrieve one stream containing the data to render. */
  constructor(
    private seasonData: any,
    private careerData: any,
    private sportId: string,
    private tab: string,
    private careerStatsGoalTypeData :any,
  ) {
    super();
  }

  TotalShotsPct:any;

  public combineData(sport: any,tab:string) {
    const data: any[] = [];
    switch (sport) {
      case "MSO":
      case "WSO":
        {
         return this.getDataSource(tab);
        }
      }
      return data.sort((a, b) => a.season - b.season);
    }

    public getDataSource(tab: string) {
      const data: any[] = [];
      switch (tab.toLowerCase().trim()) {      
        case "scoring":
          this.seasonData.forEach((S: any) => {
            const x = {
              ScoringGp:S.GP,
              ScoringGs:S.GS,
              ScoringMin:S.Mins,  
              ScoringG:S.shots.shotsG,
              ScoringA:S.shots.shotsA,
              ScoringPTS:(S.shots.shotsG + S.shots.shotsA)*2,
              season: null,
            };
            x.season = S.season;
            data.push(x);
          });
          
          //Totalcalculation start
          var TotalGP = 0;
          var TotalGs = 0;
          var TotalMins = 0;
          var TotalG = 0;
          var TotalA = 0;
          var TotalPTC = 0;

          this.seasonData.forEach((S: any) => {
            TotalGP += S.GP;
            TotalGs += S.GS;
            TotalMins += S.Mins;
            TotalG += S.shots.shotsG;
            TotalA += S.shots.shotsA;
            TotalPTC += (S.shots.shotsG + S.shots.shotsA)*2;
          });
          const Scoring = {
            ScoringGp:TotalGP,
            ScoringGs:TotalGs,
            ScoringMin:TotalMins,
            ScoringG:TotalG,
            ScoringA:TotalA,
            ScoringPTS: TotalPTC,
            season: "TOTAL",
          };
          data.push(Scoring);
            //Totalcalculation end
          break;
        case "shots":
          this.seasonData.forEach((S: any) => {
            const x = {
              ShotsGp:S.GP,
              ShotsGs:S.GS,
              ShotsMin:S.Mins,
              ShotsG:S.shots.shotsG,
              ShotsSh:S.shots.shotsSH,
              ShotsPct: isNaN(S.shots.shotsG / S.shots.shotsSH) ? 0 : ((S.shots.shotsG / S.shots.shotsSH).toFixed(3)).startsWith("0.") ? ((S.shots.shotsG / S.shots.shotsSH).toFixed(3)).substring(1) : Number((S.shots.shotsG / S.shots.shotsSH).toFixed(3)),
              ShotsSog: S.shots.shotsSOG,
              ShotsSogPct: isNaN(S.shots.shotsSOG / S.shots.shotsSH) ? 0 : ((S.shots.shotsSOG / S.shots.shotsSH).toFixed(3)).startsWith("0.") ? ((S.shots.shotsSOG / S.shots.shotsSH).toFixed(3)).substring(1) : Number((S.shots.shotsSOG / S.shots.shotsSH).toFixed(3)),
              season: null,
            };
            x.season = S.season;
            data.push(x);
          });

          //Totalcalculation
          var TotalShotsGp = 0;
          var TotalShotsGs = 0;
          var TotalShotsMin = 0;
          var TotalShotsG = 0;
          var TotalShotsSh = 0;
          var TotalShotsPct = 0;
          var TotalShotsSog = 0;
          var TotalShotsSogPct=0;
          
          var a = "";
          var sogpct = "";
          this.seasonData.forEach((S: any) => {
            a = (isNaN(S.shots.shotsG / S.shots.shotsSH) ? 0 : (S.shots.shotsG / S.shots.shotsSH).toFixed(3)).toString();
            sogpct = (isNaN(S.shots.shotsSOG / S.shots.shotsSH) ? 0 : (S.shots.shotsSOG / S.shots.shotsSH).toFixed(3)).toString();
     
            var shpct = parseFloat(a);
            var sogpctt = parseFloat(sogpct);

              TotalShotsGp += S.GP;
              TotalShotsGs += S.GS;
              TotalShotsMin += S.Mins;
              TotalShotsG += S.shots.shotsG;
              TotalShotsSh += S.shots.shotsSH;
              TotalShotsPct += shpct;
              TotalShotsSog += S.shots.shotsSOG;           
              TotalShotsSogPct +=  sogpctt;
          });

          const c = {
            ShotsGp:TotalShotsGp,
            ShotsGs:TotalShotsGs,
            ShotsMin:TotalShotsMin,
            ShotsG : TotalShotsG,
            ShotsSh:TotalShotsSh,
            ShotsPct:TotalShotsPct.toFixed(3).split('.')[0] > "0" ?( TotalShotsPct.toFixed(3) === "0.000" ? 0:TotalShotsPct.toFixed(3)): "."+TotalShotsPct.toFixed(3).split('.')[1],
            ShotsSog: TotalShotsSog,
            ShotsSogPct: TotalShotsSogPct.toFixed(3).split('.')[0] > "0" ? (TotalShotsSogPct.toFixed(3) === "0.000" ? 0 : TotalShotsSogPct.toFixed(3)) : "."+ TotalShotsSogPct.toFixed(3).split('.')[1],
            season: "TOTAL",
          }
          data.push(c);
          break;
        case "penalties":
          this.seasonData.forEach((S: any) => {
            const x = {
              PenaltiesGP:S.GP,
              PenaltiesGs:S.GS,
              PenaltiesMin:S.Mins,
              PenaltiesF:S.planty.plantyFouls,
              PenaltiesYc:S.planty.plantyGreen,
              PenaltiesRc: S.planty.plantyYellow,
              season: null,
            };
            x.season = S.season;
            data.push(x);
          });
//Totalcalculation start
          var TotalPenaltiesGP = 0;
          var TotalPenaltiesGs = 0;
          var TotalPenaltiesMin = 0;
          var TotalPenaltiesF = 0;
          var TotalPenaltiesYc = 0;
          var TotalPenaltiesRc = 0;

          this.seasonData.forEach((S: any) => {
              TotalPenaltiesGP += S.GP;
              TotalPenaltiesGs += S.GS;
              TotalPenaltiesMin +=S.Mins;
              TotalPenaltiesF += S.planty.plantyFouls;
              TotalPenaltiesYc += S.planty.plantyGreen;
              TotalPenaltiesRc += S.planty.plantyYellow;
          });

          const pen = {
            PenaltiesGP:TotalPenaltiesGP,
            PenaltiesGs:TotalPenaltiesGs,
            PenaltiesMin:TotalPenaltiesMin,
            PenaltiesF:TotalPenaltiesF,
            PenaltiesYc:TotalPenaltiesYc,
            PenaltiesRc: TotalPenaltiesRc,
            season: "TOTAL",
          }
          data.push(pen);
          //Totalcalculation end
          break;
        case "misc":
          this.seasonData.forEach((S: any) => {
            const x = {
              MiscGp  :S.GP,
              MiscGs  :S.GS,
              MiscMin :S.Mins,
              MiscGwg :S.goaltype.goaltypeGW,
              MiscG : S.shots.shotsPS,
              MiscAtt : S.shots.shotsPSATT,
              season: null,
            };
            x.season = S.season;
            data.push(x);
          });

          //Totalcalculation start
          var TotalMiscGp = 0;
          var TotalMiscGs = 0;
          var TotalMiscMin = 0;
          var TotalMiscGwg = 0;
          var TotalMiscG = 0;
          var TotalMiscAtt = 0;

          this.seasonData.forEach((S: any) => {
              TotalMiscGp += S.GP;
              TotalMiscGs += S.GS;
              TotalMiscMin += S.Mins;
              TotalMiscGwg += S.goaltype.goaltypeGW;
              TotalMiscG += S.shots.shotsPS;
              TotalMiscAtt += S.shots.shotsPSATT;
        });
          const misc = {
            MiscGp  :TotalMiscGp,
            MiscGs  :TotalMiscGs,
            MiscMin :TotalMiscMin,
            MiscGwg :TotalMiscGwg,
            MiscG : TotalMiscG,
            MiscAtt : TotalMiscAtt,
            season: "TOTAL",
          }
          data.push(misc);
          //Totalcalculation end

          break;
        case "goalie":
          this.seasonData.forEach((S: any) => {
            const x = {
              GoalieGp  :S.goalie.goalieGP,
              GoalieGs  :S.goalie.goalieGS,
              GoalieMin :S.goalie.goalieMins,
              GoalieGa :S.goalie.goalieGA,
              GoalieGaa :isNaN((S.goalie.goalieGA * 90 )/S.goalie.goalieMins) ? 0 : (S.goalie.goalieGA * 90 )/S.goalie.goalieMins?0: (S.goalie.goalieGA * 90 )/S.goalie.goalieMins,
              GoalieSv : S.goalie.goalieSaves,
              GoaliePct :isNaN(S.goalie.saves/ S.goalie.opposog) ? 0 : ((S.goalie.saves/ S.goalie.opposog).toFixed(3)).startsWith("0.") ? ((S.goalie.saves/ S.goalie.opposog).toFixed(3)).substring(1) : Number((S.goalie.saves/ S.goalie.opposog).toFixed(3)),
              GoalieSho:S.goalie.goalieShutout === undefined ? '' : S.goalie.goalieShutout,
              GoalieSf:S.goalie.goalieSf,
              season: null,
            };
            x.season = S.season;
            data.push(x);
          });

          //Totalcalculation start
          var TotalGoalieGp = 0;
          var TotalGoalieGs = 0;
          var TotalGoalieMin = 0;
          var TotalGoalieGa = 0;
          var TotalGoalieGaa = 0;
          var TotalGoalieSv = 0;
          var TotalGoaliePct = 0;
          var TotalGoalieW = 0;
          var TotalGoalieL = 0;
          var TotalGoalieT = 0;
          var TotalGoalieSho = 0;
          var TotalGoalieSf = 0;

          this.seasonData.forEach((S: any) => {
            a = (isNaN(S.goalie.saves/ S.goalie.opposog) ? 0 : (S.goalie.saves/ S.goalie.opposog).toFixed(3)).toString();
            var shpct = parseFloat(a);

              TotalGoalieGp += S.goalie.goalieGP;
              TotalGoalieGs += S.goalie.goalieGS;
              TotalGoalieMin += S.goalie.goalieMins;
              TotalGoalieGa += S.goalie.goalieGA;
              TotalGoalieGaa += isNaN((S.goalie.goalieGA * 90 )/S.goalie.goalieMins) ? 0 : (S.goalie.goalieGA * 90 )/S.goalie.goalieMins?0: (S.goalie.goalieGA * 90 )/S.goalie.goalieMins;
              TotalGoalieSv += S.goalie.goalieSaves;
              TotalGoaliePct += shpct;
              // TotalGoalieW += S.goalie.W;
              // TotalGoalieL += S.goalie.L;
              // TotalGoalieT += S.goalie.T;
              TotalGoalieSho += S.goalie.goalieShutout === undefined ? '' : S.goalie.goalieShutout;
              TotalGoalieSf += S.goalie.goalieSf;
      });


          const goalie = {
            GoalieGp  :TotalGoalieGp,
            GoalieGs  :TotalGoalieGs,
            GoalieMin :TotalGoalieMin,
            GoalieGa :TotalGoalieGa,
            GoalieGaa :TotalGoalieGaa,
            GoalieSv : TotalGoalieSv,
            GoaliePct : TotalGoaliePct,
            // GoalieW: TotalGoalieW,
            // GoalieL:TotalGoalieL,
            // GoalieT:TotalGoalieT,
            GoalieSho:TotalGoalieSho,
            GoalieSf:TotalGoalieSf,
            season: "TOTAL",
          }
          data.push(goalie);
          //Totalcalculation end
          break;
        }
        return data.sort((a, b) => a.season - b.season);
      }

      public connect(): Observable<any[]> {
        const data: any[] = this.combineData(this.sportId,this.tab);
        return Observable.of(data);
      }
    
      public disconnect() {
        return;
      }
}