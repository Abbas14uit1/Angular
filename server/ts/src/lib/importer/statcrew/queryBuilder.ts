import * as moment from "moment";
import * as mongo from "mongodb";

export class QueryBuilder{
  public parsedData: any;

  constructor() {
    this.parsedData = {
      _id: undefined
    } as any;
  }
  public prepareStaticTeamGameData(): any {    

      return {
        _id: this.parsedData._id,
        conferenceDivision: this.parsedData.conferenceDivision,
        code: this.parsedData.code,
        startTime: this.parsedData.startTime,
        qtrTotals: this.parsedData.qtrTotals,
        homeAway: this.parsedData.homeAway,
        actualDate: this.parsedData.actualDate,
        opponentName: this.parsedData.opponentName,
        teamId: this.parsedData.teamId,
        conference: this.parsedData.conference,
        attendance: this.parsedData.attendance,
        gameDate: this.parsedData.gameDate,
        totals: this.parsedData.totals,
        opponentConference: this.parsedData.opponentConference,
        sportCode: this.parsedData.sportCode,
        nightGame: this.parsedData.nightGame,
        gameId: this.parsedData.gameId,
        tidyName: this.parsedData.tidyName,
        season: this.parsedData.season,
        homeTeam: this.parsedData.homeTeam,
        opponentConferenceDivision: this.parsedData.opponentConferenceDivision,
        geoLocation: this.parsedData.geoLocation,
        name: this.parsedData.name,
        visitorTeam: this.parsedData.visitorTeam,
        gameType: this.parsedData.gameType,
        opponentCode: this.parsedData.opponentCode,
        players: this.parsedData.players,
        neutralLocation: this.parsedData.neutralLocation,
        linescore: this.parsedData.linescore,
      };
  }

  public async savePlayer(db: mongo.Db): Promise<string> {    
      const player = this.parsedData;
      return db.collection("players").insert(player)
        .then(() => this.parsedData._id);
  }

  public async saveTeamGame(db: mongo.Db): Promise<string> {    
      const teamGame = this.parsedData;
      return db.collection("teamGames").insert(teamGame)
        .then(() => this.parsedData._id);
  }
}
