import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { IPlayerHittingStats, IPlayerPitchingStats } from "../../../../../typings/athlyte/baseball/game/game.d";
import { IPlay as IPlayBaseBall } from "../../../../../typings/athlyte/baseball/play";
import { IPlay as IPlayBasketBall } from "../../../../../typings/athlyte/basketball/play";
import {
  IBaseBallTeamStats,
  IBasketBallTeamStats,
  IGameBaseBallScoring,
  IGameBasketBallScoring,
  IGameFullRosterPlayer,
  IGameInfo,
  IGamePlayByPlay,
  IGameScoring,
  IGameStarterRosterPlayer,
  IPlayerDefense,
  IPlayerFumbles,
  IPlayerInterceptions,
  IPlayerPassing,
  IPlayerReceiving,
  IPlayerRushing,
  ITeamGame,
  ITeamStats,
  ITeamTidyNames,
} from "../../../../../typings/athlyte/football/game/game.d";
import { IFieldPosition, VH } from "../../../../../typings/athlyte/football/index";
import { IPlay, IPlayResults } from "../../../../../typings/athlyte/football/play";
import { environment } from "../../../environments/environment";

enum SpecialResult {
  firstDown,
  touchdown,
  touchback,
  safety,
  none,
}

const URL = environment.API_URL + "/api_v1/game/";

@Injectable()
export class GameService {

  constructor(private http: HttpClient) { }

  public getGameInfo(gameId: string, sport: string): Observable<IGameInfo[]> {
    return this.http.get(URL + sport + "/" + gameId)
      .map(this.extractData);
  }

  public getOverallTeamStats(gameId: string, sport: string): Observable<ITeamStats[]> {
    return this.http.get(URL + sport + "/teamstats/" + gameId)
      .map(this.extractData);
  }

  public getTeamGames(gameId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/teams/" + gameId)
      .map(this.extractData);
  }

  public getPlayerRushing(gameId: string, teamId: string, sport: string): Observable<IPlayerRushing[]> {
    return this.http.get(URL + sport + "/rushing/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerPassing(gameId: string, teamId: string, sport: string): Observable<IPlayerPassing[]> {
    return this.http.get(URL + sport + "/passing/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerReceiving(gameId: string, teamId: string, sport: string): Observable<IPlayerReceiving[]> {
    return this.http.get(URL + sport + "/receiving/" + gameId + "/" + teamId)
      .map(this.extractData)
      .mergeMap((p) => {
        const pWithTarg: IPlayerReceiving[] = [];
        p.forEach((player: IPlayerReceiving) => {
          // tslint:disable-next-line:max-line-length
          this.http.get(URL + sport + "/receiving/targets/" + gameId + "/" + player._id)
          .map(this.extractData)
          .subscribe((n) => {
            player.targets = n[0] ? n[0].targets : 0;       
          });     
          pWithTarg.push(player);     
        });                
        return Observable.of(pWithTarg);
      });
  }

  public getFullRoster(gameId: string, teamId: string, sport: string): Observable<IGameFullRosterPlayer[]> {
    return this.http.get(URL + sport + "/fullroster/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getStarterRoster(gameId: string, teamId: string, sport: string): Observable<IGameStarterRosterPlayer[]> {
    return this.http.get(URL + sport + "/starterroster/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerDefense(gameId: string, teamId: string, sport: string): Observable<IPlayerDefense[]> {
    return this.http.get(URL + sport + "/defense/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerInterceptions(gameId: string, teamId: string, sport: string): Observable<IPlayerInterceptions[]> {
    return this.http.get(URL + sport + "/interceptions/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerFumbles(gameId: string, teamId: string, sport: string): Observable<IPlayerFumbles[]> {
    return this.http.get(URL + sport + "/fumbles/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getScoringPlays(gameId: string, sport: string): Observable<IGameScoring[]> {
    return this.http.get(URL + sport + "/plays/scoring/" + gameId)
      .map(this.extractData);
  }

  public getAllPlays(gameId: string, sport: string): Observable<IPlay[]> {
    return this.http.get(URL + sport + "/plays/" + gameId)
      .map(this.extractData);
  }
  
  public getPlayerHittings(gameId: string, teamId: string, sport: string): Observable<IPlayerHittingStats[]> {
    return this.http.get(URL + sport + "/hitting/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayerPitchings(gameId: string, teamId: string, sport: string): Observable<IPlayerPitchingStats[]> {
    return this.http.get(URL + sport + "/pitching/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
    public getPlayerBaserunning(gameId: string, teamId: string, sport: string): Observable<IPlayerHittingStats[]> {
    return this.http.get(URL + sport + "/baserunning/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
    public getPlayerFielding(gameId: string, teamId: string, sport: string): Observable<IPlayerHittingStats[]> {
    return this.http.get(URL + sport + "/fielding/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getOverallBaseBallTeamStats(gameId: string, sport: string): Observable<IBaseBallTeamStats[]> {
    return this.http.get(URL + sport + "/teamstats/" + gameId)
      .map(this.extractData);
  }
  public getBaseBallScoringPlays(gameId: string, sport: string): Observable<IGameBaseBallScoring[]> {
    return this.http.get(URL + sport + "/plays/scoring/" + gameId)
      .map(this.extractData);
  }

  public getAllBaseBallPlays(gameId: string, sport: string): Observable<IPlayBaseBall[]> {
    return this.http.get(URL + sport + "/plays/" + gameId)
      .map(this.extractData);
  }

  public getBasketBallScoringPlays(gameId: string, sport: string): Observable<IGameBasketBallScoring[]> {
    return this.http.get(URL + sport + "/plays/scoring/" + gameId)
      .map(this.extractData);
  }
  public getOverallBasketBallTeamStats(gameId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/teamstats/" + gameId)
      .map(this.extractData);
  }
  public getAllBasketBallPlays(gameId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/plays/" + gameId)
      .map(this.extractData);
  }
  public getBasketBallShootings(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/shooting/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getBasketBallRebound(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/rebound/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getBasketBallSpecial(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/special/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
    public getBasketBallOther(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/other/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getFootBallSpecial(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/specialstats/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  // VAF New Changes
  public getSoccerGoalieSpecial(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/goalie/" + gameId + "/" + teamId)
      .map(this.extractData);
  }

  public getSoccerScoring(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/scoring/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getSoccerMisc(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/misc/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getSoccerShots(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/shots/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  public getSoccerPenalties(gameId: string, teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/penalties/" + gameId + "/" + teamId)
      .map(this.extractData);
  }
  

  private extractData(res: any) {
    return res.data || {};
  }
}
