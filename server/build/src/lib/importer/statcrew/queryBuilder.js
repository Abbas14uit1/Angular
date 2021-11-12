"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor() {
        this.parsedData = {
            _id: undefined
        };
    }
    prepareStaticTeamGameData() {
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
    savePlayer(db) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = this.parsedData;
            return db.collection("players").insert(player)
                .then(() => this.parsedData._id);
        });
    }
    saveTeamGame(db) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamGame = this.parsedData;
            return db.collection("teamGames").insert(teamGame)
                .then(() => this.parsedData._id);
        });
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=queryBuilder.js.map