import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-rebounds-basketball",
  templateUrl: "./rebounds-basketball.component.html",
  styleUrls: ["./rebounds-basketball.component.css", "../summary-basketball.component.css"],
})
export class ReboundsComponent implements OnInit {

  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: any;
  public dataSource: TeamStatsDataSource;
  public displayedColumns = ["name", "oreb", "dreb", "treb"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;

  public constructor(private router: Router) { }

  public ngOnInit() {
    this.extraRows = this.otherLength - this.data.length;
    let totalCol: any = {};
      totalCol["name"] = "TOTAL";
      totalCol["oreb"] = this.data.reduce((sum, item) => sum + item.oreb, 0);
      totalCol["dreb"] = this.data.reduce((sum, item) => sum + item.dreb, 0);
      totalCol["treb"] = this.data.reduce((sum, item) => sum + item.treb, 0);
    if (this.extraRows > 0 ) {
      for (let i = 0; i < this.extraRows; i++) {
        this.data.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
     this.data.push(totalCol);
    this.dataSource = new TeamStatsDataSource(this.data, this.sort);
  }

  

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}

export class TeamStatsDataSource extends DataSource<any> {
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
        case "oreb": [propertyA, propertyB] = [a.oreb, b.oreb]; break;
        case "dreb": [propertyA, propertyB] = [a.dreb, b.dreb]; break;
        case "treb": [propertyA, propertyB] = [a.treb, b.treb]; break;
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
