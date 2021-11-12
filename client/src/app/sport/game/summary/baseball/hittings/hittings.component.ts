import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerHittingStats } from "../../../../../../../../typings/athlyte/baseball/game/game";

@Component({
  selector: "app-hittings",
  templateUrl: "./hittings.component.html",
  styleUrls: ["./hittings.component.css", "../summary-baseball.component.css"],
})
export class HittingsComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name", "bats", "atbat", "runs", "hits", "rbi", "so", "ground", "fly"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {   
     const players: any[] = this.data;    
    this.extraRows = this.otherLength - players.length;
    this.totalCol["name"] = "TOTAL";
    this.totalCol["bats"] = "-";
    this.totalCol["atbat"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.atbat ? item.atbat : 0), 0).toFixed(1);
    this.totalCol["runs"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.runs ? item.runs : 0), 0).toFixed(1);
    this.totalCol["hits"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.hits ? item.hits : 0), 0).toFixed(1);
    this.totalCol["rbi"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.rbi ? item.rbi : 0), 0).toFixed(1);
    this.totalCol["so"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.so ? item.so : 0), 0).toFixed(1);
    this.totalCol["ground"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.ground ? item.ground : 0), 0).toFixed(1);
    this.totalCol["fly"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.fly ? item.fly : 0), 0).toFixed(1);
   

    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }         
      this.extraRowsDisplayed = this.extraRows;
    }    
    players.push(this.totalCol); 
    this.dataSource = new PlayerHittingDataSource(players, this.sort);   
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}

export class PlayerHittingDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private onInit = new BehaviorSubject("");
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<IPlayerHittingStats[]> {
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
      if (element.name !== undefined) {
        realData.push(element);
      } else {
        blanks.push({});
      }
    });
    realData = realData.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";

      switch (this.sort.active) {
        case "name": [propertyA, propertyB] = [a.name, b.name]; break;
        case "bats": [propertyA, propertyB] = [a.bats, b.bats]; break;
        case "atbat": [propertyA, propertyB] = [a.atbat, b.atbat]; break;
        case "runs": [propertyA, propertyB] = [a.runs, b.runs]; break;
        case "hits": [propertyA, propertyB] = [a.hits, b.hits]; break;
        case "rbi": [propertyA, propertyB] = [a.rbi, b.rbi]; break;
        case "so": [propertyA, propertyB] = [a.so, b.so]; break;
        case "ground": [propertyA, propertyB] = [a.ground, b.ground]; break;
        case "fly": [propertyA, propertyB] = [a.fly, b.fly]; break;
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
