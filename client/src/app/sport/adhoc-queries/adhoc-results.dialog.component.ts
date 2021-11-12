import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-adhoc-results.dialog",
  templateUrl: "./adhoc-results.dialog.html",
  styleUrls: ["./adhoc-results.dialog.css"],
})
export class AdhocResultsDialogComponent {
  public displayedColumns: string[] = [];
  public records: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<AdhocResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data["records"].length > 0) {
      this.records = data["records"];
      this.displayedColumns = Object.keys(this.records[0]);
    }
  }
  public submit() {
    // emppty stuff
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }
}
