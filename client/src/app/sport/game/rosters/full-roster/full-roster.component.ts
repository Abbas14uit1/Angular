import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { IGameFullRosterPlayer } from "../../../../../../../typings/athlyte/football/game/game";
import { GameService } from "../../game.service";

@Component({
  selector: "app-full-roster",
  templateUrl: "./full-roster.component.html",
  styleUrls: ["./full-roster.component.css", "../rosters.component.css"],
  providers: [GameService],
})
export class FullRosterComponent implements OnInit {

  @Input() public gameId: string;
  @Input() public teamId: string;
  @Input() public sportId: string;
  public dataSource: FullRosterDataSource;
  public displayedColumns = ["name","uniform","class", "position"];

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  private data: any[];

  constructor(private gameService: GameService, private router: Router) { }

  public ngOnInit() {
    this.gameService.getFullRoster(this.gameId, this.teamId, this.sportId)
      .subscribe(
      (roster) => this.data = roster,
      (err) => console.log(err),
      () => this.dataSource = new FullRosterDataSource(this.data, this.sort),
    );
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public onClick(playerId: string) {
    localStorage.setItem("headerTitle", "Player Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/player", this.sportId, playerId]);
  }

}

export class FullRosterDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }

  private filteredData: any[] = [];
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<IGameFullRosterPlayer[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.filterChange,
    ];
    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this.data.slice().filter((item: any) => {
        const searchStr = (item.name).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
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
        case "class": [propertyA, propertyB] = [this.classMap(a.class), this.classMap(b.class)]; break;
        case "position": [propertyA, propertyB] = [a.position, b.position]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
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
