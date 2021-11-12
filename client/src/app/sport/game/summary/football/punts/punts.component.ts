import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-punts",
  templateUrl: "./punts.component.html",
  styleUrls: ["./punts.component.css", "../summary-football.component.css"],
})
export class PuntsComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name","puntNum", "puntYards", "avg","puntLong","puntTb","puntFc","puntInside20", "puntPlus50", "puntBlocked"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {       
    this.extraRows = this.otherLength - this.data.length;
    const players: any[] = this.data;     
    this.totalCol["name"] = "TOTAL";
    this.totalCol["puntNum"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntNum ? item.puntNum : 0), 0);
    this.totalCol["puntYards"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntYards ? item.puntYards : 0), 0);
    this.totalCol["avg"] = players.length === 0 ? "-" 
    : this.totalCol["puntNum"] === 0 ? 0 
    : (this.totalCol["puntYards"]/this.totalCol["puntNum"]).toFixed(1);
    this.totalCol["puntLong"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntLong ? item.puntLong : 0), 0);
    this.totalCol["puntInside20"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntInside20 ? item.puntInside20 : 0), 0);
    this.totalCol["puntTb"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntTb ? item.puntTb : 0), 0);
    this.totalCol["puntPlus50"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntPlus50 ? item.puntPlus50 : 0), 0);
    this.totalCol["puntFc"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntFc ? item.puntFc : 0), 0);
    this.totalCol["puntBlocked"] = players.length === 0 ? "-" : players.reduce((sum, item) => sum + (item.puntBlocked ? item.puntBlocked : 0), 0);
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
