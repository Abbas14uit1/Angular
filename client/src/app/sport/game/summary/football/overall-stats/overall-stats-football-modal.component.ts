import { DataSource } from "@angular/cdk/collections";
import { Component, Inject, Input, OnInit } from "@angular/core";
@Component({
  selector: "app-overall-stats-football-modal",
  templateUrl: "./overall-stats-football-modal.component.html",
  styleUrls: ["./overall-stats-football-modal.component.css","./overall-stats-football.component.css"],  
})
export class OverallStatsFootballModalComponent {  
  @Input() public overallTeamStats: any[] = [];
  @Input() public overallOffensePlays: any[] = [];
  @Input() public sportId: string = "";
  public homeTeamStats: any;
  public awayTeamStats: any;
  public homeTeamOffenses: any[] = [];
  public awayTeamOffenses: any[] = [];
  //public dialog: MatDialog;
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
   for (const data of this.overallOffensePlays) {
      if (data.possession !== 0) {
        this.homeTeamOffenses.push(data);
      } else {
        this.awayTeamOffenses.push(data);
      }
    }
  }
  public isNumber(val: any) {
    return (typeof val === 'number');
  }
  public valueReadability(num: any) {
    if (num % 1 != 0 && typeof num === 'number') return num.toFixed(2);
    return num;
  }
  public showEfficiencies(val1: any, val2: any) {
    return !(val1 && val2) ? "-" : val1 + "/" + val2
  }

  public getValue(value: any) {
    return (!value && value !== 0) ? "-" : value;
  }
  public showRedZone(val1: any, val2: any) {
    return !(val1 && val2) ? 0 : val1 + val2;
  }

  public getZeroValue(value: any) {
    return value ?  value : "-";
  }
}
