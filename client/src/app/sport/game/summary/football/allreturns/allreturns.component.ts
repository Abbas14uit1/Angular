import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-allreturns",
  templateUrl: "./allreturns.component.html",
  styleUrls: ["./allreturns.component.css", "../summary-football.component.css"],
})
export class AllreturnsComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name", "prNo", "prYards","prTd","prLong","prAvg","krNo", "krYards","krTd","krLong","krAvg"]; 
  public columnGroups = [
    {
      name: "RETURNS",
      colSpan: 1,
    },
    {
      name: "PUNTS",
      colSpan: 2,
    },
    {
      name: "KO",
      colSpan: 3,
    },
    {
      name: "INT",
      colSpan: 3,
    },
  ];
  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {       
    this.extraRows = this.otherLength - this.data.length;
    const players: any[] = this.data;     
    this.totalCol["name"] = "TOTAL";
    this.totalCol["prNo"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.prNo ? item.prNo : 0), 0);
    this.totalCol["prYards"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.prYards ? item.prYards : 0), 0);
    this.totalCol["prLong"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.prLong ? item.prLong : 0), 0);
    this.totalCol["irNo"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.irNo ? item.irNo : 0), 0);
    this.totalCol["irYards"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.irYards ? item.irYards : 0), 0);
    this.totalCol["irLong"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.irLong ? item.irLong : 0), 0);
    this.totalCol["krNo"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.krNo ? item.krNo : 0), 0);
    this.totalCol["krYards"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.krYards ? item.krYards : 0), 0);
    this.totalCol["krLong"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.krLong ? item.krLong : 0), 0);
    this.totalCol["prAvg"] = players.length === 0  ? "-" : 
                   this.totalCol["prNo"] === 0 ? 0 
                  : ((Number(this.totalCol["prYards"])/Number(this.totalCol["prNo"]))).toFixed(1);
    this.totalCol["krAvg"] = players.length === 0 ? "-" :
                 this.totalCol["krNo"] === 0 ? 0 
                : ((Number(this.totalCol["krYards"])/Number(this.totalCol["krNo"]))).toFixed(1);
    this.totalCol["prTd"] = players.length === 0  ? "-" : players.reduce((sum, item) => sum + (item.prTd ? item.prTd : 0), 0);
    this.totalCol["krTd"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.krTd ? item.krTd : 0), 0);
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
