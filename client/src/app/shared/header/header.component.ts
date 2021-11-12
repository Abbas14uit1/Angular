import { Component, Input, OnInit, Injectable } from "@angular/core";
import { MatToolbar } from "@angular/material";
import { Router } from "@angular/router";
import { TeamColors } from "../team-colors";

export enum HeaderConfig {
  normal,
  adminLoginPage,
  adminPage,
  adminNormal,
  homePage,
}
@Injectable()
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {

  @Input() public config: HeaderConfig;
  @Input('selectedTeam') selectedTeam: number = 0;

  public shared: TeamColors = new TeamColors();
  public showDashboard: boolean = false;
  public showQuery: boolean = false;
  public showLogout: boolean = false;
  public headerTitle: string = "";
  public userName: string = "";
  public teamColors: any;
  public pageTitle: string = "";
  public sportTitle: string = "";
  public sportCode: string = "";

  constructor(private router: Router) {
    this.teamColors = this.shared.teamColors;
  }


  public ngOnInit() {
    this.headerTitle = localStorage.getItem("headerTitle") || "Sports Analytics Portal";
    this.sportCode = localStorage.getItem("selectedSport") || "";
    this.sportTitle = localStorage.getItem("sportText") || "";
    this.pageTitle = "";
    if (this.headerTitle.indexOf('-') > 0 && this.sportCode) {
      this.pageTitle = this.headerTitle.split("-")[0];
    }
    this.userName = localStorage.getItem("userName") || "";
    this.selectedTeam = Number(localStorage.getItem("selectedTeam")) || Number(localStorage.getItem("team"));

    switch (this.config) {
      case HeaderConfig.normal:
        this.showDashboard = true;
        this.showQuery = true;
        this.showLogout = true;
        break;
      case HeaderConfig.adminLoginPage:
        this.showDashboard = false;
        this.showQuery = false;
        this.showLogout = false;
        break;
      case HeaderConfig.adminPage:
        this.showDashboard = true;
        this.showQuery = false;
        this.showLogout = true;
        break;
      case HeaderConfig.adminNormal:
        this.showDashboard = true;
        this.showQuery = true;
        this.showLogout = true;
        break;
      // Shouldn't ever be used
      case HeaderConfig.homePage:
        this.showDashboard = false;
        this.showQuery = false;
        this.showLogout = true;
        break;
      // Shouldn't ever be used
      default:
        this.showDashboard = false;
        this.showQuery = false;
        this.showLogout = false;
        break;
    }
  }

  public getIcon(sport: string) {
    switch (sport) {
      case "MFB": return "football";
      case "MBB": return "basketball";
      case "WBB": return "basketball";
      case "MBA": return "baseball";
      case "WSB": return "softball";
      default: return "";
    }
  }
  public logout() {
    localStorage.removeItem("user");
    // localStorage.removeItem("confName");
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
    this.router.navigate(["admin/login"]);
  }

  public redirectAdmin() {
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
    this.router.navigate(["admin"]);
  }

  public homeClick() {
    this.headerTitle = "Sports Analytics Portal";
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
  }
}
