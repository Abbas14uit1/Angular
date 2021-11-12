import { DataSource } from "@angular/cdk/collections";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { TeamColors } from "../../../shared/team-colors";
@Component({
  selector: "app-player-agg",
  templateUrl: "./player-agg.component.html",
  styleUrls: ["./player-agg.component.css"],
})
export class PlayerAggComponent implements OnInit {
  @Input() public seasonStats: any[];
  public shared: TeamColors = new TeamColors();
  @Input() public careerStats: any;
  @Input() public sportId: any;
  @Input() public teamCode: any;
  public displayedTabs: string[] = [];
  public displayedColumns: {
    [key: string]: string[];
  } = {};
  public displayedColumnsWithSeason: {
    [key: string]: string[];
  } = {};
  public disCol: string[] = [];
  public dataSources: {
    [key: string]: PlayerAggDataSource;
  } = {};
  public columnDisplayNames: {
    [key: string]: string;
  } = {};
  public tabsDone: boolean = false;
  public columnGroups: {
    [key: string]: any[];
  } = {};
  public teamColors: any;

  constructor(public route: ActivatedRoute) {
    this.teamColors = this.shared.teamColors;
  }

  public ngOnInit() {
    try {
      this.fillDataSources();
      this.fillDisplayedColumns();
      this.fillColumnGroups();
      this.fillColumnDisplayNames();
      this.getTabs();
    } catch (ex) {
      console.log(ex);
    }
  }

