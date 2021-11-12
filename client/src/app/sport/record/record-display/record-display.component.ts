import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-record-display",
  templateUrl: "./record-display.component.html",
  styleUrls: ["./record-display.component.css"],
})
export class RecordDisplayComponent implements OnInit, OnChanges {

  @Input() public data: any;
  @Input() public teamColor: any;
  public dataSource: RecordDataSource;
  public displayedColumns: string[] = [];
  public resultField: string = "results";

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(private router: Router) { }
  public ngOnInit() {
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
  public ngOnChanges(changes: SimpleChanges) {
    if (this.data[this.resultField] !== undefined) {
      this.dataSource = new RecordDataSource(this.data[this.resultField], this.sort);
      const singledata = this.data[this.resultField][0];
      this.displayedColumns = Object.keys(singledata);
    } else {
      this.displayedColumns = [];
    }
  }
}
export class RecordDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  private filteredData: any[] = [];
  private renderedData: any[] = [];
  constructor(private data: any[], private sort: MatSort) {
    super();
  }
  public connect(): Observable<any[]> {
    const displayDataChanges = [
      this.sort.sortChange,
      this.filterChange,
    ];
    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this.filteredData = this.data.slice().filter((item: any) => {
        if (this.filter !== null && this.filter !== "") {
          const filterText = this.filter.toLowerCase();
          const exists = Object.keys(item).some((k: any) => {
            return item[k].toLocaleString().toLowerCase().indexOf(filterText) >= 0;
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
      const propertyA: number | string = "";
      const propertyB: number | string = "";
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
}
