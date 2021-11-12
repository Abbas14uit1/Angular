import { Component,  Input, OnInit } from "@angular/core";

@Component({
  selector: "app-team-stats",
  templateUrl: "./team-stats.component.html",
  styleUrls: ["./team-stats.component.css"],
})
export class TeamStatsComponent implements OnInit {
  @Input() public sportId: string;
  constructor() {
  //
  }
  public ngOnInit() {
  //
  }
}
