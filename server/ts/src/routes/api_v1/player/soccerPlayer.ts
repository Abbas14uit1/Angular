
export class SoccerPlayer {

    constructor() {
    }

    public getStatsSeasonPipeline(sportCode: string, playerId: string): any {

        const season_dict = {
            _id: playerId,
            tidyName: "$tidyName",
            name: "$name",
            teamName: "$teamName",
            season: "$games.season",
          };

          return this.buildAggregateExp(sportCode, playerId, season_dict);
    }

    public getStatsCareerPipeline(sportCode: string, playerId: string): any {
        const career_dict = {
            _id: playerId,
            tidyName: "$tidyName",
            name: "$name",
            teamName: "$teamName",
          }
        return this.buildAggregateExp(sportCode, playerId, career_dict);
    }

    public getStatsGamePipeline(sportCode: string, playerId: string): any {

        return [
            { $match: { sportCode: sportCode, _id: playerId }, },
            { $unwind: "$games" },
            {
              $group: {
                _id: {
                  _id: playerId,
                  tidyName: "$tidyName",
                  name: "$name",
                  teamName: "$teamName",
                  gameId: "$games.gameId",
                  gameDate: "$games.actualDate",
                  opponentName: "$games.opponentName",
                  season: "$games.season",
                },
                opponentCode: { $first: "$games.opponentCode" },
                GP: { $sum: "$games.gp" },
                GS: { $sum: "$games.gs" },
                shotsA: { $sum: "$games.stats.shots.a" },
                shotsPS: { $sum: "$games.stats.shots.ps" },
                shotsG: { $sum: "$games.stats.shots.g" },
                shotsSOG: { $sum: "$games.stats.shots.sog" },
                shotsSH: { $sum: "$games.stats.shots.sh" },
                shotsPSATT: { $sum: "$games.stats.shots.psatt" },
                goaltypeGW: { $sum: "$games.stats.goaltype.gw" },
                goaltypeEN: { $sum: "$games.stats.goaltype.en" },
                goaltypeSO: { $sum: "$games.stats.goaltype.so" },
                goaltypeFG: { $sum: "$games.stats.goaltype.fg" },
                goaltypeHAT: { $sum: "$games.stats.goaltype.hat" },
                goaltypeOT: { $sum: "$games.stats.goaltype.ot" },
                goaltypeUA: { $sum: "$games.stats.goaltype.ua" },
                goaltypeGT: { $sum: "$games.stats.goaltype.gt" },
                plantyCount: { $sum: "$games.stats.planty.count" },
                plantyFouls: { $sum: "$games.stats.planty.fouls" },
                plantyGreen: { $sum: "$games.stats.planty.green" },
                plantyYellow: { $sum: "$games.stats.planty.yellow" },
                plantyRed: { $sum: "$games.stats.planty.red" },
                miscMinutes: { $sum: "$games.stats.misc.minutes" },
                miscDsave: { $sum: "$games.stats.misc.dsave" },
                goalieCBOSHO: { $sum: "$games.stats.goalie.cbosho" },
                goalieGS: { $sum: "$games.stats.goalie.gs" },
                goalieGA: { $sum: "$games.stats.goalie.ga" },
                goalieGP: { $sum: "$games.stats.goalie.gp" },
                goalieSaves: { $sum: "$games.stats.goalie.saves" },
                goalieMins: { $sum: "$games.stats.goalie.mins" },
                goalieSf: { $sum: "$games.stats.goalie.sf" },
                goalieShutout: { $sum: "$games.stats.goalie.shutout" },
                goaliePrd1Saves: { $sum: "$games.stats.goalie[0].saves" },
                goaliePrd2Saves: { $sum: "$games.stats.goalie[1].saves" },
              },
            },
            {
              $project: {
                _id: "$_id.gameId",
                tidyName: "$_id.tidyName",
                name: "$_id.name",
                teamName: "$_id.teamName",
                season: "$_id.season",
                started: "$_id.started",
                gameDate: "$_id.gameDate",
                opponentName: "$_id.opponentName",
                opponentCode: "$opponentCode",
                GP: "$GP",
                GS: "$GS",
                Mins: "$miscMinutes",
                // shots
                shots: {
                    shotsA: "$shotsA",
                    shotsPS: "$shotsPS",
                    shotsG: "$shotsG",
                    shotsSOG: "$shotsSOG",
                    shotsSH: "$shotsSH",
                    shotsPSATT: "$shotsPSATT",
                },
                // goaltype
                goaltype: {
                    goaltypeGW: "$goaltypeGW",
                    goaltypeEN: "$goaltypeEN",
                    goaltypeSO: "$goaltypeSO",
                    goaltypeFG: "$goaltypeFG",
                    goaltypeHAT: "$goaltypeHAT",
                    goaltypeOT: "$goaltypeOT",
                    goaltypeUA: "$goaltypeUA",
                    goaltypeGT: "$goaltypeGT",
                },
                // planty
                planty: {
                    plantyCount: "$plantyCount",
                    plantyFouls: "$plantyFouls",
                    plantyGreen: "$plantyGreen",
                    plantyYellow: "$plantyYellow",
                    plantyRed: "$plantyRed",
                },
                // goalie
                goalie: {
                    goalieCBOSHO: "$goalieCBOSHO",
                    goalieGS: "$goalieGS",
                    goalieGA: "$goalieGA",
                    goalieGP: "$goalieGP",
                    goalieSaves: "$goalieSaves",
                    goalieMins: "$goalieMins",
                    goalieSf: "$goalieSf",
                    goalieShutout: "$goalieShutout",
                    goaliePrd1Saves: "$goaliePrd1Saves",
                    goaliePrd2Saves: "$goaliePrd2Saves",
                }
              },
            },
        ];
    }

