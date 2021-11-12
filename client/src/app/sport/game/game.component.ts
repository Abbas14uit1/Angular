import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import "rxjs/add/operator/mergeMap";
import { IGameInfo } from "../../../../../typings/athlyte/football/game/game.d";
import { HeaderConfig } from "../../shared/header/header.component";
import { GameService } from "./game.service";
import { TeamColors } from "../../shared/team-colors";
import * as moment from "moment";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
  providers: [GameService],
})
export class GameComponent implements OnInit {
  public shared: TeamColors = new TeamColors();
  public gameId: string;
  public sportId: string;
  public gameInfo: IGameInfo[];
  public homeTeam: any;
  public awayTeam: any;
  public teamColors: any;
  public headerConfig = HeaderConfig;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private location: Location
  ) {
    this.teamColors = this.shared.teamColors;
    localStorage.setItem("headerTitle", "Game" + " Dashboard -" + localStorage.getItem("sportText"));
  }

  public ngOnInit() {
    this.route.params.flatMap((params) => {
      this.gameId = params.gameId;
      this.sportId = params.sport;
      return this.gameService.getTeamGames(this.gameId, this.sportId);
    }).flatMap((teamGames) => {
      this.homeTeam = teamGames[0].homeAway === 1 ? teamGames[0] : teamGames[1];
      this.awayTeam = teamGames[0].homeAway === 0 ? teamGames[0] : teamGames[1];
      // Shorten team names
      if (this.homeTeam.name && this.homeTeam.name.indexOf("State") !== -1) {
        const index = this.homeTeam.name.indexOf("State");
        this.homeTeam.name = this.homeTeam.name.substring(0, index) + "St" + this.homeTeam.name.substring(index + 5);
      }
      if (this.awayTeam.name && this.awayTeam.name.indexOf("State") !== -1) {
        const index = this.awayTeam.name.indexOf("State");
        this.awayTeam.name = this.awayTeam.name.substring(0, index) + "St" + this.awayTeam.name.substring(index + 5);
      }
      return this.gameService.getGameInfo(this.gameId, this.sportId);
    })
      .subscribe((info) => {
        // Check and set home and away teams
        this.gameInfo = info;
      });
  }

  public getTime(val: any) {
    let utcTime = moment.utc(val).format('h:mm A');
    return utcTime === "12:00 AM" ? "" : utcTime;
  }
  public goBack() {
    this.location.back();
  }

}
