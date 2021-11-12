import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";

const URL = environment.API_URL + "/api_v1/alerts";

@Injectable()
export class AlertsService {

  constructor(private http: HttpClient) { }

  public queryPreAlerts(
    sportCode: string,
    teamCode: string,
    entity: string,
    oppoTeamCode: string,
  ) 
  {        
    return this.http.get(URL +"/"+sportCode + "/pregame/" + teamCode + "/"+entity+"/"+oppoTeamCode)
      .map(this.extractData);
  }

  public queryPostAlerts(
    sportCode: string,
    teamCode: string,
    oppoTeamCode: string,
    season:string,
    entity: string
  ) 
  {        
    return this.http.get(URL +"/"+sportCode + "/postgame/" + teamCode + "/" + oppoTeamCode +"/"+season+ "/"+entity)
      .map(this.extractData);
  }

  public queryAlerts(
    sportCode: string,
    teamCode: string,
    oppoTeamCode: string,
    season:string,
    entity: string
  )
  {
    return this.http.get(URL +"/"+sportCode + "/" + teamCode + "/" + oppoTeamCode +"/"+season + "/"+entity)
      .map(this.extractData);
  } 

  public queryStories(
    sportCode: string,
    teamCode: string,
    oppoTeamCode: string,
    season:string,
    entity: string
  )
  {
    return this.http.get(environment.API_URL + "/api_v1/stories" +"/"+sportCode + "/" + teamCode + "/"+entity +"/"+season + "/" + oppoTeamCode)
      .map(this.extractData);
  }

  public getAlertsCount(
    sportCode: string,
    teamCode: string,
  ) {
    return this.http.get(URL + "/" + sportCode + "/"+ teamCode)
      .map(this.extractData);
  }

  public getSeasons(teamCode: string, sportCode: string): Observable<any[]> {
    return this.http.get(URL + "/" + sportCode + "/seasons/" + teamCode)
      .map(this.extractData);
  }  

  public getLatestGames(teamCode: string, sportCode: string,selectedSeason: string): Observable<any[]>  {
    return this.http.get(environment.API_URL + "/api_v1/stories" +"/"+ sportCode + "/latest/" + teamCode+"/"+ selectedSeason)
      .map(this.extractData);
  }
  private extractData(res: any) {
    return res.data || {};
  }

}
