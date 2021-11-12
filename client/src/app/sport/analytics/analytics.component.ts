import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsComponent implements OnInit {
  public headerConfig = HeaderConfig;
  public teamColors: any;
  public selectedSeason: any;
  public selectedTeam: any;
  public selectedTeamName: any;
  public alertTime: any;
  public alertDate: any;
  public teamCode: any;
  public tabIndex: number = 1;
  @Output() public teamId: any;
  public sportId: any;
  @Output() public alerts: any[] = [];
  public teamName: any;
  public seasons: any[];
  public teams: any[];
  public shared: TeamColors = new TeamColors();
  public splits = [
    { value: "Game", viewValue: "Game", checked: true },
    { value: "Season", viewValue: "Season", checked: false },
    { value: "Career", viewValue: "Career/All-Time", checked: false },
  ];
  public selectedSplit: string = this.splits[0].value;
  public selectedTeamCode: number = 193;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.teamId = localStorage.getItem("selectedTeam");
    this.teamName = localStorage.getItem("teamText");
    this.teamColors = this.shared.teamColors;
    this.sportId = localStorage.getItem("selectedSport");
    this.teamCode = localStorage.getItem("selectedTeamId");
  }

  public ngOnInit() {
    this.tabIndex = Number(localStorage.getItem("tabIndex")) || 1;
    this.teamId = localStorage.getItem("selectedTeam");
    this.teamName = localStorage.getItem("teamText");
    this.teamColors = this.shared.teamColors;
    this.sportId = localStorage.getItem("selectedSport");
    this.teamCode = localStorage.getItem("selectedTeamId");
  }

  public onTabChange(evnt: any) {
    this.tabIndex = evnt["index"];
  }
}
