import {Component, Inject} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import { AdminService } from "../../../admin.service";
import {User} from "../../models/user";

@Component({
  selector: "app-add.dialog",
  templateUrl: "../../dialogs/add/add.dialog.html",
  styleUrls: ["../../dialogs/add/add.dialog.css"],
  providers: [AdminService],
})

export class AddDialogComponent {
  public response: any;
  constructor(public dialogRef: MatDialogRef<AddDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: User,
              public dataService: AdminService) { }
  public submit() {
  // emppty stuff
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {

    this.dataService
    .addUser(this.data.username, this.data.password, this.data.admin, this.data.email, this.data.superAdmin, this.data.confName)
        .subscribe((results) => {
         return results;
        }, (err) => {
        console.log( err );
        });
  }
}
