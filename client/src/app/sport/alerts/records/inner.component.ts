import { Component, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort } from "@angular/material";
import { PlayersDialogComponent } from "./players.dialog.component";

@Component({
  selector: 'inner-component',
  templateUrl: './inner.component.html',
  styleUrls: ['./inner.component.css']
})
export class InnerComponent {
  @Input() public inputData: any;
  @Input() public inputDataType: string = "";
  @Input() public teamCode: any;
  @Input() public teamColor: any;
  @Input() public index: any;
  @Input() public alertId: any;

  public textBefore: string = "";
  public textAfter: string = "";
  public playerName: string = "";
  public dynamicClassName: string = "";
  public buildId: string = "";
  public matTooltipTitle: string = "Copy Story";

  constructor(public dialog: MatDialog) { }

  public ngOnInit() {
    if (this.inputData.storySentence) {
      this.buildId = this.alertId + "" + this.index + "" + this.inputDataType;
      this.textBefore = this.inputData.storySentence.toString().split("{{")[0];
      this.textAfter = this.inputData.storySentence.toString().split("}}")[1];
      this.playerName = this.inputData.storySentence.toString().split("{{")[1].split("}}")[0];
    } else {
      this.textBefore = this.inputData.storySentence.toString();
    }

  }
  public CopyStory() {
    let el = document.getElementById(this.buildId);
    let body = document.body, range: any, sel: any;
    let doc = document;
    let documentBody = <any>doc.body;
    if (document.createRange && window.getSelection && el) {
      range = document.createRange();
      sel = window.getSelection();
      sel.toString().replace("Watch", "");
      sel.removeAllRanges();
      try {
        range.selectNode(el);
        sel.addRange(range);
      } catch (e) {
        range.selectNode(el);
        sel.addRange(range);
      }
      document.execCommand("copy");
    }
  }
  public startEdit(playersData: any, statType: string, statPeriod: string) {
    const dialogRef = this.dialog.open(PlayersDialogComponent, {
      data: {
        title: statType + " in a " + statPeriod, teamColor: this.teamColor, teamCode: this.teamCode, records: playersData
      }
    });
  }
}