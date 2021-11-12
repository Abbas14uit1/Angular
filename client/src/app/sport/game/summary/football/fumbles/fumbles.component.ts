import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-fumbles",
  templateUrl: "./fumbles.component.html",
  styleUrls: ["./fumbles.component.css", "../summary-football.component.css"],
})
export class FumblesComponent implements OnInit {
  @Input() public data: any[];
  @Input() public otherLength: number;
  public dataSource: PlayerDefenseDataSource;
  @Input() public color: string = "#000";
  @Input() public sportId: string;
  public displayedColumns = ["name", "total", "lost"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {
    let totalCol: any = {};
    totalCol["name"] = "TOTAL";
    totalCol["total"] = this.data.length === 0 ? "-" :this.data.reduce((sum, item) => sum + ( item.total ? item.total : 0 ), 0);
    totalCol["lost"] = this.data.length === 0 ? "-" :this.data.reduce((sum, item) => sum + ( item.lost ? item.lost : 0 ), 0);
    this.extraRows = this.otherLength - this.data.length;
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        this.data.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    this.data.push(totalCol);
    this.dataSource = new PlayerDefenseDataSource(this.data, this.sort);
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
    const player: any[] = this.data;
    return Observable.merge(...displayDataChanges).map(() => {
      // Sort filtered data
      this.renderedData = this.sortData(player);
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
        case "total": [propertyA, propertyB] = [a.total, b.total]; break;
        case "lost": [propertyA, propertyB] = [a.lost, b.lost]; break;
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
