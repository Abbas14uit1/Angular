import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatSort, MatMenuTrigger } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";
@Component({
  selector: "app-player-games-table",
  templateUrl: "./player-games-table.component.html",
  styleUrls: ["./player-games-table.component.css", "./player-games.component.css"],
})
export class PlayerGamesTableComponent implements OnInit {
  @Input() public sportId: any;
  @Input() public teamCode: any;
  @Input() public teamColor: any;
  @Input() public title:any;
  @Input() public columnGroups: {
    [key: string]: any[];
  }
  @Input() public displayedColumnsWithSeason: {
    [key: string]: string[];
  };
  @Input() public columnDisplayNames: {
    [key: string]: string;
  };
  @Input() public displayedColumns: {
    [key: string]: string[];
  };
  @Input() public results: any[] = [];
  public filteredObject: any = {};
  public filteredColumns: any = [];
  public shared: TeamColors = new TeamColors(); 
  public dataSource: any;
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;
  public teamColors: any;
  constructor(public router: Router) {
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {
    this.dataSource = new PlayerGamesTableDataSource(this.results, this.sort, this.displayedColumns);
  }
  
 
  public onClick(id: string) {
    localStorage.setItem(
      "headerTitle",
      "Game Dashboard -" + localStorage.getItem("sportText"),
    );
    this.router.navigate(["/game", this.sportId, id]);
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

  setDefaultPic(event:any){
    event.target.src = '../../../assets/images/teams/LOGO_NF_003.png';
  }
}

export class PlayerGamesTableDataSource extends DataSource<any> {
  private filterChange = new BehaviorSubject("");
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  private filteredData: any[] = [];
  private renderedData: any[] = [];

  constructor(private data: any[], private sort: MatSort, private displayedColumns: any) {
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

  public disconnect() {
    return;
  }

  public applyFilterOnObject(filterText: string, item: any, key: string): boolean {
    if (!item[key]) {
      return false;
    }
    switch (key) {      
      case "date":
        const itemDate = new Date(item[key]).getDate() + "-" + new Date(item[key]).getMonth();
        const filterDate = new Date(filterText).getDate() + "-" + new Date(filterText).getMonth();
        return itemDate === filterDate;
      default:
        return item[key].toString().toLowerCase().indexOf(filterText) >= 0;
    }
  }

  public sortData(data: any[]): any[] {
    if (!this.sort.active || this.sort.direction === "") {
       return data.sort((a, b) => {
          let propertyA: number | string = "";
          let propertyB: number | string = "";      
          [propertyA, propertyB] = [new Date(a["date"]).getTime(), new Date(b["date"]).getTime()];            
          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
          return (valueA < valueB ? -1 : 1) * 1 ;
       });
    }
    return data.sort((a, b) => {
      let propertyA: number | string = "";
      let propertyB: number | string = "";
      if(this.sort.active == "date"){
         [propertyA, propertyB] = [new Date(a["date"]).getTime(), new Date(b["date"]).getTime()];
      }
      else{
        [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];
        }      
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
}
