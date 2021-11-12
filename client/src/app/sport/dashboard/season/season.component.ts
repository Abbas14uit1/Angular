import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { ISeasonGame, ISeasonGameDisplay } from "../../../../../../typings/athlyte/football/dashboard/season";
import { DashboardService } from "../dashboard.service";

@Component({
  selector: "app-season",
  templateUrl: "./season.component.html",
  styleUrls: ["./season.component.css", "../dashboard.component.css"],
  providers: [DashboardService],
})
export class SeasonComponent implements OnInit, OnChanges {
  @Input() public selectedSeason: number;
  @Input() public teamId: any;
  @Input() public sportId: any;
  public dataSource: SeasonDataSource;
  public displayedColumns = ["actualDate", "venue", "logo", "opponent", "result", "score", "status"];
  private data: ISeasonGame[];

  constructor(public dashboardService: DashboardService, private router: Router) { }

  public ngOnInit() {
    this.getseasonGames();
  }
  public ngOnChanges() {
    this.getseasonGames();
  }
  public getseasonGames() {
    this.dashboardService.getSeason(this.selectedSeason, this.teamId, this.sportId)
      .subscribe(
      (seasons) => {
        this.data = seasons;
      },
      (err) => console.log(err),
      () => {
        this.dataSource = new SeasonDataSource(this.data);
      },
    );
  }
  public onClick(gameId: string) {
    localStorage.setItem("headerTitle", "Game Dashboard -" + localStorage.getItem("sportText"));
    this.router.navigate(["/game", this.sportId, gameId]);
  }
}

export class SeasonDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  constructor(private data: any[]) {
    super();
  }
  public connect(): Observable<ISeasonGameDisplay[]> {
    const seasons: ISeasonGameDisplay[] = this.data
      .map((season) => {
        return {
          _id: season._id,
          date: season.date,
          actualDate: season.actualDate,
          venue: (season.isHome ? "vs" : "@"),
          opponent: season.opponentTidyName,
          opponentCode: season.opponentCode,
          result: season.teamScore == season.opponentScore ? "D" : (season.teamScore > season.opponentScore ? "W" : "L"),
          score: season.teamScore + "-" + season.opponentScore,
          status: "Final",
        };
      })
      .sort((a, b) => {
        return +new Date(a.date) - +new Date(b.date);
      });
    return Observable.of(seasons);
  }

  public disconnect() { return; }
}
