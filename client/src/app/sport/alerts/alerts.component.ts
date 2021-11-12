import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { AlertsService } from "app/sport/alerts/alerts.service";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";
import * as moment from "moment";

@Component({
  selector: "app-alerts",
  templateUrl: "./alerts.component.html",
  styleUrls: ["./alerts.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [AlertsService],
})
export class AlertsComponent implements OnInit {
  public headerConfig = HeaderConfig;
  public teamColors: any;
  public selectedSeason: any;
  public selectedTeam: any;
  public oppTeamCode: any = null;
  public selectedTeamName: any;
  public selectedTeamPre: any;
  public selectedTeamNamePre: any;
  public alertTime: any;
  public alertDate: any;
  public alertDatePre: any;
  public teamCode: any;
  @Output() public teamId: any;
  public sportId: any;
  @Output() public alerts: any[] = [];
  public teamName: any;
  public seasons: any;
  public teams: any[];
  public teamList: any[];
  public shared: TeamColors = new TeamColors();
  public spinner: boolean = false;
  public splits = [
    { value: "Postgame", viewValue: "Postgame", checked: true },
    { value: "Pregame", viewValue: "Pregame", checked: false },
  ];
  public entities = [
    {
      value: "Player",
      viewValue: "Player",
      checked: true,
      class: "fa fa-user",
    },
    { value: "Team", viewValue: "Team", checked: false, class: "fa fa-users" },
  ];
  public entity: string = this.entities[0].value;
  public selectedSplit: string = this.splits[0].value;
  public selectedTeamCode: number = 193;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertsService: AlertsService
  ) {
    //localStorage.setItem("headerTitle", "Alerts - Football");
    this.teamId = localStorage.getItem("selectedTeam");
    this.teamName = localStorage.getItem("teamText");
    this.teamColors = this.shared.teamColors;
    this.sportId = localStorage.getItem("selectedSport");
    this.teamCode = localStorage.getItem("selectedTeamId");
  }

  public ngOnInit() {
    //localStorage.setItem("headerTitle", "Alerts - Football");

    this.splitSectionChange("Postgame");
  }
  public splitSectionChange(event: any) {
    this.alerts = [];
    this.selectedSplit = event;
    if (this.selectedSplit === "Postgame") {
      this.alertsService.getSeasons(this.teamId, this.sportId).subscribe(
        (results: any) => {

          let currentDate = new Date();
          let seasondata = Array.from(
            new Set(results.map((item: any) => item.season))
          );
          this.seasons = seasondata.sort((a: any, b: any) => b - a);
          this.selectedSeason = currentDate.getFullYear();
          if (this.sportId == "MFB" && currentDate.getMonth() == 0) {
            this.selectedSeason = currentDate.getFullYear() - 1;
          }
          if ((this.sportId == "MBB" || this.sportId == "WBB") && (currentDate.getMonth() >= 0 || currentDate.getMonth() <= 3)) {
            this.selectedSeason = currentDate.getFullYear() - 1;
          }
          if (this.sportId == "WSB" || this.sportId == "MBA") {
            this.selectedSeason = currentDate.getFullYear() - 1;
          }
          this.teams = results;
          this.teamList = results;
          this.getLatestGames();
        },
        (err) => null
      );
      /*this.getPreAlerts();*/
    } else {
      if (!this.seasons) {
        /*this.alertsService.getSeasons(this.teamId, this.sportId).subscribe(
          (results: any) => {
            this.teams = results;
            this.teamList = results;
            this.seasons = Array.from(new Set(results.map((item: any) => item.season)));
            this.getPostAlerts();
          },
          (err) => null,
        );*/
      } else {
        this.getPostAlerts();
      }
    }
  }

  public onEntityChange(newValue: any) {
    this.selectedSplit = "Postgame";
    this.getPostAlerts();
  }
  public onTeamChange(teamVal: any, teamSelect: any) {
    this.selectedSplit = "Postgame";
    this.selectedTeam = teamVal;
    this.selectedTeamName = teamVal.oppoTeamName;
    this.alertDate = teamVal.gameDate;
    this.getPostAlerts();
  }

  public onSeasonChange(newValue: any) {
    this.selectedSplit = "Postgame";
    this.selectedSeason = newValue;
    let currentDate = new Date();
    if (this.selectedSeason == currentDate.getFullYear()) {
      this.getLatestGames();
    } else {
      let teamVal = this.teams.find((x) => x.season === newValue);
      this.selectedTeam = teamVal;
      this.selectedTeamName = teamVal["oppoTeamName"];
      this.alertDate = teamVal["gameDate"];
      this.getPostAlerts();
    }
  }

  public getPostAlerts() {
    this.spinner = true;
    this.alerts = [];
    this.alertsService
      .queryStories(
        this.sportId,
        this.teamId,
        this.selectedTeam["oppoTeamCode"],
        this.alertDate,
        this.entity
      )
      .subscribe(
        (results: any) => {
          this.alerts = results;
          this.spinner = false;
        },
        (err) => null
      );
  }

  public getPreAlerts() {
    this.spinner = true;
    this.alerts = [];
    this.alertsService
      .queryPreAlerts(this.sportId, this.teamId, this.entity, this.oppTeamCode)
      .subscribe(
        (results: any) => {
          this.alerts = results;
          this.spinner = false;
        },
        (err) => null
      );
  }

  public getLatestGames() {
    this.selectedTeam = null;
    this.selectedTeamName = null;
    this.oppTeamCode = null;
    this.alertsService
      .getLatestGames(this.teamId, this.sportId, this.selectedSeason)
      .subscribe(
        (results: any) => {
          if (results[0]) {
            this.selectedTeam = this.teams.find((x) => x.season === this.selectedSeason && x.oppoTeamCode == results[0]["oppoTeamCode"] && x.gameDate == results[0]["gameDate"]);
            this.oppTeamCode = results[0]["oppoTeamCode"];
            this.selectedTeamName = results[0]["oppoTeamName"];
            this.alertDate = results[0]["gameDate"];
          }
          if (results[1]) {
            this.selectedTeam = this.teams.find((x) => x.season === this.selectedSeason && x.oppoTeamCode == results[1]["oppoTeamCode"] && x.gameDate == results[1]["gameDate"]);
            this.selectedTeamName = results[1]["oppoTeamName"];
            this.alertDate = results[1]["gameDate"];
          }
          this.getPostAlerts();
        },
        (err) => null
      );
  }

  public getUtcDate(gameDate: Date) {
    return moment.utc(gameDate).format('LL');
  }
}
