import { AnimationTransitionEvent, Component, Input, OnInit, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/platform-browser";
// tslint:disable-next-line:max-line-length
import { IGameScoring, IPlayerRushing, ITeamStats } from "../../../../../../../typings/athlyte/football/game/game.d";
import { TeamColors } from "../../../../shared/team-colors";
import { GameService } from "../../game.service";

@Component({
  selector: "app-summary-soccer",
  templateUrl: "./summary-soccer.component.html",
  styleUrls: ["./summary-soccer.component.css"],
  providers: [GameService]
})

export class SummarySoccerComponent implements OnInit {
  
  @Input() public homeTeam: any;
  @Input() public awayTeam: any;
  @Input() public gameId: any;
  @Input() public sportId: any;

  private showFullStas: boolean = false;  

  public teamColors: any;
  public shared: TeamColors = new TeamColors();

  public overallTeamStats: ITeamStats[];
  public overallOffensePlays: any[];
  public scoringPlays: IGameScoring[];

  public SoccerGoalieData:any[];
  public SoccerScoringData:any[];
  public SoccerMiscData:any[];
  public SoccerShotsData:any[];
  public SoccerPenaltiesData:any[];

  public awayGoalieData:any[];
  public awaySoccerData:any[];
  public awayMiscData:any[];
  public awayShotsData:any[];
  public awayPenaltiesData:any[];


  public SoccerGoalieLength:number;
  public awayGoalieLength:number;

  public SoccerScoringLength:number;
  public awaySoccerLength:number;

  public SoccerMiscLength:number;
  public awayMiscDataLength:number;

  public SoccerShotsLength:number;
  public awayShotsDataLength:number;

  public SoccerPenaltiesLength:number;
  public awayPenaltiesDataLength:number;

  constructor(private gameService: GameService,@Inject(DOCUMENT) private document: Document) {
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {

        this.gameService.getOverallTeamStats(this.gameId, this.sportId)
        .subscribe((teamstats) => this.overallTeamStats = teamstats,
        (err) => null,
      );
      
      this.gameService.getAllPlays(this.gameId, this.sportId)
      .subscribe((plays) => this.overallOffensePlays = plays,
      (err) => null,
      );
      
      this.gameService.getScoringPlays(this.gameId, this.sportId)
      .subscribe(
      (scoringPlays) => {this.scoringPlays = scoringPlays;},
      (err) => null,
      );
      
      //Goalie Api CAll
      this.gameService.getSoccerGoalieSpecial(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.SoccerGoalieData = data;},
      (err) => null,
      () => {this.SoccerGoalieLength = this.SoccerGoalieData.length;}
      );
      
      this.gameService.getSoccerGoalieSpecial(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (data) => {this.awayGoalieData = data;},
      (err) => null,
      () => {this.awayGoalieLength = this.awayGoalieData.length;}
      );
      
      // Scoring Api Call
      this.gameService.getSoccerScoring(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.SoccerScoringData = data;},
      (err) => null,
        () => this.SoccerScoringLength = this.SoccerScoringData.length,
      );
      
      this.gameService.getSoccerScoring(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.awaySoccerData = data;},
      (err) => null,
      () => this.awaySoccerLength = this.awaySoccerData.length,
      );
      
      //Misc Api Call
      this.gameService.getSoccerMisc(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.SoccerMiscData = data;},
      (err) => null,
      () => this.SoccerMiscLength = this.SoccerMiscData.length,
      );
      
      this.gameService.getSoccerMisc(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.awayMiscData = data;},
      (err) => null,
      () => this.awayMiscDataLength = this.awayMiscData.length,
      );
      
      
        //Shots Api Call
      this.gameService.getSoccerShots(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.SoccerShotsData = data;},
      (err) => null,
      () => this.SoccerShotsLength = this.SoccerShotsData.length,
      );
      
      this.gameService.getSoccerShots(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.awayShotsData = data;},
      (err) => null,
      () => this.awayShotsDataLength = this.awayShotsData.length,
      );
      
          //Penalties Api Call
      this.gameService.getSoccerPenalties(this.gameId, this.homeTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.SoccerPenaltiesData = data;},
      (err) => null,
      () => this.SoccerPenaltiesLength = this.SoccerPenaltiesData.length,
      );
      
      this.gameService.getSoccerPenalties(this.gameId, this.awayTeam.code, this.sportId)
      .subscribe(
      (data)=> {this.awayPenaltiesData = data;},
      (err) => null,
      () => this.awayPenaltiesDataLength = this.awayPenaltiesData.length,
      );

  }

  public onClick(newValue: any, stat: boolean) {  
    var mainDiv = document.getElementById('app-content')!;
      mainDiv.scrollTop = 0; 
    //  this.showFullStas= !stat;
   }
}

