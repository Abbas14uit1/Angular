import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";

const URL = environment.API_URL + "/api_v1/";

@Injectable()
export class RecordService {

  constructor(private http: HttpClient) { }

  public getRecords(
    sportCode: number,
    teamId: number,
    recordTitle: string,
  ) {
     let params = new HttpParams();
    const recordTitleJson = "recordTitle";
    params = params.append(recordTitleJson, recordTitle);
    return this.http.get(URL + "records/" + sportCode + "/" + teamId,{ params : params })
      .map(this.extractData);
  }

  public getRecordTitles(
    sportCode: number,
    teamId: number,
  ) {
    return this.http.get(URL + "records/recordTitles/" + sportCode + "/" + teamId)
      .map(this.extractData);
  }

  public getAllTeams() {
    return this.http.get(URL + "/query/team/allteams")
      .map(this.extractData);
  }

  private extractData(res: any) {
    return res.data || {};
  }
}
