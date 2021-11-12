import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-scoring-summary",
  templateUrl: "./scoring-summary.component.html",
  styleUrls: ["./scoring-summary.component.css"],
})
export class ScoringSummaryComponent implements OnInit {
  @Input() public sportId: string;
  constructor() {
  //
  }
  public ngOnInit() {
  //
  }
}
