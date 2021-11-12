import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { QuadtreeInternalNode } from "d3-quadtree";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";

const URL = environment.API_URL + "/api_v1/query";

@Injectable()
export class QueryService {

  constructor(private http: HttpClient) { }

  private getSportTypeUrl(sportType: string, entityType: string) {
    switch (sportType) {
      case "MFB":
        return URL + `/${entityType}/`;
      case "MBB":
      case "WBB":
        return URL + `/basketball/${entityType}/`;
      case "MBA":
      case "WSB":
        return URL + `/baseball/${entityType}/`;
      case "MSO":
      case "WSO":
        return URL + `/soccer/${entityType}/`;
      default:
        return URL + `/${entityType}/`;
    }

  }
  public queryPlayerGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: string
  ) {
    let playerUrl = this.getSportTypeUrl(sportCode, "player");
    let params = new HttpParams();
    const statistics = "statistics";
    const projectJson = "projections";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);

    return this.http.get(playerUrl + split + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/"
      + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/"
      + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId,
      { params: params })
      .map(this.extractData);
  }
  public queryFootballDriveGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: string
  ) {
    let playerUrl = this.getSportTypeUrl(sportCode, "player");
    let params = new HttpParams();
    let Player = "Player";
    let timebuckets = "timebucket";
    const statistics = "statistics";
    const projectJson = "projections";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);



    return this.http.get(playerUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/"
      + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/"
      + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Player + "/" + split,
      { params: params })
      .map(this.extractData);
  }

  public queryFootballHalfGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: string
  ) {
    let playerUrl = this.getSportTypeUrl(sportCode, "player");
    let params = new HttpParams();
    let Player = "Player";
    let timebuckets = "timebucket";
    const statistics = "statistics";
    const projectJson = "projections";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);

    return this.http.get(playerUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/"
      + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/"
      + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Player + "/" + split,
      { params: params })
      .map(this.extractData);
  }
  public queryFootballQuarterGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: string
  ) {
    let playerUrl = this.getSportTypeUrl(sportCode, "player");
    let params = new HttpParams();
    let Player = "Player";
    let timebuckets = "timebucket";
    const statistics = "statistics";
    const projectJson = "projections";
    const players = "player";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);



    return this.http.get(playerUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/"
      + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/"
      + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Player + "/" + split,
      { params: params })
      .map(this.extractData);
  }
  public queryTeamGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: number,
  ) {
    let params = new HttpParams();
    const statistics = "statistics";
    const projectJson = "projections";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);
    let teamUrl = this.getSportTypeUrl(sportCode, "team");
    // tslint:disable-next-line:max-line-length
    return this.http.get(teamUrl + split + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/" + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/" + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId,
      { params: params })
      .map(this.extractData);
  }
  public queryDriveFootballTeamGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: number,
  ) {
    let params = new HttpParams();
    const statistics = "statistics";
    const projectJson = "projections";
    let Team = "Team";
    let timebuckets = "timebucket";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);
    let teamUrl = this.getSportTypeUrl(sportCode, "player");
    // tslint:disable-next-line:max-line-length
    return this.http.get(teamUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/" + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/" + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Team + "/" + split,
      { params: params })
      .map(this.extractData);
  }
  public queryHalfFootballTeamGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: number,
  ) {
    let params = new HttpParams();
    const statistics = "statistics";
    const projectJson = "projections";
    let Team = "Team";
    let timebuckets = "timebucket";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);
    let teamUrl = this.getSportTypeUrl(sportCode, "player");
    // tslint:disable-next-line:max-line-length
    return this.http.get(teamUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/" + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/" + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Team + "/" + split,
      { params: params })
      .map(this.extractData);
  }
  public queryQuarterFootballTeamGames(
    split: string,
    category: string,
    stat: string,
    val: any,
    ineq: string,
    team: any,
    opponent: any,
    sportCode: string,
    location: string,
    teamConference: string,
    teamDivision: string,
    oppConference: string,
    oppDivision: string,
    gameType: string,
    projections: string,
    nightGame: string,
    resultcolumn: string,
    teamId: number,
  ) {
    let params = new HttpParams();
    const statistics = "statistics";
    const projectJson = "projections";
    let Team = "Team";
    let timebuckets = "timebucket";
    params = params.append(statistics, stat);
    params = params.append(projectJson, projections);
    let teamUrl = this.getSportTypeUrl(sportCode, "player");
    // tslint:disable-next-line:max-line-length
    return this.http.get(teamUrl + timebuckets + "/" + category + "/" + stat + "/" + val + "/" + ineq + "/" + team + "/" + opponent + "/" + sportCode + "/" + location + "/" + teamConference + "/" + teamDivision + "/" + oppConference + "/" + oppDivision + "/" + gameType + "/" + nightGame + "/" + resultcolumn + "/" + teamId + "/" + Team + "/" + split,
      { params: params })
      .map(this.extractData);
  }
  public getAllTeams() {
    return this.http.get(URL + "/team/allteams")
      .map(this.extractData);
  }


  public getAllConfTeams(
    confName: string
  ) {
    return this.http.get(URL + "/team/confteams/" + confName)
      .map(this.extractData);
  }

  public getQueryResults(
    collectionName: string,
    pipeline: string,
  ) {
    let params = new HttpParams();
    const categoryKey = "pipeline";
    params = params.append(categoryKey, pipeline);
    return this.http.get(URL + "/querybuilder/" + collectionName, { params: params })
      .map(this.extractData);
  }

  public getHalfQueryResults(
    collectionName: string,
    qtr1Pipeline: string,
    qtr2Pipeline: string,
  ) {
    let params = new HttpParams();
    const category1Key = "qtr1Pipeline";
    params = params.append(category1Key, qtr1Pipeline);
    const category2Key = "qtr2Pipeline";
    params = params.append(category2Key, qtr2Pipeline);
    return this.http.get(URL + "/querybuilder/half/" + collectionName, { params: params })
      .map(this.extractData);
  }
  private extractData(res: any) {
    return res.data || {};
  }

}
