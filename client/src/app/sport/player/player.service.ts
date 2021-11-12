import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";

const URL = environment.API_URL + "/api_v1/player/";
const teamURL = environment.API_URL + "/api_v1/teams/name/teamcode/";

@Injectable()
export class PlayerService {

  constructor(
    private http: HttpClient,
  ) { }

  public getPlayerSeasonStats(id: string, sport: string) {
    return this.http.get(URL + sport + "/stats/season/" + id)
      .map(this.extractData);
  }
  public getPlayerCareerStats(id: string, sport: string) {
    return this.http.get(URL + sport + "/stats/career/" + id)
      .map(this.extractData);
  }

  public getPlayerGameStats(id: string, sport: string) {
    return this.http.get(URL + sport + "/stats/game/" + id)
      .map(this.extractData);
  }

  public getPlayerInfo(id: string, sport: string) {
    return this.http.get(URL + sport + "/info/" + id)
      .map(this.extractData);
  }

  public getTeamCode(id: string, sport: string) {
    return this.http.get(teamURL + id)
      .map(this.extractData);
  }

  private extractData(res: any) {
    return res.data || {};
  }
}
