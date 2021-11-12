import { DataSource } from "@angular/cdk/collections";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort } from "@angular/material";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import "rxjs/add/observable/of";
import { Observable } from "rxjs/Observable";
import { AdminService } from "../admin.service";
import { EditPlayerDialogComponent } from "./dialogs/edit/edit-player.dialog.component";
import { QueryService } from "../../sport/query/query.service";
import { TeamColors } from "../../shared/team-colors";

@Component({
  selector: "app-players",
  templateUrl: "./players.component.html",
  styleUrls: ["./players.component.css"],
  providers: [AdminService, QueryService],
})
export class PlayersComponent implements OnInit {

  public dataSource: any | null;
  public shared: TeamColors = new TeamColors();
  public displayedColumns = ["name", "class", "uniform", "position", "_id"];
  public players: any[] = [];
  public selectedSeason: any;
  public selectedTeamCode: any;
  public message: string = "No results found";
  public spinner: boolean = false; 
  public sports = [{ value: "MFB", name: "Football" },
  { value: "MBB", name: "Men’s Basketball" },
  { value: "WBB", name: "Women’s Basketball" },
  { value: "MBA", name: "Baseball" },
  { value: "WSB", name: "Softball" }];
  public selectedTeam: any;
  public selectedSport: any;
  public selectedTeamName: any;
  public seasons: any[];
  public teams: any[] = [];
  public teamColors: any;
  public playerStats: any;
  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild("filter") public filter: ElementRef;

  constructor(public dialog: MatDialog, public adminService: AdminService, private queryService: QueryService,  private router: Router) { }

  public ngOnInit() {
    this.teamColors = this.shared.teamColors;
    this.queryService.getAllTeams()
      .subscribe((teams: any) => {
        this.teams = teams.filter((item: any) => {
          return item.code === 8 || item.code === 697 || item.code === 703 || item.code === 559;
        });        
      });
    Observable.fromEvent(this.filter.nativeElement, "keyup")
      .filter((k: any) => k.which === 13 || k.currentTarget.value.length === 0)
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  public getPlayers() {
    this.adminService.getPlayers(this.selectedTeam, this.selectedSport, this.selectedSeason)
      .subscribe(
      (players) => {
        this.spinner = false;
        this.players = players;       
      },
        (err) => console.log(err),
      () => {
          this.spinner = false;
          this.dataSource = new PlayerDataSource(this.players, this.sort);
        },
      );
  }

  public getSeasons() {
    this.adminService.getSeasons(this.selectedTeam, this.selectedSport)
      .subscribe(
      (seasons) => {
        this.seasons = seasons;
        if (seasons.length > 0) {
          this.selectedSeason = this.seasons[0].season;
          this.getPlayers(); 
        }
      },
        (err) => console.log(err)
      );
  }
  public onTeamChange(teamVal: any, teamSelect: any) {
    this.dataSource = null;
    this.spinner = true;
    this.selectedTeam = teamVal;
    this.selectedTeamName = teamSelect.selected.getLabel(teamVal);
    let selectedTeams = this.teams.filter(function (team) {
      return team._id == teamVal;
    });
    this.selectedTeamCode = selectedTeams[0].code;
    this.getSeasons();   
  }
  public onSportChange(sport: any) {
    this.dataSource = null;
    this.spinner = true;
    this.selectedSport = sport;
    this.getSeasons();    
  }

  public onSeasonChange(newValue: any) {
    this.dataSource = null;
    this.spinner = true;
    this.selectedSeason = newValue;
    this.getPlayers();
  }

  public getPlayerStats(playerId: string, name: string, classValue: string, position: string, uniform: string) {
    this.spinner = true;
     this.adminService
      .getPlayerStats(playerId)
      .subscribe((results) => {
        if (results.sportCode === "MFB") {
          let gameStats = results["games"].map(function (game: any) {
            game.pos.opos = game.pos.opos === "RT" || game.pos.opos === "LT" || game.pos.opos === "LB" ? "Offence-" + game.pos.opos : game.pos.opos;
            game.pos.dpos = game.pos.dpos === "RT" || game.pos.dpos === "LT" || game.pos.dpos === "LB"  ? "Defence-" + game.pos.dpos : game.pos.dpos;
            game["position"] = game.pos.opos ? game.pos.opos : game.pos.dpos ;
            return game;
          });
          this.playerStats = gameStats;
        }
        else {
          this.playerStats = results["games"];
        }
        this.spinner = false;
        const dialogRef = this.dialog.open(EditPlayerDialogComponent, {
          data: { playerId, name, classValue, position, uniform, teamCode: this.selectedTeamCode, sportCode: results.sportCode, playerStats: this.playerStats },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 1) {
            this.getPlayers();
          }
        });
       }, (err) => {
         this.spinner = false;
        console.log(err);
      });
  }
  // tslint:disable-next-line:max-line-length
  public startEdit(id: string, name: string, classValue: string, position: string, uniform: string) {
    this.getPlayerStats(id,name,classValue,position,uniform);
  } 

}
export class PlayerDataSource extends DataSource<any> {
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

      switch (this.sort.active) {
        case "name": [propertyA, propertyB] = [a.name, b.name]; break;
        case "uniform": [propertyA, propertyB] = [a.uniform, b.uniform]; break;
        case "position": [propertyA, propertyB] = [this.positionMap(a.position), this.positionMap(b.position)]; break;
        case "class": [propertyA, propertyB] = [a.class, b.class]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === "asc" ? 1 : -1);
    });
  }
  private positionMap(position: string | null) {
    return position ? position : "N/A";
  }  
}
