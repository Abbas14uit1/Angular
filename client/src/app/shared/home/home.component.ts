import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatTabChangeEvent } from '@angular/material';

import { Router } from "@angular/router";
import { HeaderConfig } from "../../shared/header/header.component";
import { AlertsService } from "../../sport/alerts/alerts.service";
import { QueryService } from "../../sport/query/query.service";
import { TeamColors } from "../team-colors";
import { GoogleAnalyticsEventsService } from "../../services/google-analytics-events-service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css", "../../app.component.css"],
  providers: [QueryService, AlertsService],
})
export class HomeComponent implements OnInit {
  public shared: TeamColors = new TeamColors();
  public showDashboard: boolean;
  public teamData: any[];
  public selectedTeam: any;
  public selectedSport: any;
  public teamText:any;
  public teams: any[] = [];
  public teamColors: any;
  public alertsCount: any;
  public headerConfig = HeaderConfig;
  public sportIndex:number = 1;   
  public userName: string = "";
  public IsShowProjectDropDown = false;
  
  public sports:any[] = [];
  public selected_Sport:any={selected_Sport:false};
  public sportsList = [{ value: "MFB", name: "Football", iconClass:"football", gender:null, sequence:1,isMenuActive:true},
  { value: "MBB", name: "Basketball", iconClass:"basketball-man",gender:"Men's" ,sequence:2,isMenuActive:true},
  { value: "WBB", name: "Basketball", iconClass:"basketball-women",gender:"Women's",sequence:3,isMenuActive:true},
  { value: "MBA", name: "Baseball", iconClass:"baseball",gender:null,sequence:4,isMenuActive:true},
  { value: "WSB", name: "Softball", iconClass:"softball",gender:null,sequence:5,isMenuActive:true},
  { value: "MSO", name: "Soccer", iconClass:"soccer-man",gender:"Men's",sequence:6,isMenuActive:true},
  { value: "WSO", name: "Soccer", iconClass:"soccer-women",gender:"Women's",sequence:7,isMenuActive:true},
  { value: "MLA", name: "Lacrosse", iconClass:"lacrosse_men",gender:"Men's",sequence:8,isMenuActive:false},
  { value: "WLA", name: "Lacrosse", iconClass:"lacrosse_women",gender:"Women's",sequence:9,isMenuActive:false},
  { value: "MVB", name: "Volleyball", iconClass:"Volleyball-man-",gender:"Men's",sequence:10,isMenuActive:false},
  { value: "WVB", name: "Volleyball", iconClass:"Volleyball-Women-",gender:"Women's",sequence:11,isMenuActive:false},
  { value: "MIH", name: "Ice Hockey", iconClass:"icehockey-men",gender:"Men's",sequence:12,isMenuActive:false},
  { value: "WIH", name: "Ice Hockey", iconClass:"icehockey-women",gender:"Women's",sequence:13,isMenuActive:false},
  { value: "WFH", name: "Field Hockey", iconClass:"fieldhockey",gender:null,sequence:14,isMenuActive:false}

];

  constructor(
    private queryService: QueryService, private alertsService: AlertsService, private router: Router, public googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.teamColors = this.shared.teamColors;
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
  }

  public ngOnInit() {
    localStorage.setItem("season", "");
    localStorage.setItem("headerTitle", "Sports Analytics Portal");
    let confName = (localStorage.getItem('confName') || 'null');
    this.userName = localStorage.getItem("userName") || "";
    this.queryService.getAllConfTeams(
      confName
      ).subscribe((teams: any) => {
        this.teams = teams;
        this.loadGames();
      this.googleAnalyticsEventsService.emitEvent("User & Pre-Selected Team & Sport Dropdown Value", JSON.stringify({"user":this.userName,"selectedTeam":localStorage.getItem("teamText"),"selectedSport":localStorage.getItem("sportText")}), "Home Dashboard", 1);

      });
    this.sportIndex = Number(localStorage.getItem("sportIndex"));
    this.selectedTeam = Number(localStorage.getItem("selectedTeam"));
    this.selectedSport = localStorage.getItem("selectedSport");
    this.teamText = localStorage.getItem("teamText");
    if (this.selectedTeam && this.selectedSport !== null) {
      this.googleAnalyticsEventsService.emitEvent("User & Pre-Selected Team & Sport Dropdown Value", JSON.stringify({"user":this.userName,"selectedTeam":localStorage.getItem("teamText"),"selectedSport":localStorage.getItem("sportText")}), "Home Dashboard", 1);
      this.showDashboard = true;
    }
    this.getAlertsCount();
    

  }
  public onTeamChange(teamVal: any, teamSelect: any) {
    this.selectedTeam = teamVal;
    const teamData = this.teams.find((x) => x.code === teamVal);
    localStorage.setItem("selectedTeam", teamVal);
    localStorage.setItem("selectedTeamId", teamData._id);
    localStorage.setItem("teamText", teamSelect.selected.getLabel(teamVal));
    this.teamText = localStorage.getItem("teamText");
    this.googleAnalyticsEventsService.emitEvent("Teams Dropdown Changed", JSON.stringify({"selectedTeam":localStorage.getItem("teamText"),"selectedSport":localStorage.getItem("sportText")}), "Home Dashboard", 2);
    if (this.selectedSport !== "" && this.selectedSport !== null) {
      this.showDashboard = true;
    }else{
      localStorage.setItem("selectedSport", "MFB");
      localStorage.setItem("sportText", "Football");
      this.selectedSport = "MFB";
      localStorage.setItem("sportIndex", "0");
      this.showDashboard = true;
    }
    this.getAlertsCount();
    this.selectedTeam = teamVal;
    this.loadGames();
  }

