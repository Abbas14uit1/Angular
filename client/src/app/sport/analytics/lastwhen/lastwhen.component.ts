import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";

@Component({
  selector: "app-lastwhen",
  templateUrl: "./lastwhen.component.html",
  styleUrls: ["./lastwhen.component.css"],
})
export class LastwhenComponent implements OnInit {

  public records: any = [
    {"_id":"5cc1bf7d24865a40c7ced3bd","name":"ADAMS,CONNOR","opp": "Clemson","statValue":"386","endDate": "12/3/2016","season":2016,"game":10},
    {"_id":"5cc1bf7e24865a40c7ced3c2","name":"ADKISON,DALTON","opp": "Mississippi St.","statValue":"337","endDate": "12/3/2016","season":2016,"game":15},
    {"_id":"5cc1bf7c24865a40c7ced3af","name":"ALLEN,CHRISTOPHER","opp": "North Texas","statValue":"44","endDate": "12/3/2016","season":2016,"game":5},
    {"_id":"5cc1bf7b24865a40c7ced39a","name":"AMOS,GILES","opp": "Ole Miss","statValue":"440","endDate": "12/3/2016","season":2016,"game":20},
    {"_id":"5c07b14f52952410a9fd130f","name":"ANDERSON,KEATON","opp": "Florida","statValue":"431","endDate": "12/3/2016","season":2016,"game":25}
  ];
  @Input() public teamColor: any;
  @Input() public teamCode: any;
  public dataSource: any | null;
  public displayedColumns = ["_id", "name","endDate","opp", "statValue","game"];
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(public dialog: MatDialog,private router: Router) { }

  public ngOnInit() {
    this.dataSource = new RecordsDataSource(this.records, this.sort);
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .filter((k: any) => k.which === 13 || k.currentTarget.value.length === 0)
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
}
export class RecordsDataSource extends DataSource<any> {
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
      [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
}

