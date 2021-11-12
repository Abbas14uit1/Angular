import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
@Component({
  selector: "app-shootings-baseketball",
  templateUrl: "./shootings-baseketball.component.html",
  styleUrls: ["./shootings-baseketball.component.css", "../summary-basketball.component.css"],
})
export class ShootingsComponent implements OnInit {

  @Input() public data: any[];
  @Input() public otherLength: number;
  @Input() public color: string = "#000";
  @Input() public sportId: any;
  @Input() public title: any;
  public dataSource: TeamStatsDataSource;
  public displayedColumns = ["name","min","tp","fgm","fga","fgpct","fgm3","fga3","fg3pct", "ftm", "fta", "ftpct"];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;

  public constructor(private router: Router) { }

  public ngOnInit() {
    this.extraRows = this.otherLength - this.data.length; 
    const players: any[] = this.data
      .map((x) => {
        return {
          _id: x._id,
          name: x.name,
          fgm: x.fgm ? x.fgm : 0,
          fga: x.fga ? x.fga: 0,
          fgpct: x.fgpct,
          fgm3: x.fgm3 ? x.fgm3 : 0,  
          fga3: x.fga3 ? x.fga3 : 0,       
          fg3pct: x.fg3pct,
          ftm: x.ftm ? x.ftm : 0,
          fta: x.fta ? x.fta : 0,
          ftpct: x.ftpct,
          tp: x.tp,
          min: x.min,
        };
      });
    let totalCol: any = {};
    let TotalFga: number = this.data.reduce((sum, item) => sum + item.fga, 0);
    let TotalFga3: number = this.data.reduce((sum, item) => sum + item.fga3, 0);
    let TotalFta: number = this.data.reduce((sum, item) => sum + item.fta, 0);
    totalCol["name"] = "TOTAL";
    totalCol["fgm"] = this.data.reduce((sum, item) => sum + item.fgm, 0);
    totalCol["fga"] = TotalFga;
    totalCol["fgm3"] = this.data.reduce((sum, item) => sum + item.fgm3, 0);
    totalCol["fga3"] =TotalFga3;
    totalCol["ftm"] = this.data.reduce((sum, item) => sum + item.ftm, 0);
    totalCol["fta"] =TotalFta;    
    totalCol["fgpct"] = TotalFga == 0 ? 0 : ((this.data.reduce((sum, item) => sum + item.fgm, 0) / TotalFga) * 100).toFixed(1);    
    totalCol["fg3pct"] = TotalFga3 == 0 ? 0 : ((this.data.reduce((sum, item) => sum + item.fgm3, 0) / TotalFga3) * 100).toFixed(1);   
    totalCol["ftpct"] = TotalFta == 0 ? 0 : ((this.data.reduce((sum, item) => sum + item.ftm, 0) / TotalFga) * 100).toFixed(0);    
    totalCol["min"] = this.data.reduce((sum, item) => sum + item.min, 0);   
    totalCol["tp"] = this.data.reduce((sum, item) => sum + item.tp, 0);   

    if (this.extraRows > 0) {     
      
      for (let i = 0; i < this.extraRows; i++) {
        players.push({});
      }      
      this.extraRowsDisplayed = this.extraRows;
    }
    players.push(totalCol);
    this.dataSource = new TeamStatsDataSource(players, this.sort);
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
