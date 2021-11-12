import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { IRoster } from "../../../../../../typings/athlyte/football/dashboard/roster.d";
import { DashboardService } from "../dashboard.service";

@Component({
  selector: "app-roster",
  templateUrl: "./roster.component.html",
  styleUrls: ["./roster.component.css", "../dashboard.component.css"],
  providers: [DashboardService],
})
export class RosterComponent implements OnInit, OnChanges {
  @Input() public selectedSeason: number;
  @Input() public teamId: any;
  @Input() public sportId: any;

  public dataSource: RosterDataSource | null;
  public displayedColumns = ["name", "uniform", "class", "position"];

  public roster: IRoster[];

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(public dashboardService: DashboardService, private router: Router) { }

  public ngOnInit() {
    this.getSeasonRoster();
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public ngOnChanges() {
    this.getSeasonRoster();
  }
  public getSeasonRoster() {
    this.dashboardService.getSeasonRoster(this.selectedSeason, this.teamId, this.sportId)
      .subscribe(
      (roster) => this.roster = roster,
      (err) => console.log(err),
      () => {
        this.dataSource = new RosterDataSource(this.roster, this.sort);
      },
    );
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }
}
export class RosterDataSource extends DataSource<any> {
  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }

  private filteredData: any[] = [];
  private renderedData: any[] = [];

  constructor(
    private data: any[],
    private sort: MatSort,
  ) {
    super();
  }
  public connect(): Observable<any[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.filterChange,
    ];
    const roster: any[] = this.data;
    
    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this.data.slice().filter((item: any) => {
        if (this.filter !== null && this.filter !== "") {
          const filterText = this.filter.toLowerCase();
          const exists = Object.keys(item).some((k: any) => {
            return item[k] ? item[k].toLocaleString().toLowerCase().indexOf(filterText) >= 0 : false;
          });
          return exists;
        }
        return true;
      });


      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());
      this.renderedData = sortedData;
      return this.renderedData;
    });
  }

  public disconnect() { return; }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";

      switch (this.sort.active) {
        case "name": [propertyA, propertyB] = [a.name, b.name]; break;
        case "uniform": [propertyA, propertyB] = [a.uniform, b.uniform]; break;        
        case "position": [propertyA, propertyB] = [this.positionMap(a.position), this.positionMap(b.position)]; break;
        case "class": [propertyA, propertyB] = [this.classMap(a.class), this.classMap(b.class)]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
  private positionMap(position: string | null) {
    return position ? position : "N/A"; 
  }
  private classMap(playerClass: string | null) {
    switch (playerClass) {
      case "FR": return 0;
      case "SO": return 1;
      case "JR": return 2;
      case "SR": return 3;
      default: return 4;
    }
  }
}
