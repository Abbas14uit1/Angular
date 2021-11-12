import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";
import { PlayersDialogComponent } from "./players.dialog.component";
import { PlayersDetailDialogComponent } from "./players.detail.dialog.component";
import { InnerComponent } from "./inner.component";

@Component({
  selector: "app-records-postgame",
  templateUrl: "./records-postgame.component.html",
  styleUrls: ["./records-postgame.component.css"],
})
export class RecordsPostgameComponent implements OnInit {

  @Input() public alerts: any;
  @Input() public teamColor: any;
  @Input() public teamCode: any;
  @Input() public entity: any;
  public filteredObject: any = {};
  public filteredColumns: any = [];
  public dataSource: any | null;
  public Record: string = "Record";
  public Lasttimewhen: string = "Lasttimewhen";
  public Streak: string = "Streak";

  public displayedColumns = ["_id", "PlayerName", "statType", "statPeriod", "alertType", "statValue", "position", "nextStatValue", "nextPosition", "socialmedia"];
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(public dialog: MatDialog, private router: Router) { }

  public ngOnInit() {
    this.dataSource = new RecordsDataSource(this.alerts, this.sort);
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .filter((k: any) => k.which === 13 || k.currentTarget.value.length === 0)
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
  /*public startEdit(playersData: any,statType:string, statPeriod: string) {
    const dialogRef = this.dialog.open(PlayersDialogComponent, {
      data: {
        title:statType+ " in a " + statPeriod,teamColor:this.teamColor, teamCode: this.teamCode, records: playersData
      }
    });
  }*/
  public showPlayerDetail(playersData: any) {
    const dialogRef = this.dialog.open(PlayersDetailDialogComponent, {
      data: {
        teamColor: this.teamColor, teamCode: this.teamCode, records: playersData
      }
    });
  }
  public onFilterClick(f: NgForm) {
    if (!this.dataSource) { return; }
    let columnName = Object.keys(f.form.value)[0];
    let columnVal = f.form.value[columnName];
    this.filteredObject = { ...this.filteredObject, ...f.form.value };
    if (!(columnVal && this.filteredObject[columnName])) {
      delete this.filteredObject[columnName];
    }
    this.filteredColumns = Object.keys(this.filteredObject)
    this.dataSource.filter = JSON.stringify(this.filteredObject);
  }
  public onFilterClearClick(f: NgForm) {
    if (!this.dataSource) { return; }
    let columnName = Object.keys(f.form.value)[0];
    let columnVal = f.form.value[columnName];
    if (!(columnVal && this.filteredObject[columnName])) {
      delete this.filteredObject[columnName];
    }
    this.filteredColumns = Object.keys(this.filteredObject);
    this.filteredColumns = Object.keys(this.filteredObject)
    this.dataSource.filter = JSON.stringify(this.filteredObject);
    f.form.reset();
  }
  public hightLightFilter(col: string) {
    if (this.filteredColumns.length <= 0) return "#fff";
    if (this.filteredColumns.includes(col))
      return "#616161";
    else return "#fff";
  }

  public CopyStory(alert: any, index: any) {
    let textToCopy = "";
    if (alert.stories.Records) {
      textToCopy = alert.stories.Records[0].storySentence.replace("{{", "").replace("}}", "");
    }
    if (alert.stories.LastTimeWhen) {
      textToCopy = textToCopy + "\n" + alert.stories.LastTimeWhen[0].storySentence.replace("{{", "").replace("}}", "");
    }


    let el = document.getElementById(alert._id);
    let body = document.body, range: any, sel: any;
    let doc = document;
    let documentBody = <any>doc.body;
    if (document.createRange && window.getSelection && el) {
      range = document.createRange();
      sel = window.getSelection();
      sel.toString().replace("Watch", "");
      sel.removeAllRanges();
      try {
        range.selectNode(el);
        sel.addRange(range);
      } catch (e) {
        range.selectNode(el);
        sel.addRange(range);
      }
      document.execCommand("copy");
    }

    //let result = this.copyTextToClipboard(textToCopy); 
  }

  public copyTextToClipboard(text: any) {
    var txtArea = document.createElement("textarea");
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = text;
    document.body.appendChild(txtArea);
    txtArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      if (successful) {
        return true;
      }
    } catch (err) {
      console.log('Oops, unable to copy');
    } finally {
      document.body.removeChild(txtArea);
    }
    return false;
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
        if (this.filter !== null && this.filter !== "" && this.filter !== "{}") {
          let exists = true;
          let filteredObject = JSON.parse(this.filter);
          for (let key of Object.keys(filteredObject)) {
            const filterText = filteredObject[key].toLowerCase().trim();
            exists = this.applyFilterOnObject(filterText, item, key);
            if (exists) {
              continue;
            }
            else {
              break;
            }
          }
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
  public applyFilterOnObject(filterText: string, item: any, key: string): boolean {
    if (!item[key]) {
      return false;
    }
    return item[key].toString().toLowerCase().indexOf(filterText) >= 0;
  }
}
