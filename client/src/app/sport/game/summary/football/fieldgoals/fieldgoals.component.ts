import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-fieldgoals",
  templateUrl: "./fieldgoals.component.html",
  styleUrls: ["./fieldgoals.component.css", "../summary-football.component.css"],
})
export class FieldgoalsComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name","fgMade","fgAtt","fgPct","fgLong","fgBlocked","kickmade","kickatt","kckMadePct","pts"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {       
    this.extraRows = this.otherLength - this.data.length;
    const players: any[] = this.data;     
    this.totalCol["name"] = "TOTAL";
    this.totalCol["fgAtt"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.fgAtt ? item.fgAtt : 0), 0);
    this.totalCol["fgBlocked"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.fgBlocked ? item.fgBlocked : 0), 0);
    this.totalCol["fgLong"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.fgLong ? item.fgLong : 0), 0);
    this.totalCol["fgMade"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.fgMade ? item.fgMade : 0), 0);
    this.totalCol["kickmade"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.kickmade ? item.kickmade : 0), 0);
    this.totalCol["kickatt"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.kickatt ? item.kickatt : 0), 0);
    this.totalCol["pts"] = players.length === 0 ? "-"
     : (this.totalCol["fgMade"] * 3) + this.totalCol["kickmade"]; 

    this.totalCol["fgPct"] = players.length === 0 ? "-" 
    : this.totalCol["fgAtt"] === 0 ? 0
    : ((Number(this.totalCol["fgMade"])/Number(this.totalCol["fgAtt"])) * 100).toFixed(1);
    this.totalCol["kckMadePct"] = players.length === 0 ? "-" 
    : this.totalCol["kickatt"] === 0 ? 0
    : ((Number(this.totalCol["kickmade"])/Number(this.totalCol["kickatt"])) * 100).toFixed(1);
    
    if (this.extraRows > 0) {
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
      [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];
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
