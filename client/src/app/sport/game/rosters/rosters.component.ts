import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-rosters",
  templateUrl: "./rosters.component.html",
  styleUrls: ["./rosters.component.css"],
})
export class RostersComponent implements OnInit {

  @Input() public gameId: string;
  @Input() public homeTeamId: string;
  @Input() public awayTeamId: string;
  @Input() public homeTeamName: string;
  @Input() public awayTeamName: string;
  @Input() public sportId: any;
  public selectedRoster = "home";
  constructor() {
  //
  }
  public ngOnInit() {
  //
  }
}
