import { Component, Input, OnInit } from "@angular/core";
import { IBasketBallTeamStats, IGameBasketBallScoring } from "../../../../../../typings/athlyte/football/game/game.d";
import { GameService } from "../game.service";

@Component({
  selector: "app-play-by-play",
  templateUrl: "./play-by-play.component.html",
  styleUrls: ["./play-by-play.component.css"],
})
export class PlayByPlayComponent implements OnInit {

  @Input() public gameId: string;
  @Input() public homeTeamTidyName: string;
  @Input() public awayTeamTidyName: string;
  @Input() public sportId: any;
  @Input() public homeTeamCode: any;
  @Input() public awayTeamCode: any;
  public scoringPlays: IGameBasketBallScoring[];
  constructor(private gameService: GameService) {
  }
  public ngOnInit() {
   //
  }
}
