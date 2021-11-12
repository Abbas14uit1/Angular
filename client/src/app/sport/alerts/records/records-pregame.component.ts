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

@Component({
  selector: "app-records-pregame",
  templateUrl: "./records-pregame.component.html",
  styleUrls: ["./records-pregame.component.css"],
})
export class RecordsPregameComponent implements OnInit {

  @Input() public alerts: any;
  @Input() public teamColor: any;
  @Input() public teamCode: any;
  @Input() public entity: any;
  public dataSource: any | null;
  public filteredObject: any= {};
  public filteredColumns: any= [];
  public displayedColumns = ["_id","playerName","statType","statPeriod","recordType","threshold","statValue","position","tiedPlayerName","nextStatValue","nextPosition"];
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
  public startEdit(playersData: any, statType:string, statPeriod: string) {
    const dialogRef = this.dialog.open(PlayersDialogComponent, {
      data: {
        title: statType+ " in a " + statPeriod, teamColor: this.teamColor, teamCode: this.teamCode, records: playersData
      }
    });
  }

  public onFilterClick(f: NgForm){
     if (!this.dataSource) { return; }
     let columnName = Object.keys(f.form.value)[0];
     let columnVal = f.form.value[columnName];
     this.filteredObject= {...this.filteredObject, ...f.form.value };
     if(!(columnVal && this.filteredObject[columnName]))
     {       
        delete this.filteredObject[columnName];
     }
     this.filteredColumns = Object.keys(this.filteredObject)
     this.dataSource.filter = JSON.stringify(this.filteredObject);
  }
  public onFilterClearClick(f: NgForm){
    if (!this.dataSource) { return; }
     let columnName = Object.keys(f.form.value)[0];
     let columnVal = f.form.value[columnName];
     if(!(columnVal && this.filteredObject[columnName]))
     {       
        delete this.filteredObject[columnName];
     }
     this.filteredColumns = Object.keys(this.filteredObject);
     this.filteredColumns = Object.keys(this.filteredObject)
     this.dataSource.filter = JSON.stringify(this.filteredObject);
     f.form.reset();
  }
  public hightLightFilter(col:string){
    if(this.filteredColumns.length<= 0) return "#fff";
    if(this.filteredColumns.includes(col))
      return "#616161";
    else return "#fff";
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
         let exists=true; 
         let filteredObject = JSON.parse(this.filter);
         for(let key of Object.keys(filteredObject)) { 
            const filterText = filteredObject[key].toLowerCase().trim();             
            exists= this.applyFilterOnObject(filterText,item,key);
            if(exists){
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

    public applyFilterOnObject(filterText:string,item: any,key: string): boolean{
    if(!item[key]){
      return false;
    }
     return item[key].toString().toLowerCase().indexOf(filterText) >= 0;   
  }
}
