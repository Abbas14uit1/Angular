import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerReceiving } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-receiving",
  templateUrl: "./receiving.component.html",
  styleUrls: ["./receiving.component.css", "../summary-football.component.css"],
})
export class ReceivingComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: any;
  public dataSource: PlayerReceivingDataSource;
  public displayedColumns = ["name", "targets", "receptions", "yards", "touchdowns", "long","yardsRcv"];

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
          receptions: x.receptions,
          yards: x.yards,
          touchdowns: x.touchdowns,
          long: x.long,
          yardsRcv: x.receptions === undefined || x.yards === undefined || x.receptions === 0  ?
            0 : ((x.yards/x.receptions)).toFixed(1),
        };
        });   
    this.extraRows = this.otherLength - this.data.length; 
     let totalCol: any = {};  
    totalCol["name"] = "TOTAL";       
    totalCol["receptions"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + ( item.receptions ? item.receptions : 0 ), 0);
    totalCol["yards"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + ( item.yards ? item.yards : 0 ), 0);
    totalCol["touchdowns"] = players.length === 0 ? "-" :players.reduce((sum, item) => sum + ( item.touchdowns ? item.touchdowns : 0 ), 0);
    totalCol["long"] = players.length === 0 ? "-" :players.reduce((max, b) => Math.max(max, b.long), (this.data[0] ? this.data[0].long : 0 ) );      
    totalCol["yardsRcv"] = players.length === 0 ? "-" 
    : totalCol["receptions"] === 0 ? 0 
    : ((Number(totalCol["yards"])/Number(totalCol["receptions"]))).toFixed(1);
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }
      this.extraRowsDisplayed = this.extraRows;    }    
      players.push(totalCol);
    this.dataSource = new PlayerReceivingDataSource(players, this.sort);
  }
  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }

  public totalTargets(){
    return this.data.reduce((sum, item) => sum + ( item.targets ? item.targets : 0 ), 0);
  }

  public getZeroValue(value: any) {
    return value ? value : "-";
  }
}

export class PlayerReceivingDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private onInit = new BehaviorSubject("");
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<IPlayerReceiving[]> {
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
        case "targets": [propertyA, propertyB] = [a.targets, b.targets]; break;
        case "receptions": [propertyA, propertyB] = [a.receptions, b.receptions]; break;
        case "yards": [propertyA, propertyB] = [a.yards, b.yards]; break;
        case "touchdowns": [propertyA, propertyB] = [a.touchdowns, b.touchdowns]; break;
        case "long": [propertyA, propertyB] = [a.long, b.long]; break;
        case "yardsRcv":[propertyA, propertyB] = [a.yardsRcv, b.yardsRcv]; break; 
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