    private buildAggregateExp(sportCode: string, playerId: string, idGrp: any) {
        return [
            { $match: { sportCode: sportCode, _id: playerId }, },
            { $unwind: "$games" },
            {
              $group: {
                _id: idGrp,
                GP: { "$sum": "$games.gp" },
                GS: { "$sum": "$games.gs" },
                shotsA: { $sum: "$games.stats.shots.a" },
                shotsPS: { $sum: "$games.stats.shots.ps" },
                shotsG: { $sum: "$games.stats.shots.g" },
                shotsSOG: { $sum: "$games.stats.shots.sog" },
                shotsSH: { $sum: "$games.stats.shots.sh" },
                shotsPSATT: { $sum: "$games.stats.shots.psatt" },
                goaltypeGW: { $sum: "$games.stats.goaltype.gw" },
                goaltypeEN: { $sum: "$games.stats.goaltype.en" },
                goaltypeSO: { $sum: "$games.stats.goaltype.so" },
                goaltypeFG: { $sum: "$games.stats.goaltype.fg" },
                goaltypeHAT: { $sum: "$games.stats.goaltype.hat" },
                goaltypeOT: { $sum: "$games.stats.goaltype.ot" },
                goaltypeUA: { $sum: "$games.stats.goaltype.ua" },
                goaltypeGT: { $sum: "$games.stats.goaltype.gt" },
                plantyCount: { $sum: "$games.stats.planty.count" },
                plantyFouls: { $sum: "$games.stats.planty.fouls" },
                plantyGreen: { $sum: "$games.stats.planty.green" },
                plantyYellow: { $sum: "$games.stats.planty.yellow" },
                plantyRed: { $sum: "$games.stats.planty.red" },
                miscMinutes: { $sum: "$games.stats.misc.minutes" },
                miscDsave: { $sum: "$games.stats.misc.dsave" },
                goalieCBOSHO: { $sum: "$games.stats.goalie.cbosho" },
                goalieGS: { $sum: "$games.stats.goalie.gs" },
                goalieGA: { $sum: "$games.stats.goalie.ga" },
                goalieGP: { $sum: "$games.stats.goalie.gp" },
                goalieSaves: { $sum: "$games.stats.goalie.saves" },
                goalieMins: { $sum: "$games.stats.goalie.mins" },
                goalieSf: { $sum: "$games.stats.goalie.sf" },
                goalieShutout: { $sum: "$games.stats.goalie.shutout" },
                goaliePrd1Saves: { $sum: "$games.stats.goalie[0].saves" },
                goaliePrd2Saves: { $sum: "$games.stats.goalie[1].saves" },
              },
            },
            {
              $project: {
                _id: "$_id.gameId",
                tidyName: "$_id.tidyName",
                name: "$_id.name",
                teamName: "$_id.teamName",
                season: "$_id.season",
                started: "$_id.started",
                GP: "$GP",
                GS: "$GS",
                Mins: "$miscMinutes",
                // shots
                shots: {
                    shotsA: "$shotsA",
                    shotsPS: "$shotsPS",
                    shotsG: "$shotsG",
                    shotsSOG: "$shotsSOG",
                    shotsSH: "$shotsSH",
                    shotsPSATT: "$shotsPSATT",
                },
                // goaltype
                goaltype: {
                    goaltypeGW: "$goaltypeGW",
                    goaltypeEN: "$goaltypeEN",
                    goaltypeSO: "$goaltypeSO",
                    goaltypeFG: "$goaltypeFG",
                    goaltypeHAT: "$goaltypeHAT",
                    goaltypeOT: "$goaltypeOT",
                    goaltypeUA: "$goaltypeUA",
                    goaltypeGT: "$goaltypeGT",
                },
                // planty
                planty: {
                    plantyCount: "$plantyCount",
                    plantyFouls: "$plantyFouls",
                    plantyGreen: "$plantyGreen",
                    plantyYellow: "$plantyYellow",
                    plantyRed: "$plantyRed",
                },
                // goalie
                goalie: {
                    goalieCBOSHO: "$goalieCBOSHO",
                    goalieGS: "$goalieGS",
                    goalieGA: "$goalieGA",
                    goalieGP: "$goalieGP",
                    goalieSaves: "$goalieSaves",
                    goalieMins: "$goalieMins",
                    goalieSf: "$goalieSf",
                    goalieShutout: "$goalieShutout",
                    goaliePrd1Saves: "$goaliePrd1Saves",
                    goaliePrd2Saves: "$goaliePrd2Saves",
                }
              },
            },
        ];
    }
}