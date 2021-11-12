import { Component, Input, OnInit } from "@angular/core";
// tslint:disable-next-line:max-line-length
import { IBasketBallTeamStats, IGameBasketBallScoring } from "../../../../../../../typings/athlyte/football/game/game.d";
import { TeamColors } from "../../../../shared/team-colors";
import { GameService } from "../../game.service";

@Component({
  selector: "app-summary-basketball",
  templateUrl: "./summary-basketball.component.html",
  styleUrls: ["./summary-basketball.component.css"],
  providers: [GameService],
})
export class SummaryBasketballComponent implements OnInit {

  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public gameId: any;
  @Input() public sportId: any;
  public teamColors: any;
  public shared: TeamColors = new TeamColors();
  public overallTeamStats: any[];
  public scoringPlays: any[];
  public awayTeamStats: any[];
  public homeTeamStatus: any[];
  public homeTeamLength: number;
  public awayTeamLength: number;
  public awayShootingLength: number;
  public homeShootingLength: number;
  public homeShootingData: any[];
  public awayShootingData: any[];
  public awayShootingBenchLength: number;
  public homeShootingBenchLength: number;
  public homeShootingBenchData: any[];
  public awayShootingBenchData: any[];
  public awayOtherBenchLength: number;
  public homeOtherBenchLength: number;
  public homeOtherBenchData: any[];
  public awayOtherBenchData: any[];  
  public awayOtherLength: number;
  public homeOtherLength: number;
  public homeOtherData: any[];
  public awayOtherData: any[];
 

  constructor(private gameService: GameService) {
    this.teamColors = this.shared.teamColors;
  }
  public ngOnInit() {

    this.gameService.getBasketBallScoringPlays(this.gameId, this.sportId)
      .subscribe(
      (scoringPlays) => this.scoringPlays = scoringPlays,
      (err) => console.log(err),
    );

    this.gameService.getOverallBasketBallTeamStats(this.gameId, this.sportId)
      .subscribe((teamstats) => {
        this.overallTeamStats = teamstats;
      },
      (err) => null,
    );
    this.gameService.getBasketBallShootings(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerShootings) => {
        this.awayShootingData = playerShootings.filter((y) => y.started === true);
        this.awayShootingBenchData = playerShootings.filter((y) => y.started === false);
      },
      (err) => null,
      () =>{
       this.awayShootingLength = this.awayShootingData.length;
       this.awayShootingBenchLength = this.awayShootingBenchData.length;
       },
    );
    this.gameService.getBasketBallShootings(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerShootings) => {
        this.homeShootingData = playerShootings.filter((y) => y.started === true);
        this.homeShootingBenchData = playerShootings.filter((y) => y.started === false);
      },
      (err) => null,
      () =>{
       this.homeShootingLength = this.homeShootingData.length;
       this.homeShootingBenchLength = this.homeShootingBenchData.length;
      },
    );
    this.gameService.getBasketBallOther(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerOther) => {
        this.homeOtherData = playerOther.filter((y) => y.started === true);
        this.homeOtherBenchData = playerOther.filter((y) => y.started === false);
      },
      (err) => null,
      () => {
        this.homeOtherLength = this.homeOtherData.length;
        this.homeOtherBenchLength = this.homeOtherBenchData.length;
      },
    );
    this.gameService.getBasketBallOther(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerOther) => {
        this.awayOtherData = playerOther.filter((y) => y.started === true);
        this.awayOtherBenchData = playerOther.filter((y) => y.started === false);
      },
      (err) => null,
      () => {
        this.awayOtherLength = this.awayOtherData.length;
        this.awayOtherBenchLength = this.awayOtherBenchData.length;
      },
    );
  }
}
