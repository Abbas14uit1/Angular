import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { IPlay } from "../../../../../../../typings/athlyte/football/play";
import { GameService } from "../../game.service";

@Component({
  selector: "app-play-list-football",
  templateUrl: "./play-list-football.component.html",
  styleUrls: ["./play-list-football.component.css"],
  providers: [GameService],
})
export class PlayListFootballComponent implements OnInit, OnChanges {

  @Input() public gameId: string;
  @Input() public homeTeamTidyName: string;
  @Input() public awayTeamTidyName: string;
  @Input() public sportId: any;
  @Input() public homeTeamCode: any;
  @Input() public awayTeamCode: any;
  public dataSource: PlaysDataSource;
  public data: any[];
  public displayedColumns = ["play", "drive", "quarter", "possession", "situation", "description"];

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;
  public plays: IPlay[];

  constructor(private gameService: GameService) { }

  public ngOnInit() {
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public ngOnChanges() {
    this.gameService.getAllPlays(this.gameId, this.sportId)
      .subscribe(
      (plays) => this.data = plays,
      (err) => null,
      () => {
        this.dataSource = new PlaysDataSource(this.data, this.sort);
      });
  }
}

export class PlaysDataSource extends DataSource<any> {
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
    const plays = this.data.sort((a, b) => {
      return + a.playInGame - + b.playInGame;
    });
    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = plays.slice().filter((item: any) => {
        const searchStr = (item.description).toLowerCase();
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
        case "play": [propertyA, propertyB] = [a.playInGame, b.playInGame]; break;
        case "drive": [propertyA, propertyB] = [a.drive, b.drive]; break;
        case "quarter": [propertyA, propertyB] = [a.quarter, b.quarter]; break;
        case "possession": [propertyA, propertyB] = [a.possession, b.possession]; break;
        case "situation": [propertyA, propertyB] = [a.yardsToGo, b.yardsToGo]; break;
        case "description": [propertyA, propertyB] = [a.description, b.description]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "desc" ? 1 : -1);
    });
  }
}
