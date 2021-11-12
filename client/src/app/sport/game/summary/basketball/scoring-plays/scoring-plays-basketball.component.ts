import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { IGameBasketBallScoring } from "../../../../../../../../typings/athlyte/football/game/game";

@Component({
  selector: "app-scoring-plays-basketball",
  templateUrl: "./scoring-plays-basketball.component.html",
  styleUrls: ["./scoring-plays-basketball.component.css", "../summary-basketball.component.css"],
})
export class ScoringPlaysBaketballComponent implements OnInit {

  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public scoringPlays: IGameBasketBallScoring[];
  @Input() public sportId: any;
  @Input() public homeTeamCode: any;
  @Input() public awayTeamCode: any;
  public homeTeamFirstHalf: any;
  public awayTeamFirstHalf: any;
  public homeTeamSecondHalf: any;
  public awayTeamSecondHalf: any;

  public dataSource: ScoringPlaysDataSource;
  public displayedColumns = ["description", "home", "away"];

  // tslint:disable:no-empty
  constructor() { }

  public ngOnInit() {
    this.dataSource = new ScoringPlaysDataSource(this.scoringPlays);
    this.homeTeamFirstHalf = this.scoringPlays.filter((task) => task.period === 1);
    this.homeTeamSecondHalf = this.scoringPlays.filter((task) => task.period === 1);
  }
  public getName(VH: any) {
    if (VH === 0) {
      return this.awayTeam.tidyName;
    } else {
      return this.homeTeam.tidyName;
    }
  }

}

export class ScoringPlaysDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  constructor(private data: IGameBasketBallScoring[]) {
    super();
  }

  public connect(): Observable<any[]> {

    const stats: any[] = this.data
      .map((x) => {
        return {
          description: x.description,
          home: x.score.homeScore,
          away: x.score.homeScore,
        };
      });
    return Observable.of(stats);
  }

  public splitDesc(desc: string) {
    const split = desc.split(", clock");

    return split[0];
  }

  public disconnect() { return; }
}
