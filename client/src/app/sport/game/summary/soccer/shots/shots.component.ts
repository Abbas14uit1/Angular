import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { GameService } from "app/sport/game/game.service";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlayerRushing } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-shots",
  templateUrl: "./shots.component.html",
  styleUrls: ["./shots.component.css","../summary-soccer.component.css"],
})
export class ShotsComponent implements OnInit {

  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;

  public dataSource: PlayerShotsDataSource;
  public displayedColumns = ["name", "shotsSH","shotsSHPCT","shotsSOG","shotsSOGPCT"];

  
  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }
  public ngOnInit() {
    const player: any[] = this.data
      .map((x) => {
        let SHPCT = isNaN(Number((x.g / x.sh).toFixed(3))) ? 0 : ((x.g / x.sh).toFixed(3)).startsWith("0.") ? ((x.g / x.sh).toFixed(3)).substring(1) : Number((x.g / x.sh).toFixed(3));
        let SOGPCT = isNaN(Number((x.sog / x.sh).toFixed(3))) ? 0 : ((x.sog / x.sh).toFixed(3)).startsWith("0.") ? ((x.sog / x.sh).toFixed(3)).substring(1) : Number((x.sog / x.sh).toFixed(3));
        return {
          _id: x._id,
          name: x.name,
          shotsSH : x.sh,
          shotsSHPCT: SHPCT, //isNaN(Number((x.g / x.sh).toFixed(3))) ? 0 : Number((x.g / x.sh).toFixed(3)),
          shotsSOG:x.sog,
          shotsSOGPCT: SOGPCT

        };
      });
    let totalCol: any = {};
    totalCol["name"] = "TOTAL";
    totalCol["shotsSH"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.shotsSH ? item.shotsSH : 0), 0);
    totalCol["shotsSHPCT"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (Number(item.shotsSHPCT) ? Number(item.shotsSHPCT) : 0), 0);
    totalCol["shotsSOG"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.shotsSOG ? item.shotsSOG : 0), 0);
    totalCol["shotsSOGPCT"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (Number(item.shotsSOGPCT) ? Number(item.shotsSOGPCT) : 0), 0);

    var SHPCT = isNaN(totalCol.shotsSHPCT.toFixed(3)) ? 0 : ((totalCol.shotsSHPCT).toFixed(3)).startsWith("0.") ? ((totalCol.shotsSHPCT).toFixed(3)).substring(1) : (totalCol.shotsSHPCT).toFixed(3);
    var SOGPCT = isNaN(totalCol.shotsSOGPCT.toFixed(3)) ? 0 : ((totalCol.shotsSOGPCT).toFixed(3)).startsWith("0.") ? ((totalCol.shotsSOGPCT).toFixed(3)).substring(1) : (totalCol.shotsSOGPCT).toFixed(3);

    totalCol.shotsSHPCT = SHPCT;
    totalCol.shotsSOGPCT = SOGPCT;

    this.extraRows = this.otherLength - this.data.length;
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        player.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    player.push(totalCol);
    this.dataSource = new PlayerShotsDataSource(player, this.sort);
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }

}


export class PlayerShotsDataSource extends DataSource<any> {
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