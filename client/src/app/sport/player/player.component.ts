import { Location } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HeaderConfig } from "../../shared/header/header.component";
import { PlayerService } from "./player.service";

import { TeamColors } from "../../shared/team-colors";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.css"],
  providers: [PlayerService],
})
export class PlayerComponent implements OnInit {
  public teamCode: number;
  public shared: TeamColors = new TeamColors();
  public playerId: string;
  public sportId: any; 
  public playerInfo: any;
  public teamColors: any;
  public headerConfig = HeaderConfig;
  public seasonStats: any[];
  public careerStats: any;
  public careerStatsGoalTypeStats:any;

  constructor(
    private route: ActivatedRoute,
    public playerService: PlayerService,
    private location: Location
  ) {
    this.teamColors = this.shared.teamColors;
    localStorage.setItem(
      "headerTitle",
      "Player" + " Dashboard -" + localStorage.getItem("sportText"),
    );
  }

  public ngOnInit() {
    this.route.params
      .flatMap((params) => {
        this.playerId = params.playerId;
        this.sportId = params.sport;
        return this.playerService.getPlayerInfo(this.playerId, this.sportId);
      })
      .flatMap((info) => {
        info[0].uniform = info[0].uniform.replace(/\D/g, "");
        this.playerInfo = info;
        return this.playerService.getPlayerCareerStats(
          this.playerId,
          this.sportId,
        );
      })
      .flatMap((career) => {
        this.careerStats = career;
        return this.playerService.getPlayerSeasonStats(
          this.playerId,
          this.sportId,
        );
      })
      .flatMap((season) => {       
        this.seasonStats = season
        return this.playerService.getTeamCode(
          this.playerInfo[0].teamId,
          this.sportId,
        );
      })      
      .subscribe((code) => {
        this.teamCode = code[0].code;
      });
  }


  public goBack(){
     this.location.back();
  }
}
