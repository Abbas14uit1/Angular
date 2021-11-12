import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { AdminService } from "../../../admin.service";

@Component({
  selector: "app-edit-player.dialog",
  templateUrl: "../../dialogs/edit/edit-player.dialog.html",
  styleUrls: ["../../dialogs/edit/edit-player.dialog.css"],
  providers: [AdminService],
})
export class EditPlayerDialogComponent {
  public selectedPos: string = "DPOS";
  public playerClass = [ "FR", "SO" , "JR" , "SR"];
  public MFBPos: any = [{ "value": "opos", "name": "C" },
    { "value": "opos", "name": "OG" },
    { "value": "opos", "name": "OT" },
    { "value": "opos", "name": "QB" },
    { "value": "opos", "name": "HB" },
    { "value": "opos", "name": "FB" },
    { "value": "opos", "name": "WR" },
    { "value": "opos", "name": "TE" },
    { "value": "opos", "name": "DT" },
    { "value": "opos", "name": "DE" },
    { "value": "opos", "name": "LB" },
    { "value": "opos", "name": "MLB" },
    { "value": "opos", "name": "OLB" },
    { "value": "opos", "name": "DB" },
    { "value": "opos", "name": "CB" },
    { "value": "opos", "name": "S" },
    { "value": "opos", "name": "Nickelback" },
    { "value": "opos", "name": "Dimeback" },
    { "value": "opos", "name": "K" },
    { "value": "opos", "name": "H" },
    { "value": "opos", "name": "LS" },
    { "value": "opos", "name": "P" },
    { "value": "opos", "name": "KOS" },
    { "value": "opos", "name": "KR" },
    { "value": "opos", "name": "PR" },
    { "value": "opos", "name": "Upback" },
    { "value": "opos", "name": "Gunner" },
    { "value": "opos", "name":"Jammer"}];
  public MBBPos: any = [
    "*",
    "g",
    "f",
    "c"
  ];
  constructor(public dialogRef: MatDialogRef<EditPlayerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
    public adminService: AdminService) {
       
  }  
  public submit() {
    // emppty stuff
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }
  public stopEdit(): void {

    let playerGames = [];
    if (this.data.playerStats) {
      let playerClass = this.data.classValue;
      let playerPos = this.data.sportCode == "MFB" ? this.MFBPos : this.MBBPos;
      if (this.data.sportCode == "MFB") {
        playerGames = this.data.playerStats.map(function (game: any) {
          game["playerClass"] = playerClass;
          if (game["position"]) {
            let pos = playerPos.filter((e: any) => { return e["name"] == game["position"] });
            if (pos[0].value === "opos") {
              game.pos.opos = pos[0].name.replace("Offence-", "");
            }
            else {
              game.pos.dpos = pos[0].name.replace("Defence-", "");
            }
          }
          delete game.position;
          return game;
        });
      }
      else {
        playerGames = this.data.playerStats.map(function (game: any) {
          game["playerClass"] = playerClass;
          return game;
        });
      }
      
    }
    // tslint:disable-next-line:max-line-length
    this.adminService
      .updatePlayer(this.data.playerId, this.data.name, JSON.stringify(playerGames))
      .subscribe((results) => {
        return results;
      }, (err) => {
        console.log(err);
      });
  }
}
