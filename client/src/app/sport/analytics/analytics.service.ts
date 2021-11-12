import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";

const URL = environment.API_URL + "/api_v1/";

@Injectable()
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  public getRecords(
    sportCode: number,
    teamCode: number,
    entity: string,
    timeBucket: string,
    category: string,
    statistic: string
  ) {
    let params = new HttpParams();
    const categoryKey = "category";
    const statisticKey = "statistic";
    params = params.append(categoryKey, category);
    params = params.append(statisticKey, statistic);
    return this.http
      .get(
        URL +
          "analytics/records/" +
          sportCode +
          "/" +
          teamCode +
          "/" +
          entity +
          "/" +
          timeBucket,
        { params: params }
      )
      .map(this.extractData);
  }

  public getStreaks(
    sportCode: number,
    teamCode: number,
    entity: string,
    timeBucket: string,
    category: string,
    statistic: string,
    statValue: any,
    statQualifier: string
  ) {
    let params = new HttpParams();
    const categoryKey = "category";
    const statisticKey = "statistic";
    const statValueKey = "statQualifierValue";
    const statQualifierKey = "statQualifier";
    params = params.append(categoryKey, category);
    params = params.append(statisticKey, statistic);
    params = params.append(statValueKey, statValue);
    params = params.append(statQualifierKey, statQualifier);
    return this.http
      .get(
        URL +
          "analytics/streaks/" +
          sportCode +
          "/" +
          teamCode +
          "/" +
          entity +
          "/" +
          timeBucket,
        { params: params }
      )
      .map(this.extractData);
  }
  public getStreaksStats(
    sportCode: number,
    teamCode: number,
    entity: string,
    timeBucket: string
  ) {
    return this.http
      .get(
        URL +
          "analytics/streaksStats/" +
          sportCode +
          "/" +
          teamCode +
          "/" +
          entity +
          "/" +
          timeBucket
      )
      .map(this.extractData);
  }

  private extractData(res: any) {
    return res.data || {};
  }
}
