import { DataSource } from "@angular/cdk/collections";
import { Component, HostListener, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";
@Component({
  selector: "app-player-agg-baseketball",
  templateUrl: "./player-agg-baseketball.component.html",
  styleUrls: ["./player-agg-baseketball.component.css"],
})
export class PlayerAggBaseketballComponent implements OnInit {

  @Input() public seasonStats: any[];
  public shared: TeamColors = new TeamColors();
  @Input() public careerStats: any;
  @Input() public sportId: any;
  @Input() public teamCode: any;
  @Input() public title: any;
  public dataSource: any;
  public columnDisplayNames: {
    [key: string]: string;
  } = {};
  public displayedColumns = [
    "season",
    "GP",
    "MIN",
    "FGM",
    "FGPCT",
    "FGM3",
    "FG3PCT",
    "FTM",
    "FTPCT",
    "OREB",
    "DREB",
    "TREB",
    "AST",
    "STL",
    "BLK",
    "TO",
    "PF",
    "TF",
    "TP",
  ];

  @ViewChild(MatSort) public sort: MatSort;

  private extraRows = 0;
  private extraRowsDisplayed = 0;
  private resizeValue = 750;

  public teamColors: any;
  constructor(public route: ActivatedRoute) {
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {
    this.columnDisplayNames.GP = "GP";
    this.columnDisplayNames.MIN = "MIN";
    this.columnDisplayNames.FGM = "FGM/FGA";
    this.columnDisplayNames.FGPCT = "FG%";
    this.columnDisplayNames.FGM3 = "FGM3/FGA3";
    this.columnDisplayNames.FG3PCT = "FG3%";
    this.columnDisplayNames.FTM = "FTM/FTA";
    this.columnDisplayNames.FTPCT = "FT%";
    this.columnDisplayNames.TP = "TP";
    this.columnDisplayNames.BLK = "BLK";
    this.columnDisplayNames.STL = "STL";
    this.columnDisplayNames.AST = "AST";
    this.columnDisplayNames.OREB = "OREB";
    this.columnDisplayNames.DREB = "DREB";
    this.columnDisplayNames.TREB = "TREB";
    this.columnDisplayNames.PF = "PF";
    this.columnDisplayNames.TF = "TF";
    this.columnDisplayNames.TO = "TO";
    this.columnDisplayNames.season = this.title;
    const players: any[] = this.seasonStats
      .map((p) => {
        return {
          GP: p.GP,
          MIN: p.stats.min,
          FGM: p.shooting.fgm + "/" + p.shooting.fga,
          FGPCT: (p.shooting.fgp % 1 != 0 && p.shooting.fgp) ? p.shooting.fgp.toFixed(2) : p.shooting.fgp,
          FGM3: p.shooting.fgm3 + "/" + p.shooting.fga3,
          FG3PCT: (p.shooting.fg3p % 1 != 0) ? p.shooting.fg3p.toFixed(2) : p.shooting.fg3p,
          FTM: p.shooting.ftm + "/" + p.shooting.fta,
          FTPCT: (p.stats.ftp % 1 != 0) ? p.stats.ftp.toFixed(2) : p.stats.ftp,
          TP: p.stats.tp,
          BLK: p.block.blk,
          STL: p.steal.stl,
          AST: p.assist.ast,
          OREB: p.rebound.oreb,
          DREB: p.rebound.dreb,
          TREB: p.rebound.treb,
          PF: p.stats.pf,
          TF: p.stats.tf,
          TO: p.special.ptsTO,
          season: p.season,
        };
      }).sort((a, b) => a.season - b.season);;
    const totalCol = {
      GP: this.careerStats[0].GP,
      MIN: this.careerStats[0].stats.min,
      FGM: this.careerStats[0].shooting.fgm + "/" + this.careerStats[0].shooting.fga,
      FGPCT: (this.careerStats[0].shooting.fgp % 1 != 0 && this.careerStats[0].shooting.fgp) ? this.careerStats[0].shooting.fgp.toFixed(2) : this.careerStats[0].shooting.fgp,
      FGM3: this.careerStats[0].shooting.fgm3 + "/" + this.careerStats[0].shooting.fga3,
      FG3PCT: (this.careerStats[0].shooting.fg3p % 1 != 0) ? this.careerStats[0].shooting.fg3p.toFixed(2) : this.careerStats[0].shooting.fg3p,
      FTM: this.careerStats[0].shooting.ftm + "/" + this.careerStats[0].shooting.fta,
      FTPCT: (this.careerStats[0].stats.ftp % 1 != 0) ? this.careerStats[0].stats.ftp.toFixed(2) : this.careerStats[0].stats.ftp,
      TP: this.careerStats[0].stats.tp,
      BLK: this.careerStats[0].block.blk,
      STL: this.careerStats[0].steal.stl,
      AST: this.careerStats[0].assist.ast,
      OREB: this.careerStats[0].rebound.oreb,
      DREB: this.careerStats[0].rebound.dreb,
      TREB: this.careerStats[0].rebound.treb,
      PF: this.careerStats[0].stats.pf,
      TF: this.careerStats[0].stats.tf,
      TO: this.careerStats[0].special.ptsTO,
      season: "TOTAL",
    };
    players.push(totalCol)
    this.dataSource = new PlayerAggBaseketballDataSource(players, this.sort);
  }
}

export class PlayerAggBaseketballDataSource extends DataSource<any> {
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
    return realData;
  }
}
