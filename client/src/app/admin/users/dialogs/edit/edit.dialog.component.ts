import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { AdminService } from "../../../admin.service";

@Component({
  selector: "app-baza.dialog",
  templateUrl: "../../dialogs/edit/edit.dialog.html",
  styleUrls: ["../../dialogs/edit/edit.dialog.css"],
  providers: [AdminService],
})
export class EditDialogComponent {

  constructor(public dialogRef: MatDialogRef<EditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public adminService: AdminService) { }

  public submit() {
    // emppty stuff
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }
  public stopEdit(): void {
    // tslint:disable-next-line:max-line-length
    this.adminService
      .updateUser(this.data.id, this.data.username, this.data.password, this.data.admin, this.data.isActive, this.data.email, this.data.superAdmin, this.data.confName)
      .subscribe((results) => {
        return results;
      }, (err) => {
        console.log(err);
      });
  }
}
