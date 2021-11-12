import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-defense",
  templateUrl: "./defense.component.html",
  styleUrls: ["./defense.component.css", "../summary-football.component.css"],
})
export class DefenseComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: string;

  public dataSource: PlayerDefenseDataSource;
  public displayedColumns = ["name", "tackles", "assists", "total", "tfl", "tflYards", "sacks", "sackYards", "dQbh", "dblkd"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {
    const player: any[] = this.data
      .map((x) => {
        return {
          _id: x._id,
          name: x.name,
          tackles: x.tackles,
          assists: x.assists,
          total: x.total,
          sacks: x.sacks ? Number(x.sacks).toFixed(1) : 0,
          sackYards: x.sackYards ? Number(x.sackYards).toFixed(1) : 0,
          sacksAndYards: x.sacks === undefined ? '' :
            Number(x.sacks).toFixed(1) + "/" + x.sackYards,
          intYards: x.intYards,
          interceptions: x.interceptions ? Number(x.interceptions).toFixed(1) : 0,
          int: x.interceptions === undefined ? '' : Number(x.interceptions).toFixed(1) + "/" + x.intYards,
          tfl: x.tfl ? Number(x.tfl).toFixed(1) : 0,
          dFr: x.dFr ? Number(x.dFr).toFixed(1) : 0,
          tflYards: x.tflYards ? Number(x.tflYards).toFixed(1) : 0,
          dFryds: x.dFryds,
          tfls: x.tfl === undefined ? '' : Number(x.tfl),
          dFrYards: x.dFr === undefined ? '' : Number(x.dFr).toFixed(1) + "/" + x.dFryds,
          dQbh: x.dQbh ? x.dQbh : 0,
          dblkd: x.dblkd ? x.dblkd : 0,
        };
      });
    let totalCol: any = {};
    totalCol["name"] = "TOTAL";
    totalCol["tackles"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.tackles ? item.tackles : 0), 0);
    totalCol["assists"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.assists ? item.assists : 0), 0);
    totalCol["total"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.total ? item.total : 0), 0);
    totalCol["sackYards"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.sackYards ? Number(item.sackYards) : 0), 0).toFixed(1);
    totalCol["sacks"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.sacks ? Number(item.sacks) : 0), 0).toFixed(1);
    totalCol["tfl"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.tfl ? Number(item.tfl) : 0), 0).toFixed(1);
    totalCol["tflYards"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.tflYards ? Number(item.tflYards) : 0), 0).toFixed(1);
    totalCol["dQbh"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.dQbh ? Number(item.dQbh) : 0), 0).toFixed(1);
    totalCol["dblkd"] = player.length === 0 ? "-" : player.reduce((sum, item) => sum + (item.dblkd ? Number(item.dblkd) : 0), 0).toFixed(1);


    this.extraRows = this.otherLength - this.data.length;
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        player.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    player.push(totalCol);
    this.dataSource = new PlayerDefenseDataSource(player, this.sort);
  }


  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }

}

export class PlayerDefenseDataSource extends DataSource<any> {
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
        case "tackles": [propertyA, propertyB] = [a.tackles, b.tackles]; break;
        case "assists": [propertyA, propertyB] = [a.assists, b.assists]; break;
        case "total": [propertyA, propertyB] = [a.total, b.total]; break;
        case "sackYards": [propertyA, propertyB] = [a.sackYards, b.sackYards]; break;
        case "sacks": [propertyA, propertyB] = [a.sacks, b.sacks]; break;
        case "tfls": [propertyA, propertyB] = [a.tfls, b.tfls]; break;
        case "tflYards": [propertyA, propertyB] = [a.tflYards, b.tflYards]; break;
        case "dQbh": [propertyA, propertyB] = [a.dQbh, b.dQbh]; break;
        case "dblkd": [propertyA, propertyB] = [a.dblkd, b.dblkd]; break;
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
