import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-players-detail.dialog",
  templateUrl: "./players.detail.dialog.html",
  styleUrls: ["./players.detail.dialog.css"],
})
export class PlayersDetailDialogComponent {
  public displayedColumns: string[] = []; 
  public records: any;
  constructor(public dialogRef: MatDialogRef<PlayersDetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
      //console.log("data>>>"+JSON.stringify(data["records"].stories.LastTimeWhen[0].storyDetails.mostRecentOccurence));
        if(data["records"]){
          this.records = data["records"]; 
        }       
  }  
  public submit() {
    // emppty stuff
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }


}
