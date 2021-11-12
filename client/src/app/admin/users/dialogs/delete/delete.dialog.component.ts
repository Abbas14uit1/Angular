import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { AdminService } from "../../../admin.service";

@Component({
  selector: "app-delete.dialog",
  templateUrl: "../../dialogs/delete/delete.dialog.html",
  styleUrls: ["../../dialogs/delete/delete.dialog.css"],
  providers: [AdminService],
})
export class DeleteDialogComponent {

  constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dataService: AdminService) { }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmDelete(): void {
    this.dataService.deleteUser(this.data.id)
      .subscribe((results) => {
        return results;
      }, (err) => {
        console.log(err);
      });
  }
}
