import { DataSource } from "@angular/cdk/collections";
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatSort,
} from "@angular/material";
import { ActivatedRoute, Params, Router, Routes } from "@angular/router";
import { AnalyticsService } from "app/sport/analytics/analytics.service";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";

@Component({
  selector: "app-records-basketball",
  templateUrl: "./records-basketball.component.html",
  styleUrls: ["./records-basketball.component.css"],
  providers: [AnalyticsService],
})
export class RecordsBasketballComponent implements OnInit {
  public records: any = [];
  @Input() public teamColor: any;
  @Input() public teamCode: any;
  @Input() public sportCode: any;
  public message: any = null;
  public source: boolean = false;
  public dataSource: any | null;
  public spinner: boolean = false;
  public displayedColumns = [
    "_id",
    "playerName",
    /*    "playerClass",*/
    "gameDate",
    "season",
    "oppoTeamName",
    "statValue",
  ];
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;
  public splits = [
    { value: "Game", viewValue: "Game", checked: true },
    { value: "Season", viewValue: "Season", checked: false },
    { value: "Career", viewValue: "Career/All-Time", checked: false },
  ];
  public entities = [
    {
      value: "Player",
      viewValue: "Player",
      checked: true,
      class: "fa fa-user",
    },
    { value: "Team", viewValue: "Team", checked: false, class: "fa fa-users" },
  ];
  public entity: string = this.entities[0].value;
  public selectedSplit: string = this.splits[0].value;
  public categories: any[] = [
    {
      name: "Offense",
      items: [
        "Total Points",
        "Offensive Rebounds",
        "Field Goals Made",
        "Field Goals Attempted",
        "FG%",
        "Three Point Field Goals Made",
        "Three Point Field Goals Attempted",
        "Three Points Percentage",
        "Free Throws Made",
        "Free Throws Attempted",
        "Free Throws Percentage",
        "Assists",
      ],
    },
    {
      name: "Defense",
      items: [
        "Blocks",
        "Steals",
        "Defensive Rebounds",
      ],
    },
    {
      name: "Offense and Defense",
      items: ["Minutes Played", "Total Rebounds"],
    },
    {
      name: "Fouls",
      items: [
        "Personal Fouls",
        "Turnovers",
      ],
    },
  ];

  public selectedCategory: string = this.categories[0].name;
  public selectedStats: string = this.categories[0].items[0];
  public stats: any[] = this.categories[0].items;
  constructor(
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  public ngOnInit() {
    this.getRecords();
    this.dataSource = new RecordsDataSource(this.records, this.sort);
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
  }

  public splitSectionChange(event: any) {
    this.selectedSplit = event;
    this.getRecords();
  }
  public onEntityChange(newValue: any) {
    this.entity = newValue;
    this.selectedSplit = "Game";
    if (newValue === "Player") {
      this.splits = [
        { value: "Game", viewValue: "Game", checked: true },
        { value: "Season", viewValue: "Season", checked: false },
        { value: "Career", viewValue: "Career/All-Time", checked: false },
      ];
    } else {
      this.splits = [
        { value: "Game", viewValue: "Game", checked: true },
        { value: "Season", viewValue: "Season", checked: false },
      ];
    }
    this.getRecords();
  }
  public onChangeCategory(newValue: any) {
    this.selectedCategory = newValue;
    let i = 0;
    this.categories.forEach((element) => {
      if (element.name == newValue) {
        this.stats = element.items;
        this.selectedStats = element.items[0];
      }
    });
    this.getRecords();
  }
  public onStatCategory(newValue: any) {
    this.selectedStats = newValue;
    this.getRecords();
  }
  public getWidthStyles() {
    let widthStyle = {
      "max-width": this.selectedSplit == "Game" ? "25%" : "45%",
    };
    return widthStyle;
  }

  private getRecords() {
    this.spinner = true;
    this.message = null;
    this.records = [];
    this.source = false;
    this.analyticsService
      .getRecords(
        this.sportCode,
        this.teamCode,
        this.entity,
        this.selectedSplit,
        this.selectedCategory,
        this.selectedStats
      )
      .subscribe(
        (results: any) => {
          this.records = results;
          this.spinner = false;
          this.message = null;
          for (let x of this.records) {
            if (x["source"] && x["source"] !== null && x["source"] == "recordBook") {
              this.source = true;
              this.message = "Record list includes data from team record book that predates data provided to Athlyte";
              break;
            }
          };
          if (!this.message) {
            this.message = "Athlyte record using data provided by team, beginning in Year.";
          }
          this.dataSource = new RecordsDataSource(this.records, this.sort);
        },
        (err) => null
      );
  }

  public seasonCorrection(season: any) {
    if (season && season !== "NaN") {
      switch (this.selectedSplit) {
        case "Game": if (season < 2001) {
          return (Number(season) - 1) + '-' + season.toString().substr(-2);
        }
          return season + '-' + (Number(season) + 1).toString().substr(-2);
        case "Season":
          if (season < 2001) {
            return (Number(season) - 1) + '-' + season.toString().substr(-2);
          }
          return season + '-' + (Number(season) + 1).toString().substr(-2);
        case "Career":
          let firstSeason = season.toString().indexOf("-") > -1 ? Number(season.split("-")[0]) : Number(season);
          let lastSeason = season.toString().indexOf("-") > -1 ? Number(season.split("-")[1]) : Number(season);
          if (firstSeason > 2001) {
            return (firstSeason) + '-' + (lastSeason + 1).toString().substr(-2);
          }
          return firstSeason + '-' + lastSeason.toString().substr(-2);
      }
      return "NA";
    }
  }
  public valueReadability(num: any) {
    if (num % 1 != 0 && typeof num === "number") return num.toFixed(2);
    return num;
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
              ? item[k].toLocaleString().toLowerCase().indexOf(filterText) >= 0
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
      if (this.sort.active == "playerName") {
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
