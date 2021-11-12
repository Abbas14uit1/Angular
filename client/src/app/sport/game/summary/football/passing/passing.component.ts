import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerPassing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-passing",
  templateUrl: "./passing.component.html",
  styleUrls: ["./passing.component.css", "../summary-football.component.css"],
})
export class PassingComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;

  public dataSource: PlayerPassingDataSource;
  public displayedColumns = ["name", "completed","attempts", "pct","yards", "touchdowns", "interceptions","yardsComp","yardsAtt","rating"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {
    this.extraRows = this.otherLength - this.data.length;
    const players: any[] = this.data
      .map((x) => {
        return {
          _id: x._id,
          name: x.name,
          compAtt: x.completed === undefined || x.attempts === undefined ?
            0 : x.completed + "/" + x.attempts,
          pct:x.completed === undefined || x.attempts === undefined ?
            0 : ((x.completed/x.attempts)*100).toFixed(1),
          yards: x.yards,
          completed: x.completed === undefined ?  0 : x.completed,
          attempts: x.attempts === undefined ?  0 : x.attempts,
          touchdowns: x.touchdowns,
          interceptions: x.interceptions,
          yardsComp: x.completed === undefined || x.yards === undefined || x.completed === 0 ?
            0 : ((x.yards/x.completed)).toFixed(1),
          yardsAtt: x.attempts === undefined || x.yards === undefined || x.attempts === 0  ?
            0 : ((x.yards/x.attempts)).toFixed(1),
          rating: x.attempts === 0 || x.attempts === undefined ? '' : Number(
            (8.4 * x.yards
              + 330 * x.touchdowns
              + 100 * x.completed
              - 200 * x.interceptions)
            / x.attempts).toFixed(1),
        };
      }); 
      let totalCol: any = {};
      totalCol["name"] = "TOTAL";
    totalCol["attempts"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + item.attempts, 0);
    totalCol["completed"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + item.completed, 0);
    totalCol["pct"] = players.length === 0 ? "-" : ((Number(totalCol["completed"])/Number(totalCol["attempts"])) * 100).toFixed(1);
    totalCol["yards"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + item.yards, 0);
    totalCol["touchdowns"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + item.touchdowns, 0);
    totalCol["interceptions"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + item.interceptions, 0);
    totalCol["yardsComp"] = players.length === 0 ? "-" 
    : totalCol["completed"] === 0 ? 0
    : ((Number(totalCol["yards"])/Number(totalCol["completed"]))).toFixed(1);
    totalCol["yardsAtt"] = players.length === 0 ? "-" 
    : totalCol["attempts"] === 0 ? 0
    : ((Number(totalCol["yards"])/Number(totalCol["attempts"]))).toFixed(1);
    totalCol["rating"] = players.length === 0 ? "-" : 
       totalCol["attempts"] === 0 ? 0 :
                           Number(
            (8.4 * totalCol["yards"]
              + 330 * totalCol["touchdowns"]
              + 100 * totalCol["completed"]
              - 200 * totalCol["interceptions"])
            / totalCol["attempts"]).toFixed(1);
      
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    players.push(totalCol); 
    this.dataSource = new PlayerPassingDataSource(players, this.sort);
  }
  
  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
  public valueReadability(num: any) {
    if (num % 1 != 0 && typeof num === 'number') return num.toFixed(1);
    return num;
  }

}

export class PlayerPassingDataSource extends DataSource<any> {
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
