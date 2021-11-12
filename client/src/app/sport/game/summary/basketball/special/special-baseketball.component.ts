import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
@Component({
  selector: "app-special-baseketball",
  templateUrl: "./special-baseketball.component.html",
  styleUrls: ["./special-baseketball.component.css", "../summary-basketball.component.css"],
})
export class SpecialComponent implements OnInit {

  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: any;
  public dataSource: TeamStatsDataSource;
  public displayedColumns = ["name", "fgm", "fga", "fgpct", "fgm3", "fga3", "ftm"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public constructor(private router: Router) { }

  public ngOnInit() {
    this.extraRows = this.otherLength - this.data.length;
    if (this.extraRows > 0 && (window.innerWidth) >= this.resizeValue) {
      for (let i = 0; i < this.extraRows; i++) {
        this.data.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
    }
    this.dataSource = new TeamStatsDataSource(this.data, this.sort);
  }

  // Remove extra rows on window resize
  @HostListener("window:resize", ["$event"])
  public onResize(event: any) {
    if (event.target.innerWidth < this.resizeValue && this.extraRowsDisplayed > 0) {
      for (let i = 0; i < this.extraRows; i++) {
        this.data.pop();
      }
      this.extraRowsDisplayed = 0;
      this.dataSource = new TeamStatsDataSource(this.data, this.sort);
    } else if (event.target.innerWidth >= this.resizeValue && this.extraRowsDisplayed === 0) {
      for (let i = 0; i < this.extraRows; i++) {
        this.data.push({});
      }
      this.extraRowsDisplayed = this.extraRows;
      this.dataSource = new TeamStatsDataSource(this.data, this.sort);
    }
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
        case "fgm": [propertyA, propertyB] = [a.fgm, b.fgm]; break;
        case "fga": [propertyA, propertyB] = [a.fga, b.fga]; break;
        case "fgpct": [propertyA, propertyB] = [a.fgpct, b.fgpct]; break;
        case "fgm3": [propertyA, propertyB] = [a.fgm3, b.fgm3]; break;
        case "fga3": [propertyA, propertyB] = [a.fga3, b.fga3]; break;
        case "ftm": [propertyA, propertyB] = [a.ftm, b.ftm]; break;
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
