import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { homedir } from "os";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-overall-stats-baseball",
  templateUrl: "./overall-stats-baseball.component.html",
  styleUrls: ["./overall-stats-baseball.component.css", "../summary-baseball.component.css"],
})
export class OverallStatsBaseballComponent implements OnInit {
  public panelOpenState: boolean = false;
  @Input() public overallTeamStats: any[];
  @Input() public sportId: string;
  public homeTeamStats: any;
  public awayTeamStats: any;

  // tslint:disable-next-line:no-empty
  constructor() { }

  public ngOnInit() {
    for (const data of this.overallTeamStats) {
      if (data.homeAway === 1) {
        this.homeTeamStats = data;
      } else {
        this.awayTeamStats = data;
      }
    }
  }
   
}
