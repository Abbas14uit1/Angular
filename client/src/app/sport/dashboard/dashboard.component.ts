import { Component, Input, OnChanges, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { HeaderConfig } from "../../shared/header/header.component";
import { DashboardService } from "./dashboard.service";

import { TeamColors } from "../../shared/team-colors";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  providers: [DashboardService],
})
export class DashboardComponent implements OnInit {

  @Output() public selectedSeason: any;
  @Output() public selectedTeam: any;
  @Output() public teamId: any;
  @Output() public sportId: any;
  public teamColors: any;
  public showSeasons: boolean = true;
  public showRoaters: boolean = true;
  public seasons: any[];
  public headerConfig = HeaderConfig;
  public teamName: any;
  public shared: TeamColors = new TeamColors();
  constructor(
    public dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router) {
    this.teamColors = this.shared.teamColors;
    //localStorage.setItem("headerTitle", "Season" + " Dashboard -" + localStorage.getItem("sportText"));
  }

  public ngOnInit() {
    if (this.router.url.indexOf("playerdashboard") > -1) {
      this.showSeasons = false;
      this.showRoaters = true;
    }
    if (this.router.url.indexOf("gamedashboard") > -1) {
      this.showSeasons = true;
      this.showRoaters = false;
    }
    this.updateFromRoutes();
  }

  public onTeamChange(newValue: any) {
    localStorage.setItem("team", newValue);
    this.router.navigate([this.sportId, "dashboard", newValue]);
  }

  public onSeasonChange(newValue: any) {
    localStorage.setItem("season", newValue);
  }

  public seasonReadability(num: any) {
    let updated_season = "";
    if (typeof num === 'string' && num.length > 7) {
      let season_arr = num.split(" -");
      let start_season_st = season_arr[0]; 
      let end_season_st = season_arr[1];
      let start_season_en = Number(season_arr[0]) + 1;
      let start_sea_en_str = start_season_en.toString();
      let end_season_en = Number(season_arr[1]) + 1;
      let end_sea_en_str = end_season_en.toString();
      updated_season = start_season_st + "-" + start_sea_en_str.substring(2,4) + " to " + end_season_st + "-" + end_sea_en_str.substring(2,4);
      return updated_season;
    }else if (typeof num === 'number') {
      let inc_season_by_one = (num +1).toString();
      let sea = inc_season_by_one.substring(2,4);
      updated_season = num.toString() + "-" + sea;
      return updated_season;
    }
    let arr = num.split("-");
    let st = Number(arr[0].substring(2,4));
    let en = Number(arr[1]);
    let sub = en-st;
    console.log("sub" + sub);
    if(arr[1] == "00" && arr[0] == "99"){
      return num;
    }
    else if(arr[1] =="00" && arr[0] != "99"){
      return (arr[0] + "-" + ((Number(arr[0])+1).toString()).substring(2,4) + " to " + arr[1] + "-01");
    }
    else if(sub != 1){
      let start = arr[0].substring(0,2) + arr[1];
      console.log("start" + start)
      let end = (Number(arr[1]) + 1).toString();
      if(end.length == 1){
        end = "0" + end;
      }
      console.log("end" + end);
      console.log(start + "-" + end);
      return arr[0] + "-" + ((Number(arr[0])+1).toString()).substring(2,4) + " to " + start + "-" + end;
    }

    return num;
  }

  private updateFromRoutes() {
    // Get routes
    this.route.params.flatMap((params) => {
      if (params.teamCode !== undefined) {
        this.selectedTeam = Number(params.teamCode);
        localStorage.setItem("team", this.selectedTeam);
      } else {
        this.selectedTeam = Number(localStorage.getItem("team"));
      }
      this.selectedSeason = Number(localStorage.getItem("season"));
      this.sportId = params.sport;
      return this.dashboardService.getTeam(this.selectedTeam, params.sport);
    }).flatMap((team) => {
      this.teamId = team[0]._id;
      this.teamName = team[0].name;
      return this.dashboardService.getSeasons(this.teamId, this.sportId);
    }).subscribe((seasons) => {
      this.seasons = seasons;
      let contained = false;
      for (const s in this.seasons) {
        if (this.seasons[s].season === this.selectedSeason) {
          contained = true;
          break;
        }
      }
      if (!contained) {
        this.selectedSeason = this.seasons[0].season;
      }
    });
  }
}
