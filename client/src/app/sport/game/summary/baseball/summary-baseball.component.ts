import { Component, Input, OnInit } from "@angular/core";
// tslint:disable-next-line:max-line-length
import { IBaseBallTeamStats, IGameBaseBallScoring, IPlayerHittingStats, IPlayerPitchingStats } from "../../../../../../../typings/athlyte/football/game/game.d";
import { TeamColors } from "../../../../shared/team-colors";
import { GameService } from "../../game.service";

@Component({
  selector: "app-summary-baseball",
  templateUrl: "./summary-baseball.component.html",
  styleUrls: ["./summary-baseball.component.css"],
  providers: [GameService],
})
export class SummaryBaseballComponent implements OnInit {

  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public gameId: any;
  @Input() public sportId: any;

  public teamColors: any;
  public shared: TeamColors = new TeamColors();

  public overallTeamStats: IBaseBallTeamStats[];
  public scoringPlays: IGameBaseBallScoring[];

  public homePitchingData: any[];
  public awayPitchingData: any[];
  public homeHittingData: any[];
  public awayHittingData: any[];
  public homeBaserunningData: any[];
  public awayBaserunningData: any[];
  public homeFieldingData: any[];
  public awayFieldingData: any[];

  public homePitchingLength: number;
  public awayPitchingLength: number;
  public homeHittingLength: number;
  public awayHittingLength: number;
  public homeBaserunningLength: number;
  public awayBaserunningLength: number;
  public homeFieldingLength: number;
  public awayFieldingLength: number;

  constructor(private gameService: GameService) {
    this.teamColors = this.shared.teamColors;
  }
  public ngOnInit() {
    this.gameService.getOverallBaseBallTeamStats(this.gameId, this.sportId)
      .subscribe((teamstats) => this.overallTeamStats = teamstats,
      (err) => null,
    );
    this.gameService.getPlayerPitchings(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerPitching) => this.homePitchingData = playerPitching,
      (err) => null,
      () => this.homePitchingLength = this.homePitchingData.length,
    );
    this.gameService.getPlayerPitchings(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerPitching) => this.awayPitchingData = playerPitching,
      (err) => null,
      () => this.awayPitchingLength = this.awayPitchingData.length,
    );
    this.gameService.getPlayerHittings(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.awayHittingData = playerHittings,
      (err) => null,
      () => this.awayHittingLength = this.awayHittingData.length,
    );
    this.gameService.getPlayerHittings(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.homeHittingData = playerHittings,
      (err) => null,
      () => this.homeHittingLength = this.homeHittingData.length,
    );
    this.gameService.getPlayerBaserunning(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.awayBaserunningData = playerHittings,
      (err) => null,
      () => this.awayBaserunningLength = this.awayBaserunningData.length,
    );
    this.gameService.getPlayerBaserunning(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.homeBaserunningData = playerHittings,
      (err) => null,
      () => this.homeBaserunningLength = this.homeBaserunningData.length,
    );
   this.gameService.getPlayerFielding(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.awayFieldingData = playerHittings,
      (err) => null,
      () => this.awayFieldingLength = this.awayFieldingData.length,
    );
    this.gameService.getPlayerFielding(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (playerHittings) => this.homeFieldingData = playerHittings,
      (err) => null,
      () => this.homeFieldingLength = this.homeFieldingData.length,
    );
    this.gameService.getBaseBallScoringPlays(this.gameId, this.sportId)
      .subscribe(
      (scoringPlays) => this.scoringPlays = scoringPlays,
      (err) => console.log(err),
    );
  }
}
