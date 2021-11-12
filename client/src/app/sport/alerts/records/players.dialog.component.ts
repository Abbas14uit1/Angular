import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-players.dialog",
  templateUrl: "./players.dialog.html",
  styleUrls: ["./players.dialog.css"],
})
export class PlayersDialogComponent {
  public displayedColumns: string[] = [];
  public records: any[] = [];
  constructor(public dialogRef: MatDialogRef<PlayersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data["records"].length > 0) {
      this.records = data["records"].sort((a: any, b: any) => a["Rank"] < b["Rank"] ? -1 : a["Rank"] > b["Rank"] ? 1 : 1);
      this.displayedColumns = Object.keys(data["records"][0]);
      //console.log(JSON.stringify(this.displayedColumns));
      this.displayedColumns = this.displayedColumns.filter(e => e !== 'playerId');
      this.displayedColumns = this.displayedColumns.filter(e => e !== 'gameDate');
      this.displayedColumns = this.displayedColumns.filter(e => e !== 'opponentCode');
      this.displayedColumns = this.displayedColumns.filter(e => e !== 'activeStreak');
    }
  }
  public ngOnInit() {
    this.records.sort(this.sortByProperty("rank"))
    this.records.sort(this.sortByProperty("streakRank"))
  }
  public sortByProperty(property: any) {
    return function (a: any, b: any) {
      if (a[property] > b[property])
        return 1;
      else if (a[property] < b[property])
        return -1;

      return 0;
    }
  }
  public submit() {
    // emppty stuff
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }


}
