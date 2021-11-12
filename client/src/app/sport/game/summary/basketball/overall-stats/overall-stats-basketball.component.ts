import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { homedir } from "os";
import { Observable } from "rxjs/Observable";
import { IBasketBallTeamStats, ITeamStatRows } from "../../../../../../../../typings/athlyte/football/game/game.d";

@Component({
  selector: "app-overall-stats-basketball",
  templateUrl: "./overall-stats-basketball.component.html",
  styleUrls: ["./overall-stats-basketball.component.css", "../summary-basketball.component.css"],
})
export class OverallStatsBasketballComponent implements OnInit {
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

  public addColons(timeString: string){
    if(timeString.toString().length > 1){
      return timeString.toString().replace(/(.{2})$/,':$1');      
    }
    return timeString;
  }

}
