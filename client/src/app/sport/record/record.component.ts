import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { RecordService } from "app/sport/record/record.service";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";

@Component({
  selector: "app-record",
  templateUrl: "./record.component.html",
  styleUrls: ["./record.component.css"],
  providers: [RecordService],
})
export class RecordComponent implements OnInit {

  public results: any = [];
  public recordMsg: string = "";
  public spinner: boolean = false;
  public headerConfig = HeaderConfig;
  public teamColors: any;
  public teamId: any;
  public sportId: any;
  public teamName: any;
  public shared: TeamColors = new TeamColors();
  public showRecordsTitles: boolean = true;

  constructor(
    private recordService: RecordService,
    private route: ActivatedRoute,
    private router: Router) {
    localStorage.setItem("headerTitle", "Record - " + localStorage.getItem("sportText"));
    this.teamId = localStorage.getItem("selectedTeam");
    this.sportId = localStorage.getItem("selectedSport");
    this.teamName = localStorage.getItem("teamText");
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {
    localStorage.setItem("headerTitle", "Records - " + localStorage.getItem("sportText"));
  }

  public onResults(results: any) {
    if (results.length === 0) {
      this.recordMsg = "No data found";
    }
    this.results = results;
  }

  public onGetResults(spinner: boolean) {
    this.spinner = spinner;
  }
  public onClick(newValue: any, stat: boolean) {   
    this.showRecordsTitles= !stat;
  }

}