  public fillDataSources() {
    switch (this.sportId) {
      case "MFB":
        {
          this.dataSources.Passing = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.passing,
            this.sportId,
            "Passing"
          );
          this.dataSources.Rushing = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.rushing,
            this.sportId,
            "Rushing"
          );
          this.dataSources.Receiving = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.receiving,
            this.sportId,
            "Receiving"
          );
          this.dataSources.Returning = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.returning,
            this.sportId,
            "Returning"
          );
          this.dataSources.Kicking = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.kicking,
            this.sportId,
            "Kicking"
          );
          this.dataSources.Punting = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.punting,
            this.sportId,
            "Punting"
          );
          this.dataSources.Defense = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.defense,
            this.sportId,
            "Defense"
          );
          this.dataSources.Interceptions = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.defense,
            this.sportId,
            "Interceptions"
          );
        }
        break;
      case "WSB":
      case "MBA":
        {
          this.dataSources.Hitting = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.hitting,
            this.sportId,
            "Hitting"
          );
          this.dataSources.Fielding = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.fielding,
            this.sportId,
            "fielding"
          );
          this.dataSources.Pitching = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats.pitching,
            this.sportId,
            "Pitching"
          );
        }
        break;
      case "MBB":
      case "WBB":
        {
          this.dataSources.BoxScoreStarters = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats,
            this.sportId,
            "BoxScoreStarters"
          );
          this.dataSources.BoxScoreBench = new PlayerAggDataSource(
            this.seasonStats,
            this.careerStats,
            this.sportId,
            "BoxScoreBench"
          );
        }
    }
  }

  public fillDisplayedColumns() {
    switch (this.sportId) {
      case "MFB":
        {
          this.displayedColumns.Passing = [
            "GP",
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
            "passYdsGP",
            "rating",
          ];
          this.displayedColumnsWithSeason.Passing = ["season"].concat(
            this.displayedColumns.Passing,
          );
          this.displayedColumns.Rushing = [
            "GP",
            "rushAtt",
            "rushYards",
            "rushTd",
            "rushLong",
            "rushYdsAtt",
            "rushYdsGP",
          ];
          this.displayedColumnsWithSeason.Rushing = ["season"].concat(
            this.displayedColumns.Rushing,
          );
          this.displayedColumns.Receiving = [
            "GP",
            "rcvNum",
            "rcvYards",
            "rcvTd",
            "rcvLong",
            "rcvYdsAtt",
            "rcvYdsGP",
          ];
          this.displayedColumnsWithSeason.Receiving = ["season"].concat(
            this.displayedColumns.Receiving,
          );
          this.displayedColumns.Returning = [
            "GP",
            "krNo",
            "krYards",
            "krTd",
            "krLong",
            "krYdsAtt",
            "krYdsGP",
            "prNo",
            "prYards",
            "prTd",
            "prLong",
            "prYdsAtt",
            "prYdsGP",
          ];
          this.displayedColumnsWithSeason.Returning = ["season"].concat(
            this.displayedColumns.Returning,
          );
          this.displayedColumns.Kicking = [
            "GP",
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
          this.displayedColumnsWithSeason.Kicking = ["season"].concat(
            this.displayedColumns.Kicking,
          );
          this.displayedColumns.Punting = [
            "GP",
            "puntNum",
            "puntYards",
            "puntYdsAtt",
            "puntYdsGP",
            "puntLong",
            "puntTb",
            "puntFc",
            "puntInside20",
            "puntPlus50",
            "puntBlocked",
            "koNum",
            "koYards",
            "koYdsAtt",
            "koYdsGP",
            "koOb",
            "koTb",
          ];
          this.displayedColumnsWithSeason.Punting = ["season"].concat(
            this.displayedColumns.Punting,
          );
          this.displayedColumns.Defense = [
            "GP",
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
          this.displayedColumnsWithSeason.Defense = ["season"].concat(
            this.displayedColumns.Defense,
          );
          this.displayedColumns.Interceptions = [
            "GP",
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
          this.displayedColumnsWithSeason.Interceptions = ["season"].concat(
            this.displayedColumns.Interceptions,
          );
        }
        break;
      case "WSB":
      case "MBA":
        {
          this.displayedColumns.Fielding = [
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
          this.displayedColumnsWithSeason.Fielding = ["season"].concat(
            this.displayedColumns.Fielding,
          );
          this.displayedColumns.Hitting = [
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
          this.displayedColumnsWithSeason.Hitting = ["season"].concat(
            this.displayedColumns.Hitting,
          );

          this.displayedColumns.Pitching = [
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
          this.displayedColumnsWithSeason.Pitching = ["season"].concat(
            this.displayedColumns.Pitching,
          );
        }
        break;
      case "MBB":
      case "WBB":
        {
          this.displayedColumns.BoxScoreStarters = [
            "GP",
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
          this.displayedColumns.BoxScoreBench = [
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
          this.displayedColumnsWithSeason.BoxScoreStarters = ["season"].concat(
            this.displayedColumns.BoxScoreStarters,
          );
          this.displayedColumnsWithSeason.BoxScoreBench = ["season"].concat(
            this.displayedColumns.BoxScoreBench,
          );
        }
        break;
    }
  }

  public fillColumnDisplayNames() {
    switch (this.sportId) {
      case "MFB":
        {
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
          this.columnDisplayNames.dFf = "FF";
          this.columnDisplayNames.dFr = "FR";
          this.columnDisplayNames.dBrup = "PD";
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
          // Fielding
          this.columnDisplayNames.FLDPercent = "FLD%";
          this.columnDisplayNames.A = "A";
          this.columnDisplayNames.E = "E";
          this.columnDisplayNames.PO = "PO";
          this.columnDisplayNames.SBA = "SBA";
          this.columnDisplayNames.CI = "CI";
          this.columnDisplayNames.CSB = "CSB";
          this.columnDisplayNames.INDP = "INDP";
          this.columnDisplayNames.INTP = "INTP";
          this.columnDisplayNames.PB = "PB";

          // HIttings
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
          this.columnDisplayNames.SBPercent = "SB%";
          this.columnDisplayNames.GDP = "GDP";
          this.columnDisplayNames.OBP = "OBP";
          this.columnDisplayNames.SLG = "SLG";
          this.columnDisplayNames.OPS = "OPS";
          this.columnDisplayNames.PA = "PA";
          this.columnDisplayNames.RAT = "RAT";
          this.columnDisplayNames.GB = "GB";
          this.columnDisplayNames.FB = "FB";
          this.columnDisplayNames.GF = "GF";

          // Pitching
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
          this.columnDisplayNames.MIN = "MIN";
          this.columnDisplayNames.FGM = "FGM/FGA";
          this.columnDisplayNames.FGPCT = "FG%";
          this.columnDisplayNames.FGM3 = "FGM3/FGA3";
          this.columnDisplayNames.FG3PCT = "FG3%";
          this.columnDisplayNames.FTM = "FTM/FTA";
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
              name: "GP",
              colSpan: 1,
            },
            {
              name: "KICKOFFS",
              colSpan: 6,
            },
            {
              name: "PUNTS",
              colSpan: 6,
            },
          ];
          this.columnGroups.Kicking = [
            {
              name: "GP",
              colSpan: 1,
            },
            {
              name: "FIELD GOALS",
              colSpan: 5,
            },
            {
              name: "EXTRA POINTS",
              colSpan: 3,
            },
          ];
          this.columnGroups.Punting = [
            {
              name: "GP",
              colSpan: 1,
            },
            {
              name: "PUNTING",
              colSpan: 10,
            },
            {
              name: "KICKOFFS",
              colSpan: 6,
            },
          ];
          this.columnGroups.Defense = [
            {
              name: "GP",
              colSpan: 1,
            },
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
              name: "GP",
              colSpan: 1,
            },
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
      case "WBB": {
        this.columnGroups.BoxScoreStarters = [];
        this.columnGroups.BoxScoreBench = [];
      }
    }
  }

  public getTabs() {
    switch (this.sportId) {
      case "MFB":
        {
          // Passing
          if (this.careerStats.passing.passAtt > 0) {
            this.displayedTabs.push("Passing");
          }
          // Rushing
          if (this.careerStats.rushing.rushAtt > 0) {
            this.displayedTabs.push("Rushing");
          }
          // Receiving
          if (this.careerStats.receiving.rcvNum > 0) {
            this.displayedTabs.push("Receiving");
          }
          // Returning
          if (
            this.careerStats.returning.kickReturn.krNo > 0 ||
            this.careerStats.returning.puntReturn.prNo > 0
          ) {
            this.displayedTabs.push("Returning");
          }
          // Kicking
          if (
            this.careerStats.kicking.fieldgoal.fgAtt > 0 ||
            this.careerStats.kicking.pointAfter.kickAtt > 0
          ) {
            this.displayedTabs.push("Kicking");
          }
          // Punting
          if (this.careerStats.punting.puntNum > 0) {
            this.displayedTabs.push("Punting");
          }
          // Defense
          if (
            this.careerStats.defense.tackles.dTackTot > 0 ||
            this.careerStats.defense.sacks.dSacks > 0 ||
            this.careerStats.defense.interceptions.dInt > 0 ||
            this.careerStats.defense.fumbRecovery.dFr > 0 ||
            this.careerStats.defense.fumbRecovery.dFf > 0
          ) {
            this.displayedTabs.push("Defense");
          }

          if (this.careerStats.defense.interceptions.dInt > 0 ||
            this.careerStats.defense.fumbRecovery.dFr > 0 ||
            this.careerStats.defense.fumbRecovery.dFf > 0) {
            this.displayedTabs.push("Interceptions");
          }
        }
        break;
      case "WSB":
      case "MBA":
        {
          if (this.careerStats.fielding !== undefined) {
            this.displayedTabs.push("Fielding");
          }
          if (this.careerStats.hitting !== undefined) {
            this.displayedTabs.push("Hitting");
          }
          if (this.careerStats.pitching !== undefined) {
            this.displayedTabs.push("Pitching");
          }
        }
        break;
      case "MBB":
      case "WBB": {
        if (this.careerStats.length > 0) {
          this.displayedTabs.push("BoxScoreStarters");
          this.displayedTabs.push("BoxScoreBench");
        }        
      }
    }

    this.tabsDone = true;
  }

  public getTabLabels(tab: string){
    let tabLabel = tab;
    
    switch (tab) {
      case "BoxScoreStarters":
        tabLabel = "Box Score Starters";
        break;
      case "BoxScoreBench":
        tabLabel = "Box Score Benchers";
        break;
      case "Punting":
        tabLabel =  "Punting and Kickoffs";
        break;
      case "Interceptions":
        tabLabel =  "Interceptions & Fumbles";  
        break;    
    }
    return tabLabel;
  }
}
export class PlayerAggDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  constructor(
    private seasonData: any,
    private careerData: any,
    private sportId: string,
    private tab: string,
  ) {
    super();
  }

  public combineData(sport: any,tab:string) {
    const data: any[] = [];
    switch (sport) {
      case "MFB":
        {
         return this.getDataSource(tab);
        }
      case "MBB":
      case "WBB":
        if (this.careerData.length > 0) {
          let playerData = [];
          let totalData: any = {};
          if(tab === "BoxScoreStarters")
          {
              playerData = this.seasonData.filter((y: any) => y.started === true);
              totalData = this.careerData.filter((y: any) => y.started === true);
          }
          else{
            playerData = this.seasonData.filter((y: any) => y.started === false);
            totalData = this.careerData.filter((y: any) => y.started === false);
          }
          if(playerData.length > 0)
          {
             playerData.forEach((p: any) => {
            const x = {
              MIN: p.stats.min,
              FGM: p.shooting.fgm + "/" + p.shooting.fga,
              FGPCT: (p.shooting.fgp % 1 != 0 && p.shooting.fgp) ? p.shooting.fgp.toFixed(2) : p.shooting.fgp,
              FGM3: p.shooting.fgm3 + "/" + p.shooting.fga3,
              FG3PCT: (p.shooting.fg3p % 1 != 0) ? p.shooting.fg3p.toFixed(2) : p.shooting.fg3p,
              FTM: p.shooting.ftm + "/" + p.shooting.fta,
              FTPCT: (p.stats.ftp % 1 != 0) ? p.stats.ftp.toFixed(2) : p.stats.ftp,
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
              season: null,
            };
            x.season = p.season;
            data.push(x);
          });
          const c = {
            MIN: totalData[0].stats.min,
            FGM: totalData[0].shooting.fgm + "/" + totalData[0].shooting.fga,
            FGPCT: (totalData[0].shooting.fgp % 1 != 0 && totalData[0].shooting.fgp) ? totalData[0].shooting.fgp.toFixed(2) : totalData[0].shooting.fgp,
            FGM3: totalData[0].shooting.fgm3 + "/" + totalData[0].shooting.fga3,
            FG3PCT: (totalData[0].shooting.fg3p % 1 != 0) ? totalData[0].shooting.fg3p.toFixed(2) : totalData[0].shooting.fg3p,
            FTM: totalData[0].shooting.ftm + "/" + totalData[0].shooting.fta,
            FTPCT: (totalData[0].stats.ftp % 1 != 0) ? totalData[0].stats.ftp.toFixed(2) : totalData[0].stats.ftp,
            TP: totalData[0].stats.tp,
            BLK: totalData[0].block.blk,
            STL: totalData[0].steal.stl,
            AST: totalData[0].assist.ast,
            OREB: totalData[0].rebound.oreb,
            DREB: totalData[0].rebound.dreb,
            TREB: totalData[0].rebound.treb,
            PF: totalData[0].stats.pf,
            TF: totalData[0].stats.tf,
            TO: totalData[0].special.ptsTO,
            season: "TOTAL",
          };
          data.push(c);
        }

          }
          

        break;
      case "WSB":
      case "MBA":
        {
          if (this.careerData.fieldingA !== undefined) {
            this.seasonData.forEach((p: any) => {
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
              };
              x.season = p.season;
              data.push(x);
            });
            const c = {
              A: this.careerData.fieldingA,
              CI: this.careerData.fieldingCI,
              CSB: this.careerData.fieldingCSB,
              INDP: this.careerData.fieldingIndp,
              INTP: this.careerData.fieldingIntp,
              PB: this.careerData.fieldingPB,
              E: this.careerData.fieldingE,
              PO: this.careerData.fieldingPO,
              SBA: this.careerData.fieldingSBA,
              season: "TOTAL",
            };
            data.push(c);
          } else if (this.careerData.hittingH !== undefined) {
            this.seasonData.forEach((p: any) => {
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
                season: null,
              };
              x.season = p.season;
              data.push(x);
            });
            const c = {
              AB: this.careerData.hittingAB,
              H: this.careerData.hittingH,
              D: this.careerData.hittingDouble,
              BB: this.careerData.hittingBB,
              HR: this.careerData.hittingHR,
              R: this.careerData.hittingR,
              RBI: this.careerData.hittingRBI,
              SO: this.careerData.hittingSO,
              SH: this.careerData.hittingSH,
              SF: this.careerData.hittingSF,
              CS: this.careerData.hittingCS,
              GDP: this.careerData.hittingGround,
              season: "TOTAL",
            };
            data.push(c);
          } else if (this.careerData.pitchingH !== undefined) {
            try {
              this.seasonData.forEach((p: any) => {
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
                  season: null,
                };
                x.season = p.season;
                data.push(x);
              });
              const c = {
                G: this.careerData.pitchingGround,
                GS: this.careerData.pitchingGS,
                CG: this.careerData.pitchingCG,
                IP: this.careerData.pitchingIP,
                H: this.careerData.pitchingH,
                R: this.careerData.pitchingR,
                ER: this.careerData.pitchingER,
                HR: this.careerData.pitchingHR,
                SH: this.careerData.pitchingSHA,
                SF: this.careerData.pitchingSFA,
                HBP: this.careerData.pitchingHBP,
                IBB: this.careerData.pitchingIBB,
                SO: this.careerData.pitchingSO,
                WP: this.careerData.pitchingWP,
                FLY: this.careerData.pitchingFly,
                BK: this.careerData.pitchingBK,
                W: this.careerData.pitchingWin,
                L: this.careerData.pitchingLoss,
                SHO: this.careerData.pitchingSHO,
                SV: this.careerData.pitchingSave,
                ERA: this.careerData.pitchingER,
                BB: this.careerData.pitchingBB,
                season: "TOTAL",
              };
              data.push(c);
            } catch (ex) {
              console.log(ex);
            }
          }
        }
        break;
    }
    return data.sort((a, b) => a.season - b.season);
  }

  public getDataSource(tab: string) {
    const data: any[] = [];
    switch (tab.toLowerCase().trim()) {      
      case "passing":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.passing.GP,
            passComp: p.passing.passComp,
            passAtt: p.passing.passAtt,
            passTd: p.passing.passTd,
            passPct: p.passing.passComp === undefined
              || p.passing.passAtt === undefined || p.passing.passAtt === 0 ?
              0 : ((p.passing.passComp / p.passing.passAtt) * 100).toFixed(1),
            passYards: p.passing.passYards,
            passInt: p.passing.passInt,
            passSacks: p.passing.passSacks,
            passLong: p.passing.passLong,
            passYdsComp: p.passing.passComp === undefined
              || p.passing.passYards === undefined || p.passing.passComp === 0 ?
              0 : ((p.passing.passYards / p.passing.passComp)).toFixed(1),
            passYdsAtt: p.passing.passAtt === undefined
              || p.passing.passYards === undefined || p.passing.passAtt === 0 ?
              0 : ((p.passing.passYards / p.passing.passAtt)).toFixed(1),
            passYdsGP: p.passing.GP === undefined
              || p.passing.passYards === undefined || p.passing.GP === 0 ?
              0 : ((p.passing.passYards / p.passing.GP)).toFixed(1),
            rating: p.passing.passAtt === 0 || p.passing.passAtt === undefined ? '' : Number(
              (8.4 * p.passing.passYards
                + 330 * p.passing.passTd
                + 100 * p.passing.passComp
                - 200 * p.passing.passInt)
              / p.passing.passAtt).toFixed(1),
            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const passing = {
          GP: this.careerData.GP,
          passComp: this.careerData.passComp,
          passAtt: this.careerData.passAtt,
          passTd: this.careerData.passTd,
          passPct: this.careerData.passComp === undefined
            || this.careerData.passAtt === undefined ?
            0 : ((this.careerData.passComp / this.careerData.passAtt) * 100).toFixed(1),
          passYards: this.careerData.passYards,
          passInt: this.careerData.passInt,
          passSacks: this.careerData.passSacks,
          passLong: this.careerData.passLong,
          passYdsComp: this.careerData.passComp === undefined
            || this.careerData.passYards === undefined || this.careerData.passComp === 0 ?
            0 : ((this.careerData.passYards / this.careerData.passComp)).toFixed(1),
          passYdsAtt: this.careerData.passAtt === undefined
            || this.careerData.passYards === undefined || this.careerData.passAtt === 0 ?
            0 : ((this.careerData.passYards / this.careerData.passAtt)).toFixed(1),
          passYdsGP: this.careerData.GP === undefined
            || this.careerData.passYards === undefined || this.careerData.GP === 0 ?
            0 : ((this.careerData.passYards / this.careerData.GP)).toFixed(1),
          rating: this.careerData.passAtt === 0 || this.careerData.passAtt === undefined ? '' : Number(
            (8.4 * this.careerData.passYards
              + 330 * this.careerData.passTd
              + 100 * this.careerData.passComp
              - 200 * this.careerData.passInt)
            / this.careerData.passAtt).toFixed(1),
          season: "TOTAL",
        };
        data.push(passing);
        break;
      case "rushing":
        this.seasonData.forEach((p: any) => {
          const x = {
            rushAtt: p.rushing.rushAtt,
            rushGain: p.rushing.rushGain,
            rushLong: p.rushing.rushLong,
            rushLoss: p.rushing.rushLoss,
            rushTd: p.rushing.rushTd,
            rushYards: p.rushing.rushYards,
            GP: p.rushing.GP,
            rushYdsAtt: p.rushing.rushAtt === undefined
              || p.rushing.rushYards === undefined
              || p.rushing.rushAtt === 0 ?
              0 : ((p.rushing.rushYards / p.rushing.rushAtt)).toFixed(1),
            rushYdsGP: p.rushing.GP === undefined
              || p.rushing.rushYards === undefined
              || p.rushing.GP === 0 ?
              0 : ((p.rushing.rushYards / p.rushing.GP)).toFixed(1),
            season: null
          };
          x.season = p.season;
          data.push(x);
        });
        const rushing = {
          rushAtt: this.careerData.rushAtt,
          rushGain: this.careerData.rushGain,
          rushLong: this.careerData.rushLong,
          rushLoss: this.careerData.rushLoss,
          rushTd: this.careerData.rushTd,
          rushYards: this.careerData.rushYards,
          GP: this.careerData.GP,
          rushYdsAtt: this.careerData.rushAtt === undefined
            || this.careerData.rushYards === undefined
            || this.careerData.rushAtt === 0 ?
            0 : ((this.careerData.rushYards / this.careerData.rushAtt)).toFixed(1),
          rushYdsGP: this.careerData.GP === undefined
            || this.careerData.rushYards === undefined
            || this.careerData.GP === 0 ?
            0 : ((this.careerData.rushYards / this.careerData.GP)).toFixed(1),
          season: "TOTAL",
        };
        data.push(rushing);
        break;
      case "receiving":
        this.seasonData.forEach((p: any) => {
          const x = p.receiving;
          x.rcvYdsAtt = p.receiving.rcvNum === undefined
            || p.receiving.rcvYards === undefined || p.receiving.rcvNum === 0 ?
            0 : ((p.receiving.rcvYards / p.receiving.rcvNum)).toFixed(1);
          x.rcvYdsGP = p.receiving.GP === undefined
            || p.receiving.rcvYards === undefined || p.receiving.GP === 0 ?
            0 : ((p.receiving.rcvYards / p.receiving.GP)).toFixed(1);
          x.season = p.season;
          data.push(x);
        });
        this.careerData.season = "TOTAL";
        this.careerData.rcvYdsAtt = this.careerData.rcvYards === undefined
          || this.careerData.rcvYards === undefined || this.careerData.rcvNum === 0 ?
          0 : ((this.careerData.rcvYards / this.careerData.rcvNum)).toFixed(1);
        this.careerData.rcvYdsGP = this.careerData.GP === undefined
          || this.careerData.rcvYards === undefined || this.careerData.GP === 0 ?
          0 : ((this.careerData.rcvYards / this.careerData.GP)).toFixed(1);
        data.push(this.careerData);
        break;
      case "returning":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.returning.GP,
            krNo: p.returning.kickReturn.krNo,
            krYards: p.returning.kickReturn.krYards,
            krLong: p.returning.kickReturn.krLong,
            krTd: p.returning.kickReturn.krTd,
            prNo: p.returning.puntReturn.prNo,
            prYards: p.returning.puntReturn.prYards,
            prLong: p.returning.puntReturn.prLong,
            prTd: p.returning.puntReturn.prTd,
            krYdsAtt: p.returning.kickReturn.krNo === undefined
              || p.returning.kickReturn.krYards === undefined
              || p.returning.kickReturn.krNo === 0 ?
              0 : ((p.returning.kickReturn.krYards / p.returning.kickReturn.krNo)).toFixed(1),
            krYdsGP: p.returning.kickReturn.GP === undefined
              || p.returning.kickReturn.krYards === undefined
              || p.returning.kickReturn.GP === 0 ?
              0 : ((p.returning.kickReturn.krYards / p.returning.kickReturn.GP)).toFixed(1),
            prYdsAtt: p.returning.puntReturn.prNo === undefined
              || p.returning.puntReturn.prYards === undefined
              || p.returning.puntReturn.prNo === 0 ?
              0 : ((p.returning.puntReturn.prYards / p.returning.puntReturn.prNo)).toFixed(1),
            prYdsGP: p.returning.puntReturn.GP === undefined
              || p.returning.puntReturn.prYards === undefined
              || p.returning.puntReturn.GP === 0 ?
              0 : ((p.returning.puntReturn.prYards / p.returning.puntReturn.GP)).toFixed(1),

            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const returning = {
          GP: this.careerData.GP,
          krNo: this.careerData.kickReturn.krNo,
          krYards: this.careerData.kickReturn.krYards,
          krLong: this.careerData.kickReturn.krLong,
          krTd: this.careerData.kickReturn.krTd,
          prNo: this.careerData.puntReturn.prNo,
          prYards: this.careerData.puntReturn.prYards,
          prLong: this.careerData.puntReturn.prLong,
          prTd: this.careerData.puntReturn.prTd,
          krYdsAtt: this.careerData.kickReturn.krNo === undefined
            || this.careerData.kickReturn.krYards === undefined
            || this.careerData.kickReturn.krNo === 0 ?
            0 : ((this.careerData.kickReturn.krYards / this.careerData.kickReturn.krNo)).toFixed(1),
          krYdsGP: this.careerData.kickReturn.GP === undefined
            || this.careerData.kickReturn.krYards === undefined
            || this.careerData.kickReturn.GP === 0 ?
            0 : ((this.careerData.kickReturn.krYards / this.careerData.kickReturn.GP)).toFixed(1),
          prYdsAtt: this.careerData.puntReturn.prNo === undefined
            || this.careerData.puntReturn.prYards === undefined
            || this.careerData.puntReturn.prNo === 0 ?
            0 : ((this.careerData.puntReturn.prYards / this.careerData.puntReturn.prNo)).toFixed(1),
          prYdsGP: this.careerData.puntReturn.GP === undefined
            || this.careerData.puntReturn.prYards === undefined
            || this.careerData.puntReturn.GP === 0 ?
            0 : ((this.careerData.puntReturn.prYards / this.careerData.puntReturn.GP)).toFixed(1),
          season: "TOTAL",
        };
        data.push(returning);
        break;
      case "kicking":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.kicking.GP,
            fgMade: p.kicking.fieldgoal.fgMade,
            fgAtt: p.kicking.fieldgoal.fgAtt,

            fgLong: p.kicking.fieldgoal.fgLong,
            fgBlocked: p.kicking.fieldgoal.fgBlocked,
            kickMade: p.kicking.pointAfter.kickMade,
            kickAtt: p.kicking.pointAfter.kickAtt,
            kickPct: p.kicking.pointAfter.kickAtt === undefined
              || p.kicking.pointAfter.kickMade === undefined
              || p.kicking.pointAfter.kickAtt === 0 ?
              0 : ((p.kicking.pointAfter.kickMade / p.kicking.pointAfter.kickAtt) * 100).toFixed(1),
            points: ((p.kicking.fieldgoal ? p.kicking.fieldgoal.fgMade : 0) * 3) + ((p.kicking.pointAfter ? p.kicking.pointAfter.kickMade : 0) * 1),
            fgPct: p.kicking.fieldgoal.fgAtt === undefined
              || p.kicking.fieldgoal.fgMade === undefined
              || p.kicking.fieldgoal.fgAtt === 0 ?
              0 : ((p.kicking.fieldgoal.fgMade / p.kicking.fieldgoal.fgAtt) * 100).toFixed(1),
            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const kicking = {
          GP: this.careerData.GP,
          fgMade: this.careerData.fieldgoal.fgMade,
          fgAtt: this.careerData.fieldgoal.fgAtt,
          fgLong: this.careerData.fieldgoal.fgLong,
          fgBlocked: this.careerData.fieldgoal.fgBlocked,
          kickMade: this.careerData.pointAfter.kickMade,
          kickAtt: this.careerData.pointAfter.kickAtt,
          kickPct: this.careerData.pointAfter.kickAtt === undefined
            || this.careerData.pointAfter.kickMade === undefined
            || this.careerData.pointAfter.kickAtt === 0 ?
            0 : ((this.careerData.pointAfter.kickMade / this.careerData.pointAfter.kickAtt) * 100).toFixed(1),
          points: ((this.careerData.fieldgoal ? this.careerData.fieldgoal.fgMade : 0) * 3) + ((this.careerData.pointAfter ? this.careerData.pointAfter.kickMade : 0) * 1),
          fgPct: this.careerData.fieldgoal.fgAtt === undefined
            || this.careerData.fieldgoal.fgMade === undefined
            || this.careerData.fieldgoal.fgAtt === 0 ?
            0 : ((this.careerData.fieldgoal.fgMade / this.careerData.fieldgoal.fgAtt) * 100).toFixed(1),
          season: "TOTAL",
        };
        data.push(kicking);
        break;
      case "punting":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.punting.GP,
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
            puntYdsGP: p.punting.GP === undefined
              || p.punting.puntYards === undefined
              || p.punting.GP === 0 ?
              0 : ((p.punting.puntYards / p.punting.GP)).toFixed(1),

            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const punting = {
          GP: this.careerData.GP,
          puntNum: this.careerData.puntNum,
          puntYards: this.careerData.puntYards,
          puntLong: this.careerData.puntLong,
          puntBlocked: this.careerData.puntBlocked,
          puntTb: this.careerData.puntTb,
          puntPlus50: this.careerData.puntPlus50,
          puntInside20: this.careerData.puntInside20,
          puntFc: this.careerData.puntFc,
          koNum: this.careerData.kickoff.koNum,
          koOb: this.careerData.kickoff.koOb,
          koTb: this.careerData.kickoff.koTb,
          koYards: this.careerData.kickoff.koYards,
          koYdsAtt: this.careerData.koNum === undefined
            || this.careerData.koYards === undefined
            || this.careerData.koNum === 0 ?
            0 : ((this.careerData.koYards / this.careerData.koNum)).toFixed(1),
          koYdsGP: this.careerData.GP === undefined
            || this.careerData.koYards === undefined
            || this.careerData.GP === 0 ?
            0 : ((this.careerData.koYards / this.careerData.GP)).toFixed(1),
          puntYdsAtt: this.careerData.puntNum === undefined
            || this.careerData.puntYards === undefined
            || this.careerData.puntNum === 0 ?
            0 : ((this.careerData.puntYards / this.careerData.puntNum)).toFixed(1),
          puntYdsGP: this.careerData.GP === undefined
            || this.careerData.puntYards === undefined
            || this.careerData.GP === 0 ?
            0 : ((this.careerData.puntYards / this.careerData.GP)).toFixed(1),
          season: "TOTAL",
        };
        data.push(punting);
        break;
      case "defense":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.defense.GP,
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
            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const defense = {
          GP: this.careerData.GP,
          dTackUa: this.careerData.tackles.dTackUa,
          dTackA: this.careerData.tackles.dTackA,
          dTackTot: this.careerData.tackles.dTackTot,
          dTfl: this.careerData.tackles.dTfl,
          dTflYards: this.careerData.tackles.dTflYards,
          dSacks: this.careerData.sacks.dSacks,
          dSackYards: this.careerData.sacks.dSackYards,
          dInt: this.careerData.interceptions.dInt,
          irYards: this.careerData.interceptions.irYards,
          irLong: this.careerData.interceptions.irLong,
          irTd: this.careerData.interceptions.irTd,
          dFf: this.careerData.fumbRecovery.dFf,
          dFr: this.careerData.fumbRecovery.dFr,
          dBrup: this.careerData.pass.dBrup,
          dQbh: this.careerData.pass.dQbh,
          dblkd: this.careerData.dblkd,
          season: "TOTAL",
        };
        data.push(defense);
        break;
      case "interceptions":
        this.seasonData.forEach((p: any) => {
          const x = {
            GP: p.defense.GP,
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
            season: null,
          };
          x.season = p.season;
          data.push(x);
        });
        const interceptions = {
          GP: this.careerData.GP,
          dInt: this.careerData.interceptions.dInt,
          dIntYards: this.careerData.interceptions.dIntYards,
          dIntYdsAtt: this.careerData.interceptions.dIntYards === undefined
            || this.careerData.interceptions.dInt === undefined || this.careerData.interceptions.dIntYards === 0 ?
            0 : ((this.careerData.interceptions.dInt / this.careerData.interceptions.dIntYards)).toFixed(1),
          irLong: this.careerData.interceptions.irLong,
          irTd: this.careerData.interceptions.irTd,
          dBrup: this.careerData.pass.dBrup,
          fbTotal: this.careerData.fumbRecovery.fbTotal,
          dFf: this.careerData.fumbRecovery.dFf,
          dFr: this.careerData.fumbRecovery.dFr,
          dFryds: this.careerData.fumbRecovery.dFryds,
          dFYdsAtt: this.careerData.fumbRecovery.dFryds === undefined
            || this.careerData.fumbRecovery.fbTotal === undefined || this.careerData.fumbRecovery.dFryds === 0 ?
            0 : ((this.careerData.fumbRecovery.fbTotal / this.careerData.fumbRecovery.dFryds)).toFixed(1),
          td: this.careerData.fumbRecovery.td,
          fbLost:this.careerData.fumbRecovery.fbLost,
          season: "TOTAL",
        };
        data.push(interceptions);
        break;     
    }
    return data.sort((a, b) => a.season - b.season);
  }

  public connect(): Observable<any[]> {
    const data: any[] = this.combineData(this.sportId,this.tab);
    return Observable.of(data);
  }

  public disconnect() {
    return;
  }
}
