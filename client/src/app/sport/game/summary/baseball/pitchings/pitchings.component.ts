import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerPitchingStats } from "../../../../../../../../typings/athlyte/baseball/game/game";

@Component({
  selector: "app-pitchings",
  templateUrl: "./pitchings.component.html",
  styleUrls: ["./pitchings.component.css", "../summary-baseball.component.css"],
})
export class PitchingsComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name", "ip", "h", "er", "bb", "so", "r", "ab", "ground"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {   
     const players: any[] = this.data;    
    this.extraRows = this.otherLength - players.length;
    this.totalCol["name"] = "TOTAL";
    this.totalCol["ip"] =  players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.ip ? item.ip : 0), 0).toFixed(1);
    this.totalCol["h"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.h ? item.h : 0), 0).toFixed(1);
    this.totalCol["er"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.er ? item.er : 0), 0).toFixed(1);
    this.totalCol["bb"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.bb ? item.bb : 0), 0).toFixed(1);
    this.totalCol["so"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.so ? item.so : 0), 0).toFixed(1);
    this.totalCol["r"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.r ? item.r : 0), 0).toFixed(1);
    this.totalCol["ab"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.ab ? item.ab : 0), 0).toFixed(1);
    this.totalCol["g"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.g ? item.g : 0), 0).toFixed(1);
   

    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }         
      this.extraRowsDisplayed = this.extraRows;
    }    
    players.push(this.totalCol); 
    this.dataSource = new PlayerPitchingDataSource(players, this.sort);   
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}

export class PlayerPitchingDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private onInit = new BehaviorSubject("");
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<IPlayerPitchingStats[]> {
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
        case "ip": [propertyA, propertyB] = [a.ip, b.ip]; break;
        case "h": [propertyA, propertyB] = [a.h, b.h]; break;
        case "er": [propertyA, propertyB] = [a.er, b.er]; break;
        case "bb": [propertyA, propertyB] = [a.bb, b.bb]; break;
        case "so": [propertyA, propertyB] = [a.so, b.so]; break;
        case "r": [propertyA, propertyB] = [a.r, b.r]; break;
        case "ab": [propertyA, propertyB] = [a.ab, b.ab]; break;
        case "ground": [propertyA, propertyB] = [a.ground, b.ground]; break;
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