  //VAF.AI New Changes
  loadGames(){
    let confName = (localStorage.getItem('confName') || this.sportsList[0].value);

    this.queryService.getAllConfTeams(confName).subscribe((teams: any) => {
      this.sports=[];
      var aa = localStorage.getItem("selectedTeam");

      if(!aa){
        localStorage.setItem("selectedTeam", this.teams[0].code);
        localStorage.setItem("selectedTeamId", this.teams[0]._id);
        localStorage.setItem("teamText", this.teams[0].name);
        var sportsItems=this.teams.find(s=>s.code== localStorage.getItem("selectedTeam"));
      }
      else{
        var sportsItems=this.teams.find(s=>s.code== localStorage.getItem("selectedTeam"));
      }

   
     if(!sportsItems){
      sportsItems = this.teams[0];
     }
       this.selectedTeam = sportsItems.code;
       this.teamText = sportsItems.name;
       localStorage.setItem("teamText", sportsItems.name);

     if(sportsItems)
     {
        for(var i=0; i<sportsItems.sportCodes.length; i++){
           var a = this.sportsList.find((x:any)=>x.value == sportsItems.sportCodes[i]);
          this.sports.push(a);
        }
      }
        this.sports.sort((low, high) => low.sequence - high.sequence);
      });
  }
  isFirst:boolean=true;
  public onSportChange(sport: MatTabChangeEvent) {
    let sportsData = this.sports.find((x, i) => Number(i) == Number(sport.index));
    let sportsDataIndex =this.sports.findIndex((x, i) => Number(i) == Number(sport.index ));

    var excitingkeyindex = localStorage.getItem("sportIndex");
    if(this.isFirst){
      sportsData = this.sports.find((x, i) => Number(i) == Number(excitingkeyindex));
     sportsDataIndex = this.sports.indexOf(sportsData);
     this.sportIndex= Number(sportsDataIndex)
    }
    this.isFirst=false;
    if(sportsData){
      this.selectedSport = sportsData.value;
      this.selected_Sport = sportsData;
      localStorage.setItem("selectedSport", sportsData.value);
      localStorage.setItem("sportText", (sportsData.gender == null)? sportsData.name: sportsData.gender +' '+sportsData.name);
      localStorage.setItem("sportIndex", sportsDataIndex.toString());
      this.googleAnalyticsEventsService.emitEvent("Sports Dropdown Changed", JSON.stringify({"selectedTeam":localStorage.getItem("teamText"),"selectedSport":localStorage.getItem("sportText")}), "Home Dashboard", 3);
      if (this.selectedTeam !== "" && this.selectedTeam !== null) {
        this.showDashboard = true;
      }
      this.getAlertsCount();
    }    
  }

  public OnclickLink(title: any) {
    this.googleAnalyticsEventsService.emitEvent("Dashboards Category Clicked", title, "Home Dashboard", 4);
    localStorage.setItem("headerTitle", title + " - " + localStorage.getItem("sportText"));
  }

  public OnclickLinkAnalytics(title: any, tabIndex: any) {
    this.googleAnalyticsEventsService.emitEvent("Dashboards Category Clicked", title, "Home Dashboard", 4);
    localStorage.setItem("headerTitle", title + " - " + localStorage.getItem("sportText"));
    localStorage.setItem("tabIndex", tabIndex);
  }

  public OnQueryClick(title: any) {
    this.googleAnalyticsEventsService.emitEvent("Analytics Category Clicked", "Query", "Home Dashboard", 5);
    localStorage.setItem("headerTitle", title + " - " + localStorage.getItem("sportText"));
    localStorage.setItem("entity", title);
  }
   public OnQBClick(title: any) {
    this.googleAnalyticsEventsService.emitEvent("Advanced Seasrch Clicked", title, "Home Dashboard", 5);
    localStorage.setItem("headerTitle", title + " - " + localStorage.getItem("sportText"));
    localStorage.setItem("entity", title);
  }

  public captureLabelGroup(title: any, category: any, series : any) {
    this.googleAnalyticsEventsService.emitEvent(category, title, "Home Dashboard", series);
  }

  public getAlertsCount() {
    this.alertsService.getAlertsCount(this.selectedSport, this.selectedTeam).subscribe(
      (results: any) => {
        this.alertsCount = JSON.stringify(results) === '{}' ? 0 : results;
      },
      (err) => null,
    );
  }
}
