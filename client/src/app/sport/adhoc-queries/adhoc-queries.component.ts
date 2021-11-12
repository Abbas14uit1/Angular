import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatSort,
} from "@angular/material";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { HeaderConfig } from "../../shared/header/header.component";
import { TeamColors } from "../../shared/team-colors";
import { AdhocQueryService } from "app/sport/adhoc-queries/adhoc-query.service";
import { AdhocResultsDialogComponent } from "./adhoc-results.dialog.component";

@Component({
  selector: "adhoc-queries",
  templateUrl: "./adhoc-queries.component.html",
  styleUrls: ["./adhoc-queries.component.css"],
  providers: [AdhocQueryService],
})
export class AdhocQueriesComponent implements OnInit {
  public shared: TeamColors = new TeamColors();
  public headerConfig = HeaderConfig;
  public teamColors: any;
  public adhocQueriesList: any[] = [];
  public adhocFilteredQueriesList: any[] = [];
  public adhocQueryData: any[] = [];
  public spinner: boolean = false;
  public sportId: any;
  public teamId: any;
  public searchTerm: any;
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private adhocQueryService: AdhocQueryService
  ) {
    this.teamColors = this.shared.teamColors;
    this.sportId = localStorage.getItem("selectedSport");
    this.teamId = localStorage.getItem("selectedTeam");
  }

  public ngOnInit() {
    this.getAllAhocqueries();
  }
  public getAllAhocqueries() {
    this.spinner = true;
    this.adhocQueriesList = [];
    this.adhocFilteredQueriesList = [];
    this.adhocQueryService.getAllAhocqueries(this.sportId).subscribe(
      (results: any) => {
        this.adhocQueriesList = results;
        this.adhocFilteredQueriesList = results;
        this.spinner = false;
      },
      (err) => null
    );
  }
  searchTermEnterKey() {
    this.adhocFilteredQueriesList = this.adhocQueriesList.filter(
      (x) => x.queryDescription.indexOf(this.searchTerm) >= 0
    );
  }

  public getAdhocData(query: any) {
    this.adhocQueryData = [];
    let inputFields: any[] = query["inputFields"].map((x: any) => {
      if (x.allowedStatsValue) {
        return {
          fieldName: x.fieldName,
          fieldValue: x.fieldValue,
          allowedStatsName: x.allowedStatsName,
          allowedStatsValue: x.allowedStatsValue,
        };
      }
      return { fieldName: x.fieldName, fieldValue: x.fieldValue };
    });
    this.adhocQueryService
      .getAdhocQueryResults(query._id, JSON.stringify(inputFields))
      .subscribe(
        (results: any) => {
          this.adhocQueryData = results;
          this.spinner = false;
          const dialogRef = this.dialog.open(AdhocResultsDialogComponent, {
            width: "70%",
            data: {
              title: "Results",
              records: this.adhocQueryData,
              teamColor: this.teamColors[this.teamId],
            },
          });
        },
        (err) => null
      );
  }
  getAllowedStats(fieldValue: string, fieldData: any[]) {
    return fieldData.filter((x) => x.name == fieldValue)[0]["allowedStats"];
  }
}
