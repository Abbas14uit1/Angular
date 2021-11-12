import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-baserunning",
  templateUrl: "./baserunning.component.html",
  styleUrls: ["./baserunning.component.css", "../summary-baseball.component.css"],
})
export class BaserunningComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public totalCol:any = {};
  public dataSource: any;
  public displayedColumns = ["name", "sb", "sba", "cs", "po"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {   
     const players: any[] = this.data;    
    this.extraRows = this.otherLength - players.length;
    this.totalCol["name"] = "TOTAL";
    this.totalCol["sb"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.sb ? item.sb : 0), 0).toFixed(1);
    this.totalCol["sba"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.sba ? item.sba : 0), 0).toFixed(1);
    this.totalCol["cs"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.cs ? item.cs : 0), 0).toFixed(1);
    this.totalCol["po"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + (item.po ? item.po : 0), 0).toFixed(1);
   

    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }         
      this.extraRowsDisplayed = this.extraRows;
    }    
    players.push(this.totalCol); 
    this.dataSource = new PlayerBaserunningDataSource(players, this.sort);   
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}

export class PlayerBaserunningDataSource extends DataSource<any> {
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
        case "sb": [propertyA, propertyB] = [a.sb, b.sb]; break;
        case "sba": [propertyA, propertyB] = [a.sba, b.sba]; break;
        case "cs": [propertyA, propertyB] = [a.cs, b.cs]; break;
        case "po": [propertyA, propertyB] = [a.po, b.po]; break;
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
