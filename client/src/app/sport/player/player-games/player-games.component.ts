import { DataSource } from "@angular/cdk/collections";
import { AnimationTransitionEvent, Component, Input, OnInit, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { TeamColors } from "../../../shared/team-colors";
import { PlayerService } from "../player.service";
@Component({
  selector: "app-player-games",
  templateUrl: "./player-games.component.html",
  styleUrls: ["./player-games.component.css"],
  providers: [PlayerService],
})
export class PlayerGamesComponent implements OnInit { 
 
  @Input() public sportId: any;
  @Input() public playerId: any;
  @Input() public teamCode: any;
  public gameStats: any[];
  public shared: TeamColors = new TeamColors();
  public displayedTabs: string[] = [];
  public displayedColumns: {
    [key: string]: string[];
  } = {};
  public displayedColumnsWithSeason: {
    [key: string]: string[];
  } = {};
  public disCol: string[] = [];
  public columnDisplayNames: {
    [key: string]: string;
  } = {};
  public tabsDone: boolean = false;
  public columnGroups: {
    [key: string]: any[];
  } = {};
  public teamColors: any;
  constructor(private playerService: PlayerService, @Inject(DOCUMENT) private document: Document) {
    this.teamColors = this.shared.teamColors;
  }
  public ngOnInit() { 
    this.playerService.getPlayerGameStats(this.playerId, this.sportId)
      .subscribe((gamestats) => {
        this.gameStats = gamestats;
        this.fillDisplayedColumns();
        this.fillColumnGroups();
        this.fillColumnDisplayNames();
        this.getTabs();
        this.teamColors = this.shared.teamColors;
      },
        (err) => null,
      );   
  }

  public fillDisplayedColumns() {
    switch (this.sportId) {
      case "MFB":
        {
          this.displayedColumns.Passing = [
            "opponentName",
            "passComp",
            "passAtt",
            "passPct",
            "passYards",
            "passTd",
            "passInt",
            "passSacks",
            "passLong",
            "passYdsComp",
            "passYdsAtt",
            "rating",
          ];
          this.displayedColumnsWithSeason.Passing = ["date"].concat(
            this.displayedColumns.Passing,
          );
          this.displayedColumns.Rushing = [
            "opponentName",
            "rushAtt",
            "rushYards",
            "rushTd",
            "rushLong",
            "rushYdsAtt",
          ];
          this.displayedColumnsWithSeason.Rushing = ["date"].concat(
            this.displayedColumns.Rushing,
          );
          this.displayedColumns.Receiving = [
            "opponentName",
            "rcvNum",
            "rcvYards",
            "rcvTd",
            "rcvLong",
            "rcvYdsAtt",
          ];
          this.displayedColumnsWithSeason.Receiving = ["date"].concat(
            this.displayedColumns.Receiving,
          );
          this.displayedColumns.Returning = [
            "opponentName",
            "krNo",
            "krYards",
            "krTd",
            "krLong",
            "krYdsAtt",
            "prNo",
            "prYards",
            "prTd",
            "prLong",
            "prYdsAtt",
          ];
          this.displayedColumnsWithSeason.Returning = ["date"].concat(
            this.displayedColumns.Returning,
          );
          this.displayedColumns.Kicking = [
            "opponentName",
            "fgMade",
            "fgAtt",
            "fgPct",
            "fgLong",
            "fgBlocked",
            "kickMade",
            "kickAtt",
            "kickPct",
            "points",
          ];
          this.displayedColumnsWithSeason.Kicking = ["date"].concat(
            this.displayedColumns.Kicking,
          );
          this.displayedColumns.Punting = [
            "opponentName",
            "puntNum",
            "puntYards",
            "puntYdsAtt",
            "puntLong",
            "puntTb",
            "puntFc",
            "puntInside20",
            "puntPlus50",
            "puntBlocked",
            "koNum",
            "koYards",
            "koYdsAtt",
            "koOb",
            "koTb",
          ];
          this.displayedColumnsWithSeason.Punting = ["date"].concat(
            this.displayedColumns.Punting,
          );
          this.displayedColumns.Defense = [
            "opponentName",
            "dTackUa",
            "dTackA",
            "dTackTot",
            "dTfl",
            "dTflYards",
            "dSacks",
            "dSackYards",
            "dQbh",
            "dblkd",
          ];
          this.displayedColumnsWithSeason.Defense = ["date"].concat(
            this.displayedColumns.Defense,
          );
          this.displayedColumns.Interceptions = [
            "opponentName",
            "dInt",
            "dIntYards",
            "irTd",
            "irLong",
            "dIntYdsAtt",
            "dBrup",
            "fbTotal",
            "fbLost",
            "dFf",
            "dFr",
            "dFryds",
            "dFYdsAtt",
            "td",
          ];
          this.displayedColumnsWithSeason.Interceptions = ["date"].concat(
            this.displayedColumns.Interceptions,
          );
        }
        break;
      case "WSB":
      case "MBA":
        {
          this.displayedColumns.Fielding = [
            "opponentName",
            "A",
            "CI",
            "CSB",
            "INDP",
            "INTP",
            "PB",
            "E",
            "PO",
            "SBA",
          ];
          this.displayedColumnsWithSeason.Fielding = ["date"].concat(
            this.displayedColumns.Fielding,
          );
          this.displayedColumns.Hitting = [
            "opponentName",
            "AB",
            "H",
            "D",
            "BB",
            "HR",
            "R",
            "RBI",
            "SO",
            "SH",
            "SF",
            "CS",
            "GDP",
          ];
          this.displayedColumnsWithSeason.Hitting = ["date"].concat(
            this.displayedColumns.Hitting,
          );

          this.displayedColumns.Pitching = [
            "opponentName",
            "G",
            "GS",
            "CG",
            "IP",
            "H",
            "R",
            "ER",
            "HR",
            "SH",
            "SF",
            "HBP",
            "IBB",
            "SO",
            "WP",
            "FLY",
            "BK",
            "W",
            "L",
            "SHO",
            "SV",
            "ERA",
            "BB",
          ];
          this.displayedColumnsWithSeason.Pitching = ["date"].concat(
            this.displayedColumns.Pitching,
          );
        }
        break;
      case "MBB":
      case "WBB":
        {
          this.displayedColumns.BoxScoreStarters = [
            "opponentName",
            "CLASS",
            "MIN",
            "FGM",
            "FGPCT",
            "FGM3",
            "FG3PCT",
            "FTM",
            "FTPCT",            
            "OREB",
            "DREB",
            "TREB",
            "AST",
            "STL",
            "BLK",
            "TO",
            "PF",
            "TF", 
            "TP",           
          ];
          this.displayedColumnsWithSeason.BoxScoreStarters = ["date"].concat(
            this.displayedColumns.BoxScoreStarters,
          );
         
        }
        break;
      case "WSO":
      case "MSO":
      {
        this.displayedColumns.Scoring = [
          "opponentName",
          "ScoringGp",
          "ScoringGs",
          "ScoringMin",
          "ScoringG",
          "ScoringA",
          "ScoringPTS"
        ];
        this.displayedColumnsWithSeason.Scoring = ["date"].concat(
          this.displayedColumns.Scoring,
        );
        this.displayedColumns.Shots = [
          "opponentName",
          "ShotsGp",
          "ShotsGs",
          "ShotsMin",
          "ShotsG",
          "ShotsSh",
          "ShotsPct",
          "ShotsSog",
          "ShotsSogPct"
        ];
        this.displayedColumnsWithSeason.Shots = ["date"].concat(
          this.displayedColumns.Shots,
        );
        this.displayedColumns.Penalties = [
          "opponentName",
          "PenaltiesGP",
          "PenaltiesGs",
          "PenaltiesMin",
          "PenaltiesF",
          "PenaltiesYc",
          "PenaltiesRc"
        ];
        this.displayedColumnsWithSeason.Penalties = ["date"].concat(
          this.displayedColumns.Penalties,
        );
        this.displayedColumns.Misc = [
          "opponentName",
          "MiscGp",
          "MiscGs",
          "MiscMin",
          "MiscGwg",
          "MiscG",
          "MiscAtt"
        ];
        this.displayedColumnsWithSeason.Misc = ["date"].concat(
          this.displayedColumns.Misc,
        );
        this.displayedColumns.Goalie = [
          "opponentName",
          "GoalieGp",
          "GoalieGs",
          "GoalieMin",
          "GoalieGa",
          "GoalieGaa",
          "GoalieSv",
          "GoaliePct",
          // "GoalieW",
          // "GoalieL",
          // "GoalieT",
          "GoalieSho",
          "GoalieSf"
        ];
        this.displayedColumnsWithSeason.Goalie = ["date"].concat(
          this.displayedColumns.Goalie,
        );
      }
      break;
      }
  }

  public fillColumnDisplayNames() {
    switch (this.sportId) {
      case "MFB":
        {
          this.columnDisplayNames.opponentName = "VS";
          this.columnDisplayNames.passAtt = "ATT";
          this.columnDisplayNames.passComp = "COMP";
          this.columnDisplayNames.GP = "GP";
          this.columnDisplayNames.rating = "EFF";
          this.columnDisplayNames.passYdsComp = "Y/C";
          this.columnDisplayNames.passYdsAtt = "Y/A";
          this.columnDisplayNames.passYdsGP = "Y/G";
          this.columnDisplayNames.rushYdsAtt = "Y/A";
          this.columnDisplayNames.rushYdsGP = "Y/G";
          this.columnDisplayNames.passPct = "%";
          this.columnDisplayNames.passYards = "YDS";
          this.columnDisplayNames.passTd = "TD";
          this.columnDisplayNames.passInt = "INT";
          this.columnDisplayNames.passSacks = "SACK";
          this.columnDisplayNames.passLong = "LONG";
          this.columnDisplayNames.rushAtt = "ATT";
          this.columnDisplayNames.rushYards = "YDS";
          this.columnDisplayNames.rushTd = "TD";
          this.columnDisplayNames.rushLong = "LONG";
          this.columnDisplayNames.rcvNum = "REC";
          this.columnDisplayNames.rcvYards = "YDS";
          this.columnDisplayNames.rcvTd = "TD";
          this.columnDisplayNames.rcvLong = "LONG";
          this.columnDisplayNames.rcvYdsAtt = "Y/R";
          this.columnDisplayNames.rcvYdsGP = "Y/G";
          this.columnDisplayNames.prYdsAtt = "Y/R";
          this.columnDisplayNames.prYdsGP = "Y/G";
          this.columnDisplayNames.krYdsAtt = "Y/R";
          this.columnDisplayNames.krYdsGP = "Y/G";
          this.columnDisplayNames.dTackUa = "SOLO";
          this.columnDisplayNames.dTackA = "AST";
          this.columnDisplayNames.dTackTot = "TOTAL";
          this.columnDisplayNames.dTfl = "TFL";
          this.columnDisplayNames.dTflYards = "YDS";
          this.columnDisplayNames.dSacks = "SACK";
          this.columnDisplayNames.dSackYards = "YDS";

          this.columnDisplayNames.dInt = "INT";
          this.columnDisplayNames.dIntYards = "YDS";
          this.columnDisplayNames.dIntYdsAtt = "Y/R";
          this.columnDisplayNames.irLong = "LONG";
          this.columnDisplayNames.irTd = "TD";
          this.columnDisplayNames.dBrup = "PD";
          this.columnDisplayNames.fbTotal = "FUM";
          this.columnDisplayNames.fbLost = "LOST";
          this.columnDisplayNames.dFf = "FF";
          this.columnDisplayNames.dFr = "FR";
          this.columnDisplayNames.dFryds = "YDS";
          this.columnDisplayNames.dFYdsAtt = "Y/R";
          this.columnDisplayNames.td = "TD";

          this.columnDisplayNames.irYards = "YDS";
          this.columnDisplayNames.irLong = "LONG";
          this.columnDisplayNames.irTd = "TD";
          this.columnDisplayNames.dQbh = "QBH";
          this.columnDisplayNames.krNo = "RET";
          this.columnDisplayNames.krYards = "YDS";
          this.columnDisplayNames.krLong = "LONG";
          this.columnDisplayNames.krTd = "TD";
          this.columnDisplayNames.prNo = "RET";
          this.columnDisplayNames.prYards = "YDS";
          this.columnDisplayNames.prLong = "LONG";
          this.columnDisplayNames.prTd = "TD";
          this.columnDisplayNames.fgMade = "FGM";
          this.columnDisplayNames.fgAtt = "FGA";
          this.columnDisplayNames.fgLong = "LONG";
          this.columnDisplayNames.fgPct = "%";
          this.columnDisplayNames.points = "POINTS";
          this.columnDisplayNames.kickPct = "%";
          this.columnDisplayNames.fgBlocked = "BLKD";
          this.columnDisplayNames.kickMade = "XPM";
          this.columnDisplayNames.kickAtt = "XPA";
          this.columnDisplayNames.puntNum = "ATT";
          this.columnDisplayNames.puntYards = "YDS";
          this.columnDisplayNames.puntLong = "LONG";
          this.columnDisplayNames.puntBlocked = "BLK";
          this.columnDisplayNames.puntTb = "TB";
          this.columnDisplayNames.puntPlus50 = "50+";
          this.columnDisplayNames.puntYdsAtt = "Y/A";
          this.columnDisplayNames.puntYdsGP = "Y/G";
          this.columnDisplayNames.koYdsAtt = "Y/A";
          this.columnDisplayNames.koYdsGP = "Y/G";
          this.columnDisplayNames.puntFc = "FC";
          this.columnDisplayNames.puntInside20 = "I20";
          this.columnDisplayNames.koNum = "ATT";
          this.columnDisplayNames.koOb = "OB";
          this.columnDisplayNames.koTb = "TB";
          this.columnDisplayNames.koYards = "YDS";
          this.columnDisplayNames.dblkd = "BLK";
        }
        break;
      case "WSB":
      case "MBA":
        {
          this.columnDisplayNames.opponentName = "VS";
          this.columnDisplayNames.A = "A";
          this.columnDisplayNames.E = "E";
          this.columnDisplayNames.PO = "PO";
          this.columnDisplayNames.SBA = "SBA";
          this.columnDisplayNames.CI = "CI";
          this.columnDisplayNames.CSB = "CSB";
          this.columnDisplayNames.INDP = "INDP";
          this.columnDisplayNames.INTP = "INTP";
          this.columnDisplayNames.PB = "PB";

          this.columnDisplayNames.AVG = "AVG";
          this.columnDisplayNames.AB = "AB";
          this.columnDisplayNames.H = "H";
          this.columnDisplayNames.D = "2D";
          this.columnDisplayNames.BB = "BB";
          this.columnDisplayNames.HR = "HR";
          this.columnDisplayNames.TB = "TB";
          this.columnDisplayNames.R = "R";
          this.columnDisplayNames.RBI = "RBI";
          this.columnDisplayNames.SO = "SO";
          this.columnDisplayNames.SH = "SH";
          this.columnDisplayNames.SF = "SF";
          this.columnDisplayNames.CS = "CS";
          this.columnDisplayNames.GDP = "GDP";
          this.columnDisplayNames.OBP = "OBP";
          this.columnDisplayNames.SLG = "SLG";
          this.columnDisplayNames.OPS = "OPS";
          this.columnDisplayNames.PA = "PA";
          this.columnDisplayNames.RAT = "RAT";
          this.columnDisplayNames.GB = "GB";
          this.columnDisplayNames.FB = "FB";
          this.columnDisplayNames.GF = "GF";

          this.columnDisplayNames.AVG = "AVG";
          this.columnDisplayNames.G = "G";
          this.columnDisplayNames.GS = "GS";
          this.columnDisplayNames.CG = "CG";
          this.columnDisplayNames.GF = "CF";
          this.columnDisplayNames.IP = "IP";
          this.columnDisplayNames.H = "H";
          this.columnDisplayNames.R = "R";
          this.columnDisplayNames.ER = "ER";
          this.columnDisplayNames.HR = "HR";
          this.columnDisplayNames.SH = "SH";
          this.columnDisplayNames.SF = "SF";
          this.columnDisplayNames.HBP = "HBP";
          this.columnDisplayNames.TBB = "TBB";
          this.columnDisplayNames.IBB = "IBB";
          this.columnDisplayNames.SO = "SO";
          this.columnDisplayNames.WP = "WP";
          this.columnDisplayNames.GB = "GB";
          this.columnDisplayNames.FLY = "FLY";
          this.columnDisplayNames.RGF = "G/F";
          this.columnDisplayNames.BK = "BK";
          this.columnDisplayNames.W = "W";
          this.columnDisplayNames.L = "L";
          this.columnDisplayNames.SHO = "SHO";
          this.columnDisplayNames.SV = "SV";
          this.columnDisplayNames.ERA = "ERA";
          this.columnDisplayNames.BB = "BB";
          this.columnDisplayNames.RAT = "RAT";
          this.columnDisplayNames.PO = "PO";
          this.columnDisplayNames.A = "A";
          this.columnDisplayNames.E = "E";
          this.columnDisplayNames.DP = "DP";
          this.columnDisplayNames.FieldPercent = "FP";
          this.columnDisplayNames.RF = "RF";
          this.columnDisplayNames.IZ = "IZ";
          this.columnDisplayNames.OUT = "OUT";
        }
        break;
      case "MBB":
      case "WBB":
        {
          this.columnDisplayNames.opponentName = "VS";
          this.columnDisplayNames.CLASS ="CLS";
          this.columnDisplayNames.MIN = "MIN";
          this.columnDisplayNames.FGM = "FGM";
          this.columnDisplayNames.FGPCT = "FG%";
          this.columnDisplayNames.FGM3 = "FGM3";
          this.columnDisplayNames.FG3PCT = "FG3%";
          this.columnDisplayNames.FTM = "FTM";
          this.columnDisplayNames.FTPCT = "FT%";
          this.columnDisplayNames.TP = "TP";
          this.columnDisplayNames.BLK = "BLK";
          this.columnDisplayNames.STL = "STL";
          this.columnDisplayNames.AST = "AST";
          this.columnDisplayNames.OREB = "OREB";
          this.columnDisplayNames.DREB = "DREB";
          this.columnDisplayNames.TREB = "TREB";
          this.columnDisplayNames.PF = "PF";
          this.columnDisplayNames.TF = "TF";
          this.columnDisplayNames.TO = "TO";
        }
        break;
      
      //Vaf New Changes
      case "WSO":
      case "MSO" :
        {
           //scoring
           this.columnDisplayNames.opponentName = "VS";
           this.columnDisplayNames.ScoringGp = "GP";
           this.columnDisplayNames.ScoringGs = "GS";
           this.columnDisplayNames.ScoringMin = "MIN";
           this.columnDisplayNames.ScoringG = "G";
           this.columnDisplayNames.ScoringA = "A";
           this.columnDisplayNames.ScoringPTS = "PTS";
 
           //Shots
           this.columnDisplayNames.ShotsGp = "GP";
           this.columnDisplayNames.ShotsGs = "GS";
           this.columnDisplayNames.ShotsMin = "MIN";
           this.columnDisplayNames.ShotsG = "G";
           this.columnDisplayNames.ShotsSh = "SH";
           this.columnDisplayNames.ShotsPct = "SH%";
           this.columnDisplayNames.ShotsSog = "SOG";
           this.columnDisplayNames.ShotsSogPct = "SOG%";
 
           //Penalties
           this.columnDisplayNames.PenaltiesGP = "GP";
           this.columnDisplayNames.PenaltiesGs = "GS";
           this.columnDisplayNames.PenaltiesMin = "MIN";
           this.columnDisplayNames.PenaltiesF = "F";
           this.columnDisplayNames.PenaltiesYc = "YC";
           this.columnDisplayNames.PenaltiesRc = "RC";
 
           //Misc
           this.columnDisplayNames.MiscGp = "GP";
           this.columnDisplayNames.MiscGs = "GS";
           this.columnDisplayNames.MiscMin = "MIN";
           this.columnDisplayNames.MiscGwg = "GWG";
           this.columnDisplayNames.MiscG = "G";
           this.columnDisplayNames.MiscAtt = "ATT";
 
           //Goalie
           this.columnDisplayNames.GoalieGp = "GP";
           this.columnDisplayNames.GoalieGs = "GS";
           this.columnDisplayNames.GoalieMin = "MP";
           this.columnDisplayNames.GoalieGa = "GA";
           this.columnDisplayNames.GoalieGaa = "GAA";
           this.columnDisplayNames.GoalieSv = "SV";
           this.columnDisplayNames.GoaliePct = "SV%";
          //  this.columnDisplayNames.GoalieW = "W";
          //  this.columnDisplayNames.GoalieL = "L";
          //  this.columnDisplayNames.GoalieT = "T";
           this.columnDisplayNames.GoalieSho = "SHO";
           this.columnDisplayNames.GoalieSf = "SF";
        } 
        break; 
    }
  }

  public fillColumnGroups() {
    switch (this.sportId) {
      case "MFB":
        {
          this.columnGroups.Passing = [];
          this.columnGroups.Rushing = [];
          this.columnGroups.Receiving = [];
          this.columnGroups.Returning = [
            {
              name: "KICKOFFS",
              colSpan: 5,
            },
            {
              name: "PUNTS",
              colSpan: 5,
            },
          ];
          this.columnGroups.Kicking = [
            {
              name: "FIELD GOALS",
              colSpan: 5,
            },
            {
              name: "EXTRA PTS",
              colSpan: 3,
            },
          ];
          this.columnGroups.Punting = [
            
            {
              name: "PUNTING",
              colSpan: 9,
            },
            {
              name: "KICKOFFS",
              colSpan: 6,
            },
          ];
          this.columnGroups.Defense = [
            {
              name: "TACKLES",
              colSpan: 3,
            },
            {
              name: "TACKLES FOR LOSS",
              colSpan: 2,
            },
            {
              name: "SACKS",
              colSpan: 3,
            },
          ];
          this.columnGroups.Interceptions = [
            
            {
              name: "INTERCEPTIONS",
              colSpan: 6,
            },
            {
              name: "FUMBLES",
              colSpan: 7,
            },
          ];
        }
        break;
      case "WSB":
      case "MBA":
        {
          this.columnGroups.Hitting = [];
          this.columnGroups.Fielding = [];
          this.columnGroups.Pitching = [];
        }
        break;
      case "MBB":
      case "WBB":
        {
          this.columnGroups.BoxScoreStarters = [];
        }
        break;
      case "MSO":
      case "WSO":
        {
          this.columnGroups.Scoring = [];
          this.columnGroups.Shots = [];
          this.columnGroups.Penalties = [];
          this.columnGroups.Misc = [
            {
              name: "GP",
              colSpan: 4,
            },
            {
              name: "PENALTY KICKS",
              colSpan: 3,
            },
          ];
          this.columnGroups.Goalie = [];
        }
        break;  
    }
  }

  public getTabs() {
    let passing = false;
    let rushing = false;
    let receiving = false;
    let returning = false;
    let kicking = false;
    let punting = false;
    let defense = false;
    let fielding = false;
    let hitting = false;
    let pitching = false;
    let interceptions = false;
    let boxscore = false;

    //Vaf New Changes
    let scoring = false;
    let shots = false;
    let penalties = false;
    let misc = false;
    let goalie = false;

    const sport = this.sportId;

    if (this.gameStats.length > 0) {
      // Passing
      this.gameStats.forEach((game) => {
        if (sport === "MFB") {
          if (game.passing.passAtt > 0) {
            passing = true;
          }
          if (game.rushing.rushAtt > 0) {
            rushing = true;
          }
          if (game.receiving.rcvNum > 0) {
            receiving = true;
          }
          if (
            game.returning.kickReturn.krNo > 0 ||
            game.returning.puntReturn.prNo > 0
          ) {
            returning = true;
          }
          if (
            game.kicking.fieldgoal.fgAtt > 0 ||
            game.kicking.pointAfter.kickAtt > 0
          ) {
            kicking = true;
          }
          if (game.punting.puntNum > 0) {
            punting = true;
          }
          if (
            game.defense.tackles.dTackTot > 0 ||
            game.defense.sacks.dSacks > 0 ||
            game.defense.interceptions.dInt > 0 ||
            game.defense.fumbRecovery.dFr > 0 ||
            game.defense.fumbRecovery.dFf > 0
          ) {
            defense = true;
          }
          if (           
            game.defense.interceptions.dInt > 0 ||
            game.defense.fumbRecovery.dFr > 0 ||
            game.defense.fumbRecovery.dFf > 0
          ) {
            interceptions = true;
          }

        } 
        else if (sport === "MBA" || sport === "WSB") {
          if (game.fielding !== undefined) {
            fielding = true;
          }
          if (game.hitting !== undefined) {
            hitting = true;
          }
          if (game.pitching !== undefined) {
            pitching = true;
          }
        } else if (sport === "MBB" || sport === "WBB") {
          boxscore = true;
        }
        else if (sport === "MSO" || sport === "WSO") {
          // if (game.scoring !== undefined) {
          //   scoring = true;
          // }
          if (game.shots !== undefined) {
            scoring = true;
            shots = true;
          }
          if (game.planty !== undefined) {
            penalties = true;
            misc = true;
          }
          // if (game.misc !== undefined) {
          //   misc = true;
          // }
          if (game.goalie !== undefined) {
            goalie = true;
          }
        }
      });

      if (boxscore) {
        this.displayedTabs.push("BoxScoreStarters");
      }

      if (fielding) {
        this.displayedTabs.push("Fielding");
      }
      if (hitting) {
        this.displayedTabs.push("Hitting");
      }
      if (pitching) {
        this.displayedTabs.push("Pitching");
      }
      if (passing) {
        this.displayedTabs.push("Passing");
      }
      if (rushing) {
        this.displayedTabs.push("Rushing");
      }
      if (receiving) {
        this.displayedTabs.push("Receiving");
      }
      if (returning) {
        this.displayedTabs.push("Returning");
      }
      if (kicking) {
        this.displayedTabs.push("Kicking");
      }
      if (punting) {
        this.displayedTabs.push("Punting");
      }
      if (defense) {
        this.displayedTabs.push("Defense");
      }
      if(interceptions){
         this.displayedTabs.push("Interceptions");
      }

      //Vaf New Changes
      if(scoring){
        this.displayedTabs.push("Scoring");
      }
      if(shots){
        this.displayedTabs.push("Shots");
      }
      if(penalties){
        this.displayedTabs.push("Penalties");
      }
      if(misc){
        this.displayedTabs.push("Misc");
      }
      if(goalie){
        this.displayedTabs.push("Goalie");
      }

      this.tabsDone = true;
    }
  }


  public getDataSource(tab:string) {
    const data: any[] = [];
    switch (tab.toLowerCase().trim()) {
      case "fielding":
        this.gameStats.forEach((p: any) => {
          const x = {
            A: p.fielding.fieldingA,
            CI: p.fielding.fieldingCI,
            CSB: p.fielding.fieldingCSB,
            INDP: p.fielding.fieldingIndp,
            INTP: p.fielding.fieldingIntp,
            PB: p.fielding.fieldingPB,
            E: p.fielding.fieldingE,
            PO: p.fielding.fieldingPO,
            SBA: p.fielding.fieldingSBA,
            season: null,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "hitting":
        this.gameStats.forEach((p: any) => {
          const x = {
            AB: p.hitting.hittingAB,
            H: p.hitting.hittingH,
            D: p.hitting.hittingDouble,
            BB: p.hitting.hittingBB,
            HR: p.hitting.hittingHR,
            R: p.hitting.hittingR,
            RBI: p.hitting.hittingRBI,
            SO: p.hitting.hittingSO,
            SH: p.hitting.hittingSH,
            SF: p.hitting.hittingSF,
            CS: p.hitting.hittingCS,
            GDP: p.hitting.hittingGround,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "pitching":
        this.gameStats.forEach((p: any) => {
          const x = {
            G: p.pitching.pitchingGround,
            GS: p.pitching.pitchingGS,
            CG: p.pitching.pitchingCG,
            IP: p.pitching.pitchingIP,
            H: p.pitching.pitchingH,
            R: p.pitching.pitchingR,
            ER: p.pitching.pitchingER,
            HR: p.pitching.pitchingHR,
            SH: p.pitching.pitchingSHA,
            SF: p.pitching.pitchingSFA,
            HBP: p.pitching.pitchingHBP,
            IBB: p.pitching.pitchingIBB,
            SO: p.pitching.pitchingSO,
            WP: p.pitching.pitchingWP,
            FLY: p.pitching.pitchingFly,
            BK: p.pitching.pitchingBK,
            W: p.pitching.pitchingWin,
            L: p.pitching.pitchingLoss,
            SHO: p.pitching.pitchingSHO,
            SV: p.pitching.pitchingSave,
            ERA: p.pitching.pitchingER,
            BB: p.pitching.pitchingBB,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "passing":
        this.gameStats.forEach((p: any) => {
          const x ={
                passComp: p.passing.passComp,                
                passAtt: p.passing.passAtt,
                passTd: p.passing.passTd,
                passPct: p.passing.passComp === undefined 
                || p.passing.passAtt === undefined || p.passing.passAtt === 0?
            0 : ((p.passing.passComp/p.passing.passAtt)*100).toFixed(1),
                passYards: p.passing.passYards,
                passInt: p.passing.passInt,
                passSacks: p.passing.passSacks,
                passLong: p.passing.passLong,
                passYdsComp: p.passing.passComp === undefined 
                || p.passing.passYards === undefined || p.passing.passComp === 0 ?
            0 : ((p.passing.passYards/p.passing.passComp)).toFixed(1),
                passYdsAtt: p.passing.passAtt === undefined 
                || p.passing.passYards === undefined || p.passing.passAtt === 0 ?
            0 : ((p.passing.passYards/p.passing.passAtt)).toFixed(1),
            rating: p.passing.passAtt === 0 || p.passing.passAtt === undefined ? 0 : Number(
              (8.4 * p.passing.passYards
                + 330 * p.passing.passTd
                + 100 * p.passing.passComp
                - 200 * p.passing.passInt)
              / p.passing.passAtt).toFixed(1),
                opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
              };
         
          data.push(x);
        });
        break;
      case "rushing":
        this.gameStats.forEach((p: any) => {
          const x = p.rushing;
          x.opponentName = p.opponentName;
          x.opponentCode = p.opponentCode;
          x.date = p.gameDate;
          x._id = p._id;
          x.rushYdsAtt= p.rushing.rushAtt === undefined
              || p.rushing.rushYards === undefined
              || p.rushing.rushAtt === 0 ?
              0 : ((p.rushing.rushYards / p.rushing.rushAtt)).toFixed(1);
          data.push(x);
        });
        break;
      case "receiving":
        this.gameStats.forEach((p: any) => {
          const x = p.receiving;
          x.opponentName = p.opponentName;
          x.opponentCode = p.opponentCode;
          x.date = p.gameDate;
          x._id = p._id;
          x.rcvYdsAtt = p.receiving.rcvNum === undefined
            || p.receiving.rcvYards === undefined || p.receiving.rcvNum === 0 ?
            0 : ((p.receiving.rcvYards / p.receiving.rcvNum)).toFixed(1);
          data.push(x);
        });
        break;
      case "returning":
        this.gameStats.forEach((p: any) => {
          const x = {
            krNo: p.returning.kickReturn.krNo,
            krYards: p.returning.kickReturn.krYards,
            krLong: p.returning.kickReturn.krLong,
            krTd: p.returning.kickReturn.krTd,
            prNo: p.returning.puntReturn.prNo,
            prYards: p.returning.puntReturn.prYards,
            prLong: p.returning.puntReturn.prLong,
            prTd: p.returning.puntReturn.prTd,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
             krYdsAtt: p.returning.kickReturn.krNo === undefined
              || p.returning.kickReturn.krYards === undefined
              || p.returning.kickReturn.krNo === 0 ?
              0 : ((p.returning.kickReturn.krYards / p.returning.kickReturn.krNo)).toFixed(1),
            prYdsAtt: p.returning.puntReturn.prNo === undefined
              || p.returning.puntReturn.prYards === undefined
              || p.returning.puntReturn.prNo === 0 ?
              0 : ((p.returning.puntReturn.prYards / p.returning.puntReturn.prNo)).toFixed(1),
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "kicking":
        this.gameStats.forEach((p: any) => {
          const x = {
            fgMade: p.kicking.fieldgoal.fgMade,
            fgAtt: p.kicking.fieldgoal.fgAtt,
            fgLong: p.kicking.fieldgoal.fgLong,
            fgBlocked: p.kicking.fieldgoal.fgBlocked,
            kickMade: p.kicking.pointAfter.kickMade,
            kickAtt: p.kicking.pointAfter.kickAtt,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
            kickPct: p.kicking.pointAfter.kickAtt === undefined
              || p.kicking.pointAfter.kickMade === undefined
              || p.kicking.pointAfter.kickAtt === 0 ?
              0 : ((p.kicking.pointAfter.kickMade / p.kicking.pointAfter.kickAtt) * 100).toFixed(1),
            points: ((p.kicking.fieldgoal ? p.kicking.fieldgoal.fgMade : 0) * 3) + ((p.kicking.pointAfter ? p.kicking.pointAfter.kickMade : 0) * 1),
            fgPct: p.kicking.fieldgoal.fgAtt === undefined
              || p.kicking.fieldgoal.fgMade === undefined
              || p.kicking.fieldgoal.fgAtt === 0 ?
              0 : ((p.kicking.fieldgoal.fgMade / p.kicking.fieldgoal.fgAtt) * 100).toFixed(1),
          };
          data.push(x);
        });
        break;
      case "punting":
        this.gameStats.forEach((p: any) => {
          const x = {
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
            puntNum: p.punting.puntNum,
            puntYards: p.punting.puntYards,
            puntLong: p.punting.puntLong,
            puntBlocked: p.punting.puntBlocked,
            puntTb: p.punting.puntTb,
            puntPlus50: p.punting.puntPlus50,
            puntInside20: p.punting.puntInside20,
            puntFc: p.punting.puntFc,
            koNum: p.punting.kickoff.koNum,
            koOb: p.punting.kickoff.koOb,
            koTb: p.punting.kickoff.koTb,
            koYards: p.punting.kickoff.koYards,
            koYdsAtt: p.punting.kickoff.koNum === undefined
              || p.punting.kickoff.koYards === undefined
              || p.punting.kickoff.koNum === 0 ?
              0 : ((p.punting.kickoff.koYards / p.punting.kickoff.koNum)).toFixed(1),
            koYdsGP: p.punting.GP === undefined
              || p.punting.kickoff.koYards === undefined
              || p.punting.GP === 0 ?
              0 : ((p.punting.kickoff.koYards / p.punting.GP)).toFixed(1),
            puntYdsAtt: p.punting.puntNum === undefined
              || p.punting.puntYards === undefined
              || p.punting.puntNum === 0 ?
              0 : ((p.punting.puntYards / p.punting.puntNum)).toFixed(1),
          };
          data.push(x);
        });
        break;
      case "defense":
        this.gameStats.forEach((p: any) => {
          const x = {           
            dTackUa: p.defense.tackles.dTackUa,
            dTackA: p.defense.tackles.dTackA,
            dTackTot: p.defense.tackles.dTackTot,
            dTfl: p.defense.tackles.dTfl,
            dTflYards: p.defense.tackles.dTflYards,
            dSacks: p.defense.sacks.dSacks,
            dSackYards: p.defense.sacks.dSackYards,
            dInt: p.defense.interceptions.dInt,
            irYards: p.defense.interceptions.irYards,
            irLong: p.defense.interceptions.irLong,
            irTd: p.defense.interceptions.irTd,
            dFf: p.defense.fumbRecovery.dFf,
            dFr: p.defense.fumbRecovery.dFr,
            dBrup: p.defense.pass.dBrup,
            dQbh: p.defense.pass.dQbh,
            dblkd: p.defense.dblkd,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "interceptions":
        this.gameStats.forEach((p: any) => {
          const x = {           
            dInt: p.defense.interceptions.dInt,
            dIntYards: p.defense.interceptions.dIntYards,
            dIntYdsAtt: p.defense.interceptions.dIntYards === undefined
              || p.defense.interceptions.dInt === undefined || p.defense.interceptions.dIntYards === 0 ?
              0 : ((p.defense.interceptions.dInt / p.defense.interceptions.dIntYards)).toFixed(1),
            irLong: p.defense.interceptions.irLong,
            irTd: p.defense.interceptions.irTd,
            dBrup: p.defense.pass.dBrup,
            fbTotal: p.defense.fumbRecovery.fbTotal,
            fbLost: p.defense.fumbRecovery.fbLost,
            dFf: p.defense.fumbRecovery.dFf,
            dFr: p.defense.fumbRecovery.dFr,
            dFryds: p.defense.fumbRecovery.dFryds,
            dFYdsAtt: p.defense.fumbRecovery.dFryds === undefined
              || p.defense.fumbRecovery.fbTotal === undefined || p.defense.fumbRecovery.dFryds === 0 ?
              0 : ((p.defense.fumbRecovery.fbTotal / p.defense.fumbRecovery.dFryds)).toFixed(1),
            td: p.defense.fumbRecovery.td,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      case "boxscorestarters": {
        this.gameStats.forEach((p: any) => {
          const x = {
            CLASS: p.playerClass,
            MIN: p.stats.min,
            FGM: p.shooting.fgm + "/" + p.shooting.fga,
            FGPCT: p.shooting.fgpct,
            FGM3: p.shooting.fgm3 + "/" + p.shooting.fga3,
            FG3PCT: p.shooting.fg3pct,
            FTM: p.shooting.ftm + "/" + p.shooting.fta,
            FTPCT: p.stats.ftpct,
            TP: p.stats.tp,
            BLK: p.block.blk,
            STL: p.steal.stl,
            AST: p.assist.ast,
            OREB: p.rebound.oreb,
            DREB: p.rebound.dreb,
            TREB: p.rebound.treb,
            PF: p.stats.pf,
            TF: p.stats.tf,
            TO: p.special.ptsTO,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      }
      //Vaf New Changes
      case "scoring": {
        this.gameStats.forEach((p: any) => {
          const x = {
            ScoringGp:p.GP,
            ScoringGs:p.GS,
            ScoringMin:p.Mins,  
            ScoringG:p.shots.shotsG,
            ScoringA:p.shots.shotsA,
            ScoringPTS:(p.shots.shotsG + p.shots.shotsA)*2,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      } 
      case "shots": {
        this.gameStats.forEach((p: any) => {
          var a = "";
          a = (isNaN(p.shots.shotsSOG / p.shots.shotsSH) ? 0 : (p.shots.shotsSOG /p.shots.shotsSH).toFixed(3)).toString();
          var shpct = parseFloat(a);
          const x = {
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            ShotsGp:p.GP,
            ShotsGs:p.GS,
            ShotsMin:p.Mins,
            ShotsG:p.shots.shotsG,
            ShotsSh:p.shots.shotsSH,
            ShotsPct: isNaN(p.shots.shotsG / p.shots.shotsSH) ? 0 : ((p.shots.shotsG / p.shots.shotsSH).toFixed(3)).startsWith("0.") ? ((p.shots.shotsG / p.shots.shotsSH).toFixed(3)).substring(1) : Number((p.shots.shotsG / p.shots.shotsSH).toFixed(3)),
            ShotsSog: p.shots.shotsSOG,
            ShotsSogPct: isNaN(p.shots.shotsSOG / p.shots.shotsSH) ? 0 : ((p.shots.shotsSOG / p.shots.shotsSH).toFixed(3)).startsWith("0.") ? ((p.shots.shotsSOG / p.shots.shotsSH).toFixed(3)).substring(1) : Number((p.shots.shotsSOG / p.shots.shotsSH).toFixed(3)),
            _id: p._id,
          };
          data.push(x);
        });
        break;
      }  
      case "penalties": {
        this.gameStats.forEach((p: any) => {
          const x = {
            PenaltiesGP:p.GP,
            PenaltiesGs:p.GS,
            PenaltiesMin:p.Mins,
            PenaltiesF:p.planty.plantyFouls,
            PenaltiesYc:p.planty.plantyGreen,
            PenaltiesRc: p.planty.plantyYellow,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      }  
      case "misc": {
        this.gameStats.forEach((p: any) => {
          const x = {
            MiscGp  :p.GP,
            MiscGs  :p.GS,
            MiscMin :p.Mins,
            MiscGwg :p.goaltype.goaltypeGW,
            MiscG : p.shots.shotsPS,
            MiscAtt : p.shots.shotsPSATT,
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      }  
      case "goalie": {
        this.gameStats.forEach((p: any) => {
          const x = {
            GoalieGp  :p.goalie.goalieGP,
            GoalieGs  :p.goalie.goalieGS,
            GoalieMin :p.goalie.goalieMins,
            GoalieGa :p.goalie.goalieGA,
            GoalieGaa :isNaN((p.goalie.goalieGA * 90 )/p.goalie.goalieMins) ? 0 : (p.goalie.goalieGA * 90 )/p.goalie.goalieMins?0: (p.goalie.goalieGA * 90 )/p.goalie.goalieMins,
            GoalieSv : p.goalie.goalieSaves,
            GoaliePct: isNaN(p.goalie.saves/ p.goalie.opposog) ? 0 : ((p.goalie.saves/ p.goalie.opposog).toFixed(3)).startsWith("0.") ? ((p.goalie.saves/ p.goalie.opposog).toFixed(3)).substring(1) : Number((p.goalie.saves/ p.goalie.opposog).toFixed(3)),
            opponentName: p.opponentName,
            opponentCode: p.opponentCode,
            date: p.gameDate,
            GoalieSho:p.goalie.goalieShutout === undefined ? '' : p.goalie.goalieShutout,
            GoalieSf:p.goalie.goalieSf,
            _id: p._id,
          };
          data.push(x);
        });
        break;
      }       
    }
    return data;
  }
}
