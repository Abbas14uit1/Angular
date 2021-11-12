import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FilterMenuFootballComponent } from "app/sport/query/filter-menu/filter-menu-football.component";
import { FilterMenuBaseballComponent } from "app/sport/query/filter-menu/filter-menu-baseball.component";
import { FilterMenuBasketballComponent } from "app/sport/query/filter-menu/filter-menu-basketball.component";
import { QueryDisplayComponent } from "app/sport/query/query-display/query-display.component";
import { QueryService } from "app/sport/query/query.service";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";
import { FilterMenuSoccerComponent } from "./filter-menu/filter-menu-soccer.component";

@Component({
  selector: "app-query",
  templateUrl: "./query.component.html",
  styleUrls: ["./query.component.css"],
  providers: [QueryService],
  encapsulation: ViewEncapsulation.None
})
export class QueryComponent implements OnInit {
  @ViewChild(QueryDisplayComponent) child: QueryDisplayComponent;
  @ViewChild(FilterMenuFootballComponent) filterFootBallChild: FilterMenuFootballComponent;
  @ViewChild(FilterMenuBasketballComponent) filterBasketBallChild: FilterMenuBasketballComponent;
  @ViewChild(FilterMenuBaseballComponent) filterBaseBallChild: FilterMenuBaseballComponent;
  @ViewChild(FilterMenuSoccerComponent) FilterMenuSoccerChild: FilterMenuSoccerComponent
  public results: any = {};
  public spinner: boolean = false;
  public headerConfig = HeaderConfig;
  public sportId: string;
  public selectedTeam: number = 0;
  public shared: TeamColors = new TeamColors();
  public teamColors: any;
  public showFilter: boolean = true;
  public tabIndex: number = 1;
  public message: string = "No results found";
  storyresearch: any;



  public splits = [
    { value: "period", viewValue: "Period", checked: false },
    { value: "drive", viewValue: "Drive", checked: false },
    { value: "quarter", viewValue: "Quarter", checked: false },
    { value: "half", viewValue: "Half", checked: false },
    { value: "game", viewValue: "Game", checked: true },
    { value: "season", viewValue: "Season", checked: false },
    { value: "career", viewValue: "Career/All-Time", checked: false },
  ];

  public selectedSplit: string = this.splits[0].value;
  public splitValue: string = this.splits[0].value;
  public showGameType: boolean = false;

  constructor(private queryService: QueryService) {
    this.teamColors = this.shared.teamColors;
    this.selectedTeam = Number(localStorage.getItem("selectedTeam"));
    //localStorage.setItem("headerTitle", "Query - " + localStorage.getItem("sportText"));
  }

  public ngOnInit() {
    if (localStorage.getItem("entity") === "Advance Player Statistics Search" || localStorage.getItem("entity") === "Advance Team Statistics Search") {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 0;
    }
    const sportCode = localStorage.getItem('selectedSport');
    this.sportId = sportCode !== null ? sportCode : "MBB";
    //localStorage.setItem("headerTitle", "Query - " + localStorage.getItem("sportText"));    
    this.storyresearch = localStorage.getItem('entity');
  }

  public onResults(results: any) {
    this.message = "No results found";
    if (this.selectedSplit == "game" || this.selectedSplit == "period") {
      this.results = results
        .map((item: any) => {
          if (item.TeamScore[0] || item.TeamScore[0] == 0) {
            item.Res = (item.TeamScore[0] == item.OppScore[0] ? "D" :
              item.TeamScore[0] > item.OppScore[0] ? "W" : "L");
          } else {
            item.Res = (item.TeamScore == item.OppScore ? "D" :
              item.TeamScore > item.OppScore ? "W" : "L");
          }
          return item;
        });
    }
    else { this.results = results };
  }
  public onResultsMessage(message: any) {
    this.message = message;
  }
  public onGetResults(spinner: boolean) {
    this.spinner = spinner;
  }
  public exportAsExcelFile(): void {
    this.child.exportAsExcelFile();
  }
  public onClick(newValue: any, stat: boolean) {
    this.showFilter = !stat;
  }
  public splitSectionChange(event: any) {
    this.selectedSplit = event;
    this.onFilterSubmit(this.sportId, event);
  }
  public selectedTeamChange(teamCode: any) {
    this.selectedTeam = teamCode;
  }
  public entityTypeChange(entityType: string) {
    this.selectedSplit = "game";
    if (localStorage.getItem("entity") !== "Advanced Search") {
      if (entityType === "Player Statistics") {
        if (this.sportId == "MFB") {
          this.splits = [
            { value: "drive", viewValue: "Drive", checked: false },
            { value: "quarter", viewValue: "Quarter", checked: false },
            { value: "half", viewValue: "Half", checked: false },
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false },
            { value: "career", viewValue: "Career/All-Time", checked: false },
          ];
        }
        else if (this.sportId == "MBB") {
          this.splits = [
            { value: "period", viewValue: "Period", checked: false },
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false },
            { value: "career", viewValue: "Career/All-Time", checked: false },
          ];
        }
        else {
          this.splits = [
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false },
            { value: "career", viewValue: "Career/All-Time", checked: false },
          ];
        }

      } else if (entityType === "Team Statistics") {
        if (this.sportId == "MFB") {
          this.splits = [
            { value: "drive", viewValue: "Drive", checked: true },
            { value: "quarter", viewValue: "Quarter", checked: true },
            { value: "half", viewValue: "Half", checked: true },
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false }
          ];
        }
        else if (this.sportId == "MBB") {
          this.splits = [
            { value: "period", viewValue: "Period", checked: false },
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false },
          ];
        }
        else {
          this.splits = [
            { value: "game", viewValue: "Game", checked: true },
            { value: "season", viewValue: "Season", checked: false }
          ];
        }
      }

      this.results = [];
      this.onFilterSubmit(this.sportId, this.selectedSplit);
    }
  }
  public onTabChange(evnt: any) {
    this.tabIndex = evnt["index"];
  }

  private onFilterSubmit(sportId: string, evnt: any) {
    switch (sportId) {
      case "MBB": this.filterBasketBallChild.onSubmit(evnt);
        break;
      case "WBB": this.filterBasketBallChild.onSubmit(evnt);
        break;
      case "MFB": this.filterFootBallChild.onSubmit(evnt);
        break;
      case "MBA": this.filterBaseBallChild.onSubmit(evnt);
        break;
      case "WSB": this.filterBaseBallChild.onSubmit(evnt);
        break;
      case "MSO": this.FilterMenuSoccerChild.onSubmit(evnt);
        break;
      case "WSO": this.FilterMenuSoccerChild.onSubmit(evnt);
        break;
    }
  }

}
