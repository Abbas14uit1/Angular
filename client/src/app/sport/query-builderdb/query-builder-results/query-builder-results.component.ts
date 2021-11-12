import { DataSource } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatSort, MatMenuTrigger } from "@angular/material";
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import * as XLSX from "xlsx";
import { GoogleAnalyticsEventsService } from "../../../services/google-analytics-events-service";

@Component({
  selector: "app-query-builder-results",
  templateUrl: "./query-builder-results.component.html",
  styleUrls: ["./query-builder-results.component.css"],
  providers: [DatePipe],
  encapsulation : ViewEncapsulation.None
})
export class QueryBuilderResultsComponent implements OnInit, OnChanges {
 
  @Input() public results: any[] = [];
  @Input() public teamColor: any;
  @Input() public QBTime: any;
  public dataSource: QueryDataSource;
  public displayedColumns: string[] = [];
  public clipboardCols: string[] = [];
  public filteredObject: any= {};
  public filteredColumns: any= [];
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;
  public selection = new SelectionModel<Element>(true, []);
  constructor(private datePipe: DatePipe, private router: Router, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) { }

  public ngOnInit() {
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .filter((k:any) => k.which  === 13 || k.currentTarget.value.length === 0)
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }
  public  masterToggle() {
       this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.filteredData.forEach(row =>
        { 
          this.selection.select(row);
        });
  }
  public ngOnChanges(changes: SimpleChanges) {
    if (this.results[0] !== undefined) {
      const oppCol:string= "OppCode";
      const selectCol:string = "select";
      const singledata = this.results[0];      
      this.displayedColumns = Object.keys(singledata); 
      this.displayedColumns.shift();
      this.displayedColumns.unshift("Id");
      this.displayedColumns.unshift(selectCol);
      this.clipboardCols = this.displayedColumns.filter(x => 
       {
         return (x != selectCol && x != oppCol);
       }
        );    
      this.dataSource = new QueryDataSource(this.results, this.sort, this.displayedColumns, this.googleAnalyticsEventsService);   
    }
  }  
  public playerNameReadability(name: string) {
    return name.toString().replace(/,/g, ",  ");
  }
  public valueReadability(num: any) {
    if(num % 1 != 0) return num.toFixed(2);
    return num;
  }

  public seasonReadability(num: any) {
    let updated_season = "";
    if (typeof num === 'string' && num.length > 7) {
      let season_arr = num.split(" -");
      let start_season_st = season_arr[0]; 
      let end_season_st = season_arr[1];
      let start_season_en = Number(season_arr[0]) + 1;
      let start_sea_en_str = start_season_en.toString();
      let end_season_en = Number(season_arr[1]) + 1;
      let end_sea_en_str = end_season_en.toString();
      updated_season = start_season_st + "-" + start_sea_en_str.substring(2,4) + " to " + end_season_st + "-" + end_sea_en_str.substring(2,4);
      return updated_season;
    }else if (typeof num === 'number') {
      let inc_season_by_one = (num +1).toString();
      let sea = inc_season_by_one.substring(2,4);
      updated_season = num.toString() + "-" + sea;
      return updated_season;
    }
    let arr = num.split("-");
    let st = Number(arr[0].substring(2,4));
    let en = Number(arr[1]);
    let sub = en-st;
    console.log("sub" + sub);
    if(arr[1] == "00" && arr[0] == "99"){
      return num;
    }
    else if(arr[1] =="00" && arr[0] != "99"){
      return (arr[0] + "-" + ((Number(arr[0])+1).toString()).substring(2,4) + " to " + arr[1] + "-01");
    }
    else if(sub != 1){
      let start = arr[0].substring(0,2) + arr[1];
      console.log("start" + start)
      let end = (Number(arr[1]) + 1).toString();
      if(end.length == 1){
        end = "0" + end;
      }
      console.log("end" + end);
      console.log(start + "-" + end);
      return arr[0] + "-" + ((Number(arr[0])+1).toString()).substring(2,4) + " to " + start + "-" + end;
    }

    return num;
  }

  public onFilterClick(f: NgForm){
    this.selection.clear();
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
    this.selection.clear();
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

  public  selectElementContents() {
    let el = document.getElementById("qBResTable");
    let body = document.body, range: any, sel: any;
    let doc = document;
    let documentBody = <any>doc.body;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
            this.googleAnalyticsEventsService.emitEvent("Clicked on QB Copy Button", "Data Copied", "ExportData", 4);
            document.execCommand("copy");

        } 
        else if (!documentBody.createTextRange) {
            range = documentBody.createTextRange();
            range.moveToElementText(el);
            range.select();
            range.execCommand("Copy");
        }    
  }
 
}

export class QueryDataSource extends DataSource<any> {

  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  public filteredData: any[] = [];
  private renderedData: any[] = [];  

  constructor(public data: any[], private sort: MatSort, private displayedColumns: any, public googleAnalyticsEventsService: GoogleAnalyticsEventsService) {
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

  public disconnect() {
    return;
  }

  public applyFilterOnObject(filterText:string,item: any,key: string): boolean{
    this.googleAnalyticsEventsService.emitEvent("Clicked on QB Filter Button", JSON.stringify({"Field Name":key,"Filter Text Searched":filterText}), "Data Filtered", 4);
    if(!item[key]){
      return false;
    }
    switch(key){
              case "Name" :
               return item[key].toString().toLowerCase().replace(/,/g, ", ").indexOf(filterText) >= 0;              
              case "GameDate" :
                const itemDate = new Date(item[key]).getDate() + "-" + new Date(item[key]).getMonth();
                const filterDate = new Date(filterText).getDate() + "-" + new Date(filterText).getMonth();
                return itemDate === filterDate;              
              default:
               return item[key].toString().toLowerCase().indexOf(filterText) >= 0;             
            }
  }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") {
      return data;
    }
    if(this.sort.active){
      this.googleAnalyticsEventsService.emitEvent("Clicked on QB Table Field Sorting", JSON.stringify({"Field Name":this.sort.active,"Field Sort Direction":this.sort.direction}), "Field Sorted", 4);
    }
    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";
      switch (this.sort.active) { 
        case "Date":
          [propertyA, propertyB] = [new Date(a["Date"]).getTime(), new Date(b["Date"]).getTime()];
          break;
        default:
          [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
      });
  }
}
