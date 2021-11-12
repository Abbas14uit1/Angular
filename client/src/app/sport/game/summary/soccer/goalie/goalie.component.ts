import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-goalie",
  templateUrl: "./goalie.component.html",
  styleUrls: ["./goalie.component.css", "../summary-soccer.component.css"],
})
export class GoalieComponent implements OnInit {

  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;

  public dataSource: PlayerGoalieDataSource;
  public displayedColumns = ["name", "GA","GAA","SV","SVPCT","SHO","SF"];

  
  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { 
  }

  public ngOnInit() {
    const player: any[] = this.data
      .map((x) => {
        return {
          _id: x._id,
          name: x.name,
          GA:x.ga,
          GAA: isNaN((x.ga * 90) / Number(x.minutes)) ? 0 : (x.ga * 90) / Number(x.minutes),
          SV:x.saves,
          SVPCT:isNaN(x.saves/ x.opposog) ? 0 : ((x.saves/ x.opposog).toFixed(3)).startsWith("0.") ? ((x.saves/ x.opposog).toFixed(3)).substring(1) : Number((x.saves/ x.opposog).toFixed(3)),
          SHO :x.shutout,
          SF:x.sf
        };
      });
    let totalCol: any = {};
    totalCol["name"] = "TOTAL";
    totalCol["GA"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.GA ? item.GA : 0), 0);
    totalCol["GAA"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.GAA ? item.GAA : 0), 0);
    totalCol["SV"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.SV ? item.SV : 0), 0);
    totalCol["SVPCT"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.SVPCT ? item.SVPCT : 0), 0);
    totalCol["SHO"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.SHO ? Number(item.SHO) : 0), 0);
    totalCol["SF"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.SF ? Number(item.SF) : 0), 0);

    this.extraRows = this.otherLength - player.length;

    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        player.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    player.push(totalCol); 

    this.dataSource = new PlayerGoalieDataSource(player, this.sort);
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }

}


export class PlayerGoalieDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private onInit = new BehaviorSubject("");
  private renderedData: any[] = [];


  constructor(private data: any[], private sort: MatSort) {
    super();
  }

  public connect(): Observable<any[]> {
    const displayDataChanges = [
      this.onInit,
      this.sort.sortChange,
    ];   
    
   return Observable.merge(...displayDataChanges).map(() => {
      // Sort filtered data
      this.renderedData = this.sortData(this.data);
      return this.renderedData;
    });
  }

  public disconnect() { return; }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") { return data; }
    let realData: any[] = [];
    const blanks: any[] = [];
    data.forEach((element) => {
      if (element.name !== undefined && element.name !== "TOTAL") {
        realData.push(element);
      } else {        
         blanks.push(element.name === "TOTAL" ? element : {});
      }
    });      
    realData = realData.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";

      switch (this.sort.active) {
        case "name": [propertyA, propertyB] = [a.name, b.name]; break;
        case "pct": [propertyA, propertyB] = [a.pct, b.pct]; break;
        case "attempts": [propertyA, propertyB] = [a.attempts, b.attempts]; break;
        case "completed": [propertyA, propertyB] = [a.completed, b.completed]; break;
        case "yards": [propertyA, propertyB] = [a.yards, b.yards]; break;
        case "touchdowns": [propertyA, propertyB] = [a.touchdowns, b.touchdowns]; break;
        case "interceptions": [propertyA, propertyB] = [a.interceptions, b.interceptions]; break;
        case "yardsComp": [propertyA, propertyB] = [a.yardsComp, b.yardsComp]; break;
        case "yardsAtt": [propertyA, propertyB] = [a.yardsAtt, b.yardsAtt]; break;
        case "rating": [propertyA, propertyB] = [a.rating, b.rating]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      switch (this.sort.active) {
        case "name": return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
        default: return (valueA < valueB ? -1 : 1) * (this.sort.direction === "desc" ? 1 : -1);
      }
    });

    return realData.concat(blanks);
  }  
}