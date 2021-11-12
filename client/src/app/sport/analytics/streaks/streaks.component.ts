import { DataSource } from "@angular/cdk/collections";
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatSort
} from "@angular/material";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { AnalyticsService } from "app/sport/analytics/analytics.service";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";
import { PlayersDialogComponent } from "../../alerts/records/players.dialog.component";
import * as _ from "lodash";

@Component({
  selector: "app-streaks",
  templateUrl: "./streaks.component.html",
  styleUrls: ["./streaks.component.css"],
  providers: [AnalyticsService]
})
export class StreaksComponent implements OnInit {
  public streaks: any = [];
  public spinner: boolean = false;
  @Input() public teamColor: any;
  @Input() public teamCode: any;
  @Input() public sportCode: any;
  public dataSource: any | null;
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;
  public splitsStreaks = [
    { value: "Game", viewValue: "Game", checked: true },
    { value: "Season", viewValue: "Season", checked: false },
    { value: "Career", viewValue: "Career/All-Time", checked: false }
  ];
  public entitiesStreaks = [
    {
      value: "Player",
      viewValue: "Player",
      checked: true,
      class: "fa fa-user"
    },
    { value: "Team", viewValue: "Team", checked: false, class: "fa fa-users" }
  ];
  public entityStreaks: string = this.entitiesStreaks[0].value;
  public selectedSplitStreaks: string = this.splitsStreaks[0].value;
  public displayedColumns = [
    "_id",
    "teamName",
    "currentStreakSeasonStart",
    "currentStreakDateStart",
    "currentStreakOppoStartTeamCode",
    "currentStreakSeasonRecent",
    "currentStreakDateRecent",
    "currentStreakOppoRecentTeamCode",
    "currentStreakTotalLength"
  ];
  public categoriesStreaks: any[] = [];
  public selectedCategoryStreaks: string = "";
  public selectedStatsStreaks: string = "";
  public statsStreaks: any[] = [];
  public descriptorsStreaks: any[] = [];
  public descriptorStreaks: string = "";
  public descriptorsStreakValues: any[] = [];
  public statValueStreaks: any = "";
  public statsData: any = [];
  constructor(
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  public ngOnInit() {
    this.dataSource = new RecordsDataSource(this.streaks, this.sort);
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .filter((k: any) => k.which === 13 || k.currentTarget.value.length === 0)
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
    this.getStreaksStats();
  }
  public splitSectionChange(event: any) {
    this.selectedSplitStreaks = event;
    this.getStreaksStats();
  }
  public descriptorChange(event: any) {
    this.descriptorStreaks = event;
    this.getStreaks();
  }
  public onEntityChange(newValue: any) {
    this.entityStreaks = newValue;
    this.selectedSplitStreaks = "Game";
    if (newValue === "Player") {
      this.splitsStreaks = [
        { value: "Game", viewValue: "Game", checked: true },
        { value: "Season", viewValue: "Season", checked: false },
        { value: "Career", viewValue: "Career/All-Time", checked: false }
      ];
    } else {
      this.splitsStreaks = [
        { value: "Game", viewValue: "Game", checked: true },
        { value: "Season", viewValue: "Season", checked: false }
      ];
    }
    this.getStreaksStats();
  }
  public onChangeCategory(newValue: any) {
    this.selectedCategoryStreaks = newValue;
    this.descriptorsStreaks = [];
    this.descriptorStreaks = "";
    this.descriptorsStreakValues = [];
    this.statValueStreaks = "";
    let i = 0;
    this.statsStreaks = _.uniq(
      this.statsData
        .filter((x: any) => x.statCategory == newValue)
        .map((y: any) => y.statistic)
        .sort()
    );
    this.selectedStatsStreaks = this.statsStreaks[0];
    this.descriptorsStreaks = _.uniq(
      this.statsData
        .filter(
          (x: any) =>
            x.statistic == this.selectedStatsStreaks &&
            x.statCategory == this.selectedCategoryStreaks
        )
        .map((y: any) => y.statQualifiers)
        .sort()
    );
    this.descriptorStreaks = this.descriptorsStreaks[0];
    this.descriptorsStreakValues = _.uniq(
      this.statsData
        .filter(
          (x: any) =>
            x.statistic == this.selectedStatsStreaks &&
            x.statCategory == this.selectedCategoryStreaks &&
            x.statQualifiers == this.descriptorStreaks
        )
        .map((y: any) => y.statQualifierValue)
        .sort()
    );
    this.statValueStreaks = this.descriptorsStreakValues[0];

    this.getStreaks();
  }
  public onStatCategory(newValue: any) {
    this.selectedStatsStreaks = newValue;
    this.descriptorsStreaks = _.uniq(
      this.statsData
        .filter(
          (x: any) =>
            x.statistic == this.selectedStatsStreaks &&
            x.statCategory == this.selectedCategoryStreaks
        )
        .map((y: any) => y.statQualifiers)
        .sort()
    );
    this.descriptorStreaks = this.descriptorsStreaks[0];
    this.descriptorsStreakValues = _.uniq(
      this.statsData
        .filter(
          (x: any) =>
            x.statistic == this.selectedStatsStreaks &&
            x.statCategory == this.selectedCategoryStreaks &&
            x.statQualifiers == this.descriptorStreaks
        )
        .map((y: any) => y.statQualifierValue)
        .sort()
    );
    this.statValueStreaks = this.descriptorsStreakValues[0];
    this.getStreaks();
  }
  public onDescriptorChange(newValue: any) {
    this.descriptorStreaks = newValue;
    this.descriptorsStreakValues = _.uniq(
      this.statsData
        .filter(
          (x: any) =>
            x.statistic == this.selectedStatsStreaks &&
            x.statCategory == this.selectedCategoryStreaks &&
            x.statQualifiers == this.descriptorStreaks
        )
        .map((y: any) => y.statQualifierValue)
        .sort()
    );
    this.statValueStreaks = this.descriptorsStreakValues[0];
    this.getStreaks();
  }
  public onStatValue(newValue: any) {
    this.statValueStreaks = newValue;
    this.getStreaks();
  }
  public getWidthStyles() {
    let widthStyle = {
      "max-width": this.selectedSplitStreaks == "Game" ? "25%" : "45%"
    };
    return widthStyle;
  }

  private getStreaks() {
    this.streaks = [];
    this.spinner = true;
    this.analyticsService
      .getStreaks(
        this.sportCode,
        this.teamCode,
        this.entityStreaks,
        this.selectedSplitStreaks,
        this.selectedCategoryStreaks,
        this.selectedStatsStreaks,
        this.statValueStreaks,
        this.descriptorStreaks
      )
      .subscribe(
        (results: any) => {
          this.streaks = results;
          this.dataSource = new RecordsDataSource(this.streaks, this.sort);
          this.spinner = false;
        },
        err => null
      );
  }

  private getStreaksStats() {
    this.categoriesStreaks = [];
    this.descriptorsStreaks = [];
    this.statsStreaks = [];
    this.streaks = [];
    this.descriptorStreaks = "";
    this.selectedStatsStreaks = "";
    this.selectedCategoryStreaks = "";
    this.spinner = true;
    this.descriptorsStreakValues = [];
    this.statValueStreaks = "";
    this.analyticsService
      .getStreaksStats(
        this.sportCode,
        this.teamCode,
        this.entityStreaks,
        this.selectedSplitStreaks
      )
      .subscribe(
        (results: any) => {
          if (results.length > 0) {
            this.statsData = results.map((x: any) => x.statsdata).flat();
            this.categoriesStreaks = results.map((x: any) => x._id).flat();
            (this.selectedCategoryStreaks = this.categoriesStreaks[0]),
              (this.statsStreaks = _.uniq(
                this.statsData
                  .filter(
                    (x: any) => x.statCategory == this.selectedCategoryStreaks
                  )
                  .map((y: any) => y.statistic)
                  .sort()
              ));
            this.selectedStatsStreaks = this.statsStreaks[0];
            this.descriptorsStreaks = _.uniq(
              this.statsData
                .filter(
                  (x: any) =>
                    x.statistic == this.selectedStatsStreaks &&
                    x.statCategory == this.selectedCategoryStreaks
                )
                .map((y: any) => y.statQualifiers)
                .sort()
            );
            this.descriptorStreaks = this.descriptorsStreaks[0];
            this.descriptorsStreakValues = _.uniq(
              this.statsData
                .filter(
                  (x: any) =>
                    x.statistic == this.selectedStatsStreaks &&
                    x.statCategory == this.selectedCategoryStreaks &&
                    x.statQualifiers == this.descriptorStreaks
                )
                .map((y: any) => y.statQualifierValue)
                .sort()
            );
            this.statValueStreaks = this.descriptorsStreakValues[0];
            this.getStreaks();
          }
          this.spinner = false;
        },
        err => null
      );
  }
  public valueReadability(num: any) {
    if (num % 1 != 0 && typeof num === "number") return num.toFixed(2);
    return num;
  }
  public showStreakDetial(streakData: any, entityStreaks: any) {
    let title = "";
    if (entityStreaks === "Player") {
      title = streakData.playerName;
    } else {
      title = streakData.teamName;
    }
    let streakDetails = streakData.streakDetails;
    for (var i = 0; i < streakDetails.length; i++) {
      if (streakDetails[i].opponentName) {
        streakDetails[i].Opponent = streakDetails[i].opponentName;
        streakDetails[i].GameDate = streakDetails[i].gameDate;
        streakDetails[i][streakData.statLabel] = streakDetails[i].statValue;
        delete streakDetails[i].opponentName;
        delete streakDetails[i].gameDate;
        delete streakDetails[i].statValue;
      }
    }
    const dialogRef = this.dialog.open(PlayersDialogComponent, {
      data: {
        title: title + " Detail",
        teamColor: this.teamColor,
        teamCode: this.teamCode,
        records: streakDetails
      }
    });
  }
}
export class RecordsDataSource extends DataSource<any> {
  private filterChange = new BehaviorSubject("");
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }

  private filteredData: any[] = [];
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<any[]> {
    const displayDataChanges = [this.sort.sortChange, this.filterChange];
    const roster: any[] = this.data;

    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this.data.slice().filter((item: any) => {
        if (this.filter !== null && this.filter !== "") {
          const filterText = this.filter.toLowerCase();
          const exists = Object.keys(item).some((k: any) => {
            return item[k]
              ? item[k]
                .toLocaleString()
                .toLowerCase()
                .indexOf(filterText) >= 0
              : false;
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

  public disconnect() {
    return;
  }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";
      if (this.sort.active == "teamName") {
        [propertyA, propertyB] = a.playerName
          ? [a.playerName, b.playerName]
          : [a[this.sort.active], b[this.sort.active]];
      } else {
        [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1)
      );
    });
  }
}
