import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { environment } from "../../../environments/environment";
const URL = environment.API_URL + "/api_v1/query/ahocQuery";

@Injectable()
export class AdhocQueryService {
  constructor(private http: HttpClient) {}
  public getAllAhocqueries(sportCode: string): Observable<any[]> {
    return this.http.get(URL + "/" + sportCode).map(this.extractData);
  }
  public getAdhocQueryResults(_id: string, inputFields: string) {
    let params = new HttpParams();
    const categoryKey = "inputFields";
    params = params.append(categoryKey, inputFields);
    return this.http
      .get(URL + "/execQuery/" + _id, { params: params })
      .map(this.extractData);
  }
  private extractData(res: any) {
    return res.data || {};
  }
}
