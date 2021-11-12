import { AnimationTransitionEvent, Component, Input, OnInit, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/platform-browser";
// tslint:disable-next-line:max-line-length
import { IGameScoring, IPlayerRushing, ITeamStats } from "../../../../../../../typings/athlyte/football/game/game.d";
import { TeamColors } from "../../../../shared/team-colors";
import { GameService } from "../../game.service";

@Component({
  selector: "app-summary-football",
  templateUrl: "./summary-football.component.html",
  styleUrls: ["./summary-football.component.css"],
  providers: [GameService]
})
export class SummaryFootballComponent implements OnInit {

  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public gameId: any;
  @Input() public sportId: any;
  private showFullStas: boolean = false;  
  public teamColors: any;
  public shared: TeamColors = new TeamColors();

  public overallTeamStats: ITeamStats[];
  public overallOffensePlays: any[];
  public scoringPlays: IGameScoring[];

  public homeRushingData: any[];
  public awayRushingData: any[];
  public homePassingData: any[];
  public awayPassingData: any[];
  public homeReceivingData: any[];
  public awayReceivingData: any[];
  public homeDefenseData: any[];
  public awayDefenseData: any[];
  public homeInterceptionsData: any[];
  public awayInterceptionsData: any[];
  public homeFumblesData: any[];
  public awayFumblesData: any[];
  public homeSpecialStats: any[];
  public awaySpecialStats: any[];


  public homeRushingLength: number;
  public awayRushingLength: number;
  public homePassingLength: number;
  public awayPassingLength: number;
  public homeReceivingLength: number;
  public awayReceivingLength: number;
  public homeDefenseLength: number;
  public awayDefenseLength: number;
  public homeInterceptionsLength: number;
  public awayInterceptionsLength: number;
  public homeFumblesLength: number;
  public awayFumblesLength: number;
  public homeSpecialStatsLength: number;
  public awaySpecialStatsLength: number;

  public homePuntings: any[];
  public awayPuntings: any[];
  public homeKickOffs: any[];
  public awayKickOffs: any[];
  public homeFieldGoals: any[];
  public awayFieldGoals: any[];
  public homeAllReturns: any[];
  public awayAllReturns: any[];
  public homePuntingsLength: number; 
  public awayPuntingsLength: number;
  public homeKickOffsLength: number;
  public awayKickOffsLength: number;
  public homeFieldGoalsLength: number;
  public awayFieldGoalsLength: number;
  public homeAllReturnsLength: number;
  public awayAllReturnsLength: number;

  constructor(private gameService: GameService,@Inject(DOCUMENT) private document: Document) {
    this.teamColors = this.shared.teamColors;
  }
  public ngOnInit() {
    this.gameService.getOverallTeamStats(this.gameId, this.sportId)
      .subscribe((teamstats) => this.overallTeamStats = teamstats,
      (err) => null,
    );
    this.gameService.getAllPlays(this.gameId, this.sportId)
      .subscribe((plays) => this.overallOffensePlays = plays,
      (err) => null,
    );
    this.gameService.getPlayerRushing(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerRushing) => this.homeRushingData = playerRushing,
      (err) => null,
      () => this.homeRushingLength = this.homeRushingData.length,
    );
    this.gameService.getPlayerRushing(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerRushing) => this.awayRushingData = playerRushing,
      (err) => null,
      () => this.awayRushingLength = this.awayRushingData.length,
    );
    this.gameService.getPlayerPassing(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerPassing) => this.homePassingData = playerPassing,
      (err) => null,
      () => this.homePassingLength = this.homePassingData.length,
    );
    this.gameService.getPlayerPassing(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerPassing) => this.awayPassingData = playerPassing,
      (err) => null,
      () => this.awayPassingLength = this.awayPassingData.length,
    );
    this.gameService.getPlayerReceiving(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerReceiving) => this.homeReceivingData = playerReceiving,
      (err) => null,
      () => this.homeReceivingLength = this.homeReceivingData.length,
    );
    this.gameService.getPlayerReceiving(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerReceiving) => this.awayReceivingData = playerReceiving,
      (err) => null,
      () => this.awayReceivingLength = this.awayReceivingData.length,
    );
    this.gameService.getPlayerDefense(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerDefense) => this.homeDefenseData = playerDefense,
      (err) => null,
      () => this.homeDefenseLength = this.homeDefenseData.length,
    );
    this.gameService.getPlayerDefense(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerDefense) => this.awayDefenseData = playerDefense,
      (err) => null,
      () => this.awayDefenseLength = this.awayDefenseData.length,
    );
    this.gameService.getPlayerInterceptions(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerInterceptions) => this.homeInterceptionsData = playerInterceptions,
      (err) => null,
      () => this.homeInterceptionsLength = this.homeInterceptionsData.length,
    );
    this.gameService.getPlayerInterceptions(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerInterceptions) => this.awayInterceptionsData = playerInterceptions,
      (err) => null,
      () => this.awayInterceptionsLength = this.awayInterceptionsData.length,
    );
 
    this.gameService.getFootBallSpecial(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerSpecialStats) => this.homeSpecialStats = playerSpecialStats,
        (err) => null,
      () => this.homeSpecialStatsLength = this.homeSpecialStats.length,
    );

    this.gameService.getPlayerFumbles(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerSpecialStats) => this.awaySpecialStats = playerSpecialStats,
        (err) => null,
      () => this.awaySpecialStatsLength = this.awaySpecialStats.length,
      );
    this.gameService.getScoringPlays(this.gameId, this.sportId)
      .subscribe(
      (scoringPlays) => this.scoringPlays = scoringPlays,
      (err) => console.log(err),
    );
    this.gameService.getFootBallSpecial(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
        (playerSpecialStats) => {
          this.homePuntings = playerSpecialStats
            .filter((y) => y.punt !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                puntNum: x.punt ? x.punt.puntNum : 0,
                puntYards: x.punt ? x.punt.puntYards : 0,
                avg: x.punt ?
                   x.punt.puntYards === undefined || x.punt.puntNum === undefined || x.punt.puntNum === 0 ? 0 :
                    (x.punt.puntYards/x.punt.puntNum).toFixed(1)
                   :0,
                puntLong: x.punt ? x.punt.puntLong : 0,
                puntInside20: x.punt ? x.punt.puntInside20 : 0,
                puntTb: x.punt ? x.punt.puntTb : 0,
                puntPlus50: x.punt ? x.punt.puntPlus50 : 0,
                puntFc: x.punt ? x.punt.puntFc : 0,
                puntBlocked: x.punt ? x.punt.puntBlocked : 0,
              };
            });
          this.homeKickOffs = playerSpecialStats
            .filter((y) => y.kickoff !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                koNum: x.kickoff ? x.kickoff.koNum : 0,
                koOb: x.kickoff ? x.kickoff.koOb : 0,
                koTb: x.kickoff ? x.kickoff.koTb : 0,
                koYards: x.kickoff ? x.kickoff.koYards : 0,
                avg: x.kickoff ?
                   x.kickoff.koYards === undefined || x.kickoff.koNum === undefined || x.kickoff.koNum === 0 ? 0 :
                    (x.kickoff.koYards/x.kickoff.koNum).toFixed(1)
                   :0,
              };
            });
          this.homeFieldGoals = playerSpecialStats
            .filter((y) => y.fieldgoal !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                fgAtt: x.fieldgoal ? x.fieldgoal.fgAtt : 0,
                fgBlocked: x.fieldgoal ? x.fieldgoal.fgBlocked : 0,
                fgLong: x.fieldgoal ? x.fieldgoal.fgLong : 0,
                fgMade: x.fieldgoal ? x.fieldgoal.fgMade : 0,
                fgPct: x.fieldgoal ?
                   x.fieldgoal.fgAtt === undefined || x.fieldgoal.fgMade === undefined || x.fieldgoal.fgAtt === 0 ? 0 :
                    ((x.fieldgoal.fgMade/x.fieldgoal.fgAtt) *100).toFixed(1)
                   :0,
                kickatt: x.pointAfter ? x.pointAfter.kickatt : 0,
                kickmade: x.pointAfter ? x.pointAfter.kickmade : 0,
                kckMadePct: x.pointAfter ?
                   x.pointAfter.kickatt === undefined || x.pointAfter.kickmade === undefined || x.pointAfter.kickatt === 0 ? 0 :
                    ((x.pointAfter.kickmade/x.pointAfter.kickatt) *100).toFixed(1)
                   :0,
                pts:  ((x.fieldgoal ? x.fieldgoal.fgMade : 0) * 3) + ((x.pointAfter ? x.pointAfter.kickmade : 0) * 1)
              };
            });
          this.homeAllReturns = playerSpecialStats
            .filter((y) => y.puntReturn !== null || y.kickReceiving !== null || y.intReturn !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                prNo: x.puntReturn ? x.puntReturn.prNo : 0,
                prYards: x.puntReturn ? x.puntReturn.prYards : 0,
                prAvg:  x.puntReturn ?
                   x.puntReturn.prYards === undefined 
                   || x.puntReturn.prNo === undefined 
                   || x.puntReturn.prNo === 0 ? 0 :
                    (x.puntReturn.prYards/x.puntReturn.prNo).toFixed(1)
                   :0,               
                prLong: x.puntReturn ? x.puntReturn.prLong : 0,
                irLong: x.intReturn ? x.intReturn.irLong : 0,
                irNo: x.intReturn ? x.intReturn.irNo : 0,
                irYards: x.intReturn ? x.intReturn.irYards : 0,
                krNo: x.kickReceiving ? x.kickReceiving.krNo : 0,
                krYards: x.kickReceiving ? x.kickReceiving.krYards : 0,
                krAvg:  x.kickReceiving ?
                   x.kickReceiving.krYards === undefined 
                   || x.kickReceiving.krNo === undefined 
                   || x.kickReceiving.krNo === 0 ? 0 :
                    (x.kickReceiving.krYards/x.kickReceiving.krNo).toFixed(1)
                   :0,
                krLong: x.kickReceiving ? x.kickReceiving.krLong : 0,
                krTd: x.kickReceiving ? x.kickReceiving.krTd : 0,
                prTd:x.puntReturn ? x.puntReturn.prTd : 0,
              };
            });

        },
        (err) => null,
        () => {
          this.homePuntingsLength = this.homePuntings.length;
          this.homeKickOffsLength = this.homeKickOffs.length;
          this.homeFieldGoalsLength = this.homeFieldGoals.length;
          this.homeAllReturnsLength = this.homeAllReturns.length;
        },
      );
    this.gameService.getFootBallSpecial(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
        (playerSpecialStats) => {
          this.awayPuntings = playerSpecialStats
            .filter((y) => y.punt !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                puntNum: x.punt ? x.punt.puntNum : 0,
                puntYards: x.punt ? x.punt.puntYards : 0,
                avg: x.punt ?
                   x.punt.puntYards === undefined || x.punt.puntNum === undefined || x.punt.puntNum === 0 ? 0 :
                    (x.punt.puntYards/x.punt.puntNum).toFixed(1)
                   :0,
                puntLong: x.punt ? x.punt.puntLong : 0,
                puntInside20: x.punt ? x.punt.puntInside20 : 0,
                puntTb: x.punt ? x.punt.puntTb : 0,
                puntPlus50: x.punt ? x.punt.puntPlus50 : 0,
                puntFc: x.punt ? x.punt.puntFc : 0,
                puntBlocked: x.punt ? x.punt.puntBlocked : 0,
              };
            });
          this.awayKickOffs = playerSpecialStats
            .filter((y) => y.kickoff !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                koNum: x.kickoff ? x.kickoff.koNum : 0,
                koOb: x.kickoff ? x.kickoff.koOb : 0,
                koTb: x.kickoff ? x.kickoff.koTb : 0,
                koYards: x.kickoff ? x.kickoff.koYards : 0,
                avg: x.kickoff ?
                   x.kickoff.koYards === undefined || x.kickoff.koNum === undefined || x.kickoff.koNum === 0 ? 0 :
                    (x.kickoff.koYards/x.kickoff.koNum).toFixed(1)
                   :0,
              };
            });
          this.awayFieldGoals = playerSpecialStats
            .filter((y) => y.fieldgoal !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                fgAtt: x.fieldgoal ? x.fieldgoal.fgAtt : 0,
                fgPct: x.fieldgoal ?
                   x.fieldgoal.fgAtt === undefined || x.fieldgoal.fgMade === undefined || x.fieldgoal.fgAtt === 0 ? 0 :
                    ((x.fieldgoal.fgMade/x.fieldgoal.fgAtt) *100).toFixed(1)
                   :0,
                fgBlocked: x.fieldgoal ? x.fieldgoal.fgBlocked : 0,
                fgLong: x.fieldgoal ? x.fieldgoal.fgLong : 0,
                fgMade: x.fieldgoal ? x.fieldgoal.fgMade : 0,
                kickatt: x.pointAfter ? x.pointAfter.kickatt : 0,
                kickmade: x.pointAfter ? x.pointAfter.kickmade : 0,
                kckMadePct: x.pointAfter ?
                   x.pointAfter.kickatt === undefined || x.pointAfter.kickmade === undefined || x.pointAfter.kickatt === 0 ? 0 :
                    ((x.pointAfter.kickmade/x.pointAfter.kickatt) *100).toFixed(1)
                   :0,
                pts:  ((x.fieldgoal ? x.fieldgoal.fgMade : 0) * 3) + ((x.pointAfter ? x.pointAfter.kickmade : 0) * 1)
                
              };
            });
          this.awayAllReturns = playerSpecialStats
            .filter((y) => y.puntReturn !== null || y.kickReceiving !== null || y.intReturn !== null)
            .map((x) => {
              return {
                _id: x._id,
                name: x.name,
                prNo: x.puntReturn ? x.puntReturn.prNo : 0,
                prYards: x.puntReturn ? x.puntReturn.prYards : 0,
                prLong: x.puntReturn ? x.puntReturn.prLong : 0,
                irLong: x.intReturn ? x.intReturn.irLong : 0,
                irNo: x.intReturn ? x.intReturn.irNo : 0,
                irYards: x.intReturn ? x.intReturn.irYards : 0,
                krNo: x.kickReceiving ? x.kickReceiving.krNo : 0,
                krYards: x.kickReceiving ? x.kickReceiving.krYards : 0,
                krLong: x.kickReceiving ? x.kickReceiving.krLong : 0,
                prAvg:  x.puntReturn ?
                   x.puntReturn.prYards === undefined 
                   || x.puntReturn.prNo === undefined 
                   || x.puntReturn.prNo === 0 ? 0 :
                    (x.puntReturn.prYards/x.puntReturn.prNo).toFixed(1)
                   :0,
                krAvg:  x.kickReceiving ?
                   x.kickReceiving.krYards === undefined 
                   || x.kickReceiving.krNo === undefined 
                   || x.kickReceiving.krNo === 0 ? 0 :
                    (x.kickReceiving.krYards/x.kickReceiving.krNo).toFixed(1)
                   :0,
                   krTd: x.kickReceiving ? x.kickReceiving.krTd : 0,
                prTd:x.puntReturn ? x.puntReturn.prTd : 0,
              };
            });
        },
        (err) => null,
        () => {
          this.awayPuntingsLength = this.awayPuntings.length;
          this.awayKickOffsLength = this.awayKickOffs.length;
          this.awayFieldGoalsLength = this.awayFieldGoals.length;
          this.awayAllReturnsLength = this.awayAllReturns.length;
        },
      );

  }
   public onClick(newValue: any, stat: boolean) {  
   var mainDiv = document.getElementById('app-content')!;
     mainDiv.scrollTop = 0; 
    this.showFullStas= !stat;
  }
}
