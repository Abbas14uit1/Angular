import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { IRoster } from "../../../../../typings/athlyte/football/dashboard/roster.d";
import { ISeasonGame } from "../../../../../typings/athlyte/football/dashboard/season.d";
import { environment } from "../../../environments/environment";
import { TeamColors } from "../../shared/team-colors";

const URL = environment.API_URL + "/api_v1/dashboard/";

@Injectable()
export class DashboardService {

  constructor(private http: HttpClient) { }

  public getSeason(year: number, teamId: string, sport: string): Observable<ISeasonGame[]> {
    return this.http.get(URL + sport + "/season/" + year + "/" + teamId)
      .map(this.extractData);
  }

  public getSeasons(teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URL + sport + "/seasons/" + teamId)
      .map(this.extractData);
  }

  public getSeasonRoster(year: number, teamId: string, sport: string): Observable<IRoster[]> {
    return this.http.get(URL + sport + "/roster/" + year + "/" + teamId)
      .map(this.extractData);
  }

  public getTeam(code: number, sport: string) {
    return this.http.get(URL + sport + "/team/" + code)
      .map(this.extractData);
  }

  private extractData(response: any) {
    return response.data || {};
  }

}
