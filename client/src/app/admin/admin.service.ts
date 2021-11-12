import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { IAdminUserDetails } from "../../../../typings/user/user.d";
import { environment } from "../../environments/environment";

const URL = environment.API_URL + "/users/login";
const URLUsers = environment.API_URL + "/users/users";
const URLPlayers = environment.API_URL + "/api_v1/players/";

@Injectable()
export class AdminService {
  constructor(private http: HttpClient) { }

  public loginUser(username: string, password: string) {
    return this.http
      .post(URL, { username, password })
      .map((res: any) => {
        const user = res.data as IAdminUserDetails;
     
        if(user.confName == null && (localStorage.getItem("confName")==""? localStorage.getItem("confName") != "":localStorage.getItem("confName") != null)){
          localStorage.setItem("userName", user.username);
          localStorage.setItem("superAdmin", user.superAdmin.toString());
          localStorage.setItem("admin", user.admin.toString());
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("confName", "");
          localStorage.setItem("cfName", "NullUser");

            localStorage.setItem("sportText","");
            localStorage.setItem("selectedSport","");
            localStorage.setItem("sportIndex","");
            localStorage.setItem("selectedTeam","");
            localStorage.setItem("teamText","");
        }
        else{
          if (user.confName != localStorage.getItem("confName")){
            if((localStorage.getItem("confName")==""?localStorage.getItem("confName")=="":localStorage.getItem("confName")==null)&&user.confName!=null){
              localStorage.setItem("confName","");
              localStorage.setItem("sportText","");
              localStorage.setItem("selectedSport","");
              localStorage.setItem("sportIndex","");
              localStorage.setItem("selectedTeam","");
              localStorage.setItem("teamText","");
            }
            else if(user.confName!=null){
              localStorage.setItem("confName","");
              localStorage.setItem("sportText","");
              localStorage.setItem("selectedSport","");
              localStorage.setItem("sportIndex","");
              localStorage.setItem("selectedTeam","");
              localStorage.setItem("teamText","");
            }
          }
          if(user && user.token){
             localStorage.setItem("userName", user.username);
             localStorage.setItem("superAdmin", user.superAdmin.toString());
             localStorage.setItem("admin", user.admin.toString());
             localStorage.setItem("user", JSON.stringify(user));
             if(user.confName) {localStorage.setItem("confName", user.confName.toString());}
          }
        }
    
      

      //  if(user && user.token) {
        //   localStorage.setItem("userName", user.username);
        //   localStorage.setItem("superAdmin", user.superAdmin.toString());
        //   localStorage.setItem("admin", user.admin.toString());
        //   localStorage.setItem("user", JSON.stringify(user));
        //   if(user.confName) localStorage.setItem("confName", user.confName.toString());
        // }
        return user;
      });
  }

  public logoutUser() {
    localStorage.removeItem("user");
  }

  public addUser(username: string, password: string, admin: boolean, email: string, superAdmin: boolean, confName: string) {

    return this.http
      .post(URLUsers, { username, password, admin, email, superAdmin, confName })
      .map((res: any) => {
        return res;
      });

  }
  // tslint:disable-next-line:max-line-length
  public updateUser(id: string, username: string, password: string, admin: boolean, isActive: boolean, email: string, superAdmin: boolean, confName: string) {
    return this.http
      .put(URLUsers, { id, username, password, admin, isActive, email, superAdmin, confName })
      .map((res: any) => {
        return res;
      });

  }

  public deleteUser(id: string) {
    return this.http
      .put(URLUsers + "/delete", { id })
      .map((res: any) => {
        return res;
      });
  }

  public getUsers() {
    return this.http.get(URLUsers)
      .map(this.extractData);
  }

  public getSeasons(teamId: string, sport: string): Observable<any[]> {
    return this.http.get(URLPlayers + "seasons/" + sport + "/" + teamId)
      .map(this.extractData);
  }

  public getPlayers(teamId: string, sport: string, season: string) {
    return this.http.get(URLPlayers + sport + "/roasters/" + teamId + "/" + season)
      .map(this.extractData);
  }

  public getPlayerStats(playerId: string) {
    return this.http.get(URLPlayers + playerId + "/playerStats")
      .map(this.extractData);
  }

  // tslint:disable-next-line:max-line-length
  public updatePlayer(id: string, name: string, playerGames: string) {
    return this.http
      .put(URLPlayers, { id, name, playerGames })
      .map((res: any) => {
        return res;
      });
}

  private extractData(res: any) {
    return res.data || {};
  }
}
