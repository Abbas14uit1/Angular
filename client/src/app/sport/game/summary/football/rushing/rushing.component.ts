import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-rushing",
  templateUrl: "./rushing.component.html",
  styleUrls: ["./rushing.component.css", "../summary-football.component.css"],
})
export class RushingComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name", "attempts", "yards", "touchdowns", "long","yardsAtt"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {   
     const players: any[] = this.data
      .map((x) => {
        return {
          _id: x._id,
          name: x.name,
          attempts: x.attempts,
          yards: x.yards,
          touchdowns: x.touchdowns,
          long: x.long,
          yardsAtt: x.attempts === undefined || x.yards === undefined || x.attempts === 0  ?
            0 : ((x.yards/x.attempts)).toFixed(1),
        };
        });    
    this.extraRows = this.otherLength - players.length;
    this.totalCol["name"] = "TOTAL";
    this.totalCol["attempts"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.attempts ? item.attempts : 0), 0);
    this.totalCol["yards"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.yards ? item.yards : 0), 0);
    this.totalCol["touchdowns"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.touchdowns ? item.touchdowns : 0), 0);
    this.totalCol["long"] = players.length === 0 ? "-" :players.reduce((max, b) => Math.max(max, b.long), (this.data[0].long ? this.data[0].long : 0));
    this.totalCol["yardsAtt"] = players.length === 0 ? "-" 
              : ((Number(this.totalCol["yards"])/Number(this.totalCol["attempts"]))).toFixed(1);

    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }         
      this.extraRowsDisplayed = this.extraRows;
    }    
    players.push(this.totalCol); 
    this.dataSource = new PlayerRushingDataSource(players, this.sort);   
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}

export class PlayerRushingDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private onInit = new BehaviorSubject("");
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<IPlayerRushing[]> {
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
        case "attempts": [propertyA, propertyB] = [a.attempts, b.attempts]; break;
        case "yards": [propertyA, propertyB] = [a.yards, b.yards]; break;
        case "touchdowns": [propertyA, propertyB] = [a.touchdowns, b.touchdowns]; break;
        case "long": [propertyA, propertyB] = [a.long, b.long]; break;
        case "yardsAtt": [propertyA, propertyB] = [a.yardsAtt, b.yardsAtt]; break;
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
