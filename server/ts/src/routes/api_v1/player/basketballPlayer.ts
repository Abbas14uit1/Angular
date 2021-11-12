
export class BasketballPlayer {

    constructor() {
    }

    public getStatsCareerPipelineBasketball(sportCode: string, playerId: string): any {
        return [
          { $match: { sportCode: sportCode, _id: playerId }, },
          { $unwind: "$games" },
          { "$match": { "games.pos.gp": 1 } },
          {
            $group: {
              _id: {
                _id: playerId,
                tidyName: "$tidyName",
                name: "$name",
                teamName: "$teamName",
                //started: "$games.started",
              },
              GP: { "$sum": 1 },
              statsFGM: { $sum: "$games.stats.fgm" },
              statsFGA: { $sum: "$games.stats.fga" },
              statsFGPerGame: { $avg: "$games.stats.fgm" },
              statsFGM3: { $sum: "$games.stats.fgm3" },
              statsFGA3: { $sum: "$games.stats.fga3" },
              statsFTM: { $sum: "$games.stats.ftm" },
              statsFTA: { $sum: "$games.stats.fta" },
              statsFTMPerGame: { $avg: "$games.stats.ftm" },
              statsTP: { $sum: "$games.stats.tp" },
              statsBLK: { $sum: "$games.stats.blk" },
              statsBLKPerGame: { $avg: "$games.stats.blk" },
              statsSTL: { $sum: "$games.stats.stl" },
              statsSTLPerGame: { $avg: "$games.stats.stl" },
              statsAST: { $sum: "$games.stats.ast" },
              statsASTPerGame: { $avg: "$games.stats.ast" },
              statsMIN: { $sum: "$games.stats.min" },
              statsOREB: { $sum: "$games.stats.oreb" },
              statsDREB: { $sum: "$games.stats.dreb" },
              statsTREB: { $sum: "$games.stats.treb" },
              statsPF: { $sum: "$games.stats.pf" },
              statsTF: { $sum: "$games.stats.tf" },
              statsTO: { $sum: "$games.stats.to" },
              statsTOPerGame: { $avg: "$games.stats.to" },
      
              //statsDQ: "$games.stats.dq",
              statsDeadball: { $sum: "$games.stats.deadball" },
              statsFGPCT: { $sum: "$games.stats.fgpct" },
              statsFG3PCT: { $sum: "$games.stats.fg3pct" },
              statsFTPCT: { $sum: "$games.stats.ftpct" },
      
              specialPTSTO: { $sum: "$games.special.ptsto" },
              specialPTSCH2: { $sum: "$games.special.ptsch2" },
              specialPTSPaint: { $sum: "$games.special.ptsPaint" },
              specialPTSFastb: { $sum: "$games.special.ptsFastb" },
              specialPTSBench: { $sum: "$games.special.ptsBench" },
              specialTies: { $sum: "$games.special.ties" },
              specialLeads: { $sum: "$games.special.leads" },
              specialPOSSCount: { $sum: "$games.special.possCount" },
              specialPOSSTime: { $avg: "$games.special.possTime" },
              specialScoreCount: { $sum: "$games.special.scoreCount" },
              specialScoreTime: { $avg: "$games.special.scoreTime" },
              specialLeadTime: { $avg: "$games.special.leadTime" },
              specialTiedTime: { $avg: "$games.special.tiedTime" },
              specialLargeLead: { $sum: "$games.special.largeLead" },
              specialLargeLeadT: { $sum: "$games.special.largeLeadT" },
            },
          },
          {
            $project: {
              _id: "$_id._id",
              tidyName: "$_id.tidyName",
              name: "$_id.name",
              teamName: "$_id.teamName",
              //started: "$_id.started",
              GP: "$GP",
              scoring: {
                scorePoints: { $add: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
                scorePointsPerGame: { $avg: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
              },
      
              shooting: {
                fgm: "$statsFGM",
                fga: "$statsFGA",
                fgpct: "$statsFGPCT",
                fg3pct: "$statsFG3PCT",
                fgPerGame: "$statsFGPerGame",
                fgp: { $cond: [{ $eq: ["$statsFGA", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM", "$statsFGA"] }, 100] }] },
                fgm3: "$statsFGM3",
                fga3: "$statsFGA3",
                fg3p: { $cond: [{ $eq: ["$statsFGA3", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM3", "$statsFGA3"] }, 100] }] },
                ftm: "$statsFTM",
                fta: "$statsFTA",
                avgFTMPerGame: "$statsFTMPerGame",
              },
      
              rebound: {
                reb: { $add: ["$statsDREB", "$statsOREB"] },
                oreb: "$statsOREB",
                dreb: "$statsDREB",
                treb: "$statsTREB",
                rebPerGame: { $avg: ["$stasdREB", "$statsOREB"] },
              },
      
              assist: {
                ast: "$statsAST",
                astPerGame: "$statsASTPerGame",
              },
      
              turnover: {
                to: "$statsTO",
                toPerGame: "$statsTOPerGame",
                astTORatio: { $cond: [{ $eq: ["$statsTO", 0] }, "N/A", { $multiply: [{ $divide: ["$statsAST", "$statsTO"] }, 100] }] },
              },
      
              steal: {
                stl: "$statsSTL",
                stlPerGame: "$statsSTLPerGame",
              },
      
              block: {
                blk: "$statsBLK",
                blkPerGame: "$statsBLKPerGame",
              },
      
              // stats
              stats: {
      
                tp: "$statsTP",
                min: "$statsMIN",
                pf: "$statsPF",
                tf: "$statsTF",
                //dq "$games.totals.stats.dq",
                deadball: "$statsDeadball",
                ftpct: "$statsFTPCT",
                ftp: { $cond: [{ $eq: ["$statsFTA", 0] }, 0, { $multiply: [{ $divide: ["$statsFTM", "$statsFTA"] }, 100] }] },
              },
              // special
              special: {
                ptsTO: "$specialPTSTO",
                ptsCH2: "$specialPTSCH2",
                ptsPaint: "$specialPTSPaint",
                ptsFastb: "$specialPTSFastb",
                ptsBench: "$specialPTSBench",
                ties: "$specialTies",
                leads: "$specialLeads",
                possCount: "$specialPOSSCount",
                possTime: "$specialPOSSTime",
                scoreCount: "$specialScoreCount",
                scoreTime: "$specialScoreTime",
                leadTime: "$specialLeadTime",
                tiedTime: "$specialTiedTime",
                largeLead: "$specialLargeLead",
                largeLeadT: "$specialLargeLeadT",
              },
            },
          },
        ];
    }

    public getStatsSeasonPipelineBasketball(sportCode: string, playerId: string): any {
        return [
          { $match: { sportCode: sportCode, _id: playerId }, },
          { $unwind: "$games" },
          { "$match": { "games.pos.gp": 1 } },
          {
            $group: {
              _id: {
                _id: playerId,
                tidyName: "$tidyName",
                name: "$name",
                teamName: "$teamName",
                season: "$games.season",
                //started: "$games.started",
              },
              GP: { "$sum": 1 },
              statsFGM: { $sum: "$games.stats.fgm" },
              statsFGA: { $sum: "$games.stats.fga" },
              statsFGPerGame: { $avg: "$games.stats.fgm" },
              statsFGM3: { $sum: "$games.stats.fgm3" },
              statsFGA3: { $sum: "$games.stats.fga3" },
              statsFTM: { $sum: "$games.stats.ftm" },
              statsFTA: { $sum: "$games.stats.fta" },
              statsFTMPerGame: { $avg: "$games.stats.ftm" },
              statsTP: { $sum: "$games.stats.tp" },
              statsBLK: { $sum: "$games.stats.blk" },
              statsBLKPerGame: { $avg: "$games.stats.blk" },
              statsSTL: { $sum: "$games.stats.stl" },
              statsSTLPerGame: { $avg: "$games.stats.stl" },
              statsAST: { $sum: "$games.stats.ast" },
              statsASTPerGame: { $avg: "$games.stats.ast" },
              statsMIN: { $sum: "$games.stats.min" },
              statsOREB: { $sum: "$games.stats.oreb" },
              statsDREB: { $sum: "$games.stats.dreb" },
              statsTREB: { $sum: "$games.stats.treb" },
              statsPF: { $sum: "$games.stats.pf" },
              statsTF: { $sum: "$games.stats.tf" },
              statsTO: { $sum: "$games.stats.to" },
              statsTOPerGame: { $avg: "$games.stats.to" },
      
              //statsDQ: "$games.stats.dq",
              statsDeadball: { $sum: "$games.stats.deadball" },
              statsFGPCT: { $sum: "$games.stats.fgpct" },
              statsFG3PCT: { $sum: "$games.stats.fg3pct" },
              statsFTPCT: { $sum: "$games.stats.ftpct" },
      
              specialPTSTO: { $sum: "$games.special.ptsto" },
              specialPTSCH2: { $sum: "$games.special.ptsch2" },
              specialPTSPaint: { $sum: "$games.special.ptsPaint" },
              specialPTSFastb: { $sum: "$games.special.ptsFastb" },
              specialPTSBench: { $sum: "$games.special.ptsBench" },
              specialTies: { $sum: "$games.special.ties" },
              specialLeads: { $sum: "$games.special.leads" },
              specialPOSSCount: { $sum: "$games.special.possCount" },
              specialPOSSTime: { $avg: "$games.special.possTime" },
              specialScoreCount: { $sum: "$games.special.scoreCount" },
              specialScoreTime: { $avg: "$games.special.scoreTime" },
              specialLeadTime: { $avg: "$games.special.leadTime" },
              specialTiedTime: { $avg: "$games.special.tiedTime" },
              specialLargeLead: { $sum: "$games.special.largeLead" },
              specialLargeLeadT: { $sum: "$games.special.largeLeadT" },
            },
          },
          {
            $project: {
              _id: "$_id._id",
              tidyName: "$_id.tidyName",
              name: "$_id.name",
              teamName: "$_id.teamName",
              season: "$_id.season",
              //started: "$_id.started",
              GP: "$GP",
              scoring: {
                scorePoints: { $add: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
                scorePointsPerGame: { $avg: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
              },
      
              shooting: {
                fgm: "$statsFGM",
                fga: "$statsFGA",
                fgpct: "$statsFGPCT",
                fg3pct: "$statsFG3PCT",
                fgPerGame: "$statsFGPerGame",
                fgp: { $cond: [{ $eq: ["$statsFGA", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM", "$statsFGA"] }, 100] }] },
                fgm3: "$statsFGM3",
                fga3: "$statsFGA3",
                fg3p: { $cond: [{ $eq: ["$statsFGA3", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM3", "$statsFGA3"] }, 100] }] },
                ftm: "$statsFTM",
                fta: "$statsFTA",
                avgFTMPerGame: "$statsFTMPerGame",
              },
      
              rebound: {
                reb: { $add: ["$statsDREB", "$statsOREB"] },
                oreb: "$statsOREB",
                dreb: "$statsDREB",
                treb: "$statsTREB",
                rebPerGame: { $avg: ["$stasdREB", "$statsOREB"] },
              },
      
              assist: {
                ast: "$statsAST",
                astPerGame: "$statsASTPerGame",
              },
      
              turnover: {
                to: "$statsTO",
                toPerGame: "$statsTOPerGame",
                astTORatio: { $cond: [{ $eq: ["$statsTO", 0] }, "N/A", { $multiply: [{ $divide: ["$statsAST", "$statsTO"] }, 100] }] },
              },
      
              steal: {
                stl: "$statsSTL",
                stlPerGame: "$statsSTLPerGame",
              },
      
              block: {
                blk: "$statsBLK",
                blkPerGame: "$statsBLKPerGame",
              },
      
              // stats
              stats: {
      
                tp: "$statsTP",
                min: "$statsMIN",
                pf: "$statsPF",
                tf: "$statsTF",
                //dq "$games.totals.stats.dq",
                deadball: "$statsDeadball",
                ftpct: "$statsFTPCT",
                ftp: { $cond: [{ $eq: ["$statsFTA", 0] }, 0, { $multiply: [{ $divide: ["$statsFTM", "$statsFTA"] }, 100] }] },
              },
              // special
              special: {
                ptsTO: "$specialPTSTO",
                ptsCH2: "$specialPTSCH2",
                ptsPaint: "$specialPTSPaint",
                ptsFastb: "$specialPTSFastb",
                ptsBench: "$specialPTSBench",
                ties: "$specialTies",
                leads: "$specialLeads",
                possCount: "$specialPOSSCount",
                possTime: "$specialPOSSTime",
                scoreCount: "$specialScoreCount",
                scoreTime: "$specialScoreTime",
                leadTime: "$specialLeadTime",
                tiedTime: "$specialTiedTime",
                largeLead: "$specialLargeLead",
                largeLeadT: "$specialLargeLeadT",
              },
            },
          },
        ];
    }

    public getStatsGamePipelineBasketball(sportCode: string, playerId: string): any {
        return [
          { $match: { sportCode: sportCode, _id: playerId }, },
          { $unwind: "$games" },
          { "$match": { "games.pos.gp": 1 } },
          {
            $group: {
              _id: {
                _id: playerId,
                tidyName: "$tidyName",
                name: "$name",
                teamName: "$teamName",
                season: "$games.season",
                opponentName: "$games.opponentName",
                gameId: "$games.gameId",
                gameDate: "$games.actualDate",
                //started: "$games.started",
                playerClass: "$games.playerClass",
              },
              opponentCode: { $first: "$games.opponentCode" },
              statsFGM: { $sum: "$games.stats.fgm" },
              statsFGA: { $sum: "$games.stats.fga" },
              statsFGPerGame: { $avg: "$games.stats.fgm" },
              statsFGM3: { $sum: "$games.stats.fgm3" },
              statsFGA3: { $sum: "$games.stats.fga3" },
              statsFTM: { $sum: "$games.stats.ftm" },
              statsFTA: { $sum: "$games.stats.fta" },
              statsFTMPerGame: { $avg: "$games.stats.ftm" },
              statsTP: { $sum: "$games.stats.tp" },
              statsBLK: { $sum: "$games.stats.blk" },
              statsBLKPerGame: { $avg: "$games.stats.blk" },
              statsSTL: { $sum: "$games.stats.stl" },
              statsSTLPerGame: { $avg: "$games.stats.stl" },
              statsAST: { $sum: "$games.stats.ast" },
              statsASTPerGame: { $avg: "$games.stats.ast" },
              statsMIN: { $sum: "$games.stats.min" },
              statsOREB: { $sum: "$games.stats.oreb" },
              statsDREB: { $sum: "$games.stats.dreb" },
              statsTREB: { $sum: "$games.stats.treb" },
              statsPF: { $sum: "$games.stats.pf" },
              statsTF: { $sum: "$games.stats.tf" },
              statsTO: { $sum: "$games.stats.to" },
              statsTOPerGame: { $avg: "$games.stats.to" },
      
              //statsDQ: "$games.stats.dq",
              statsDeadball: { $sum: "$games.stats.deadball" },
              statsFGPCT: { $sum: "$games.stats.fgpct" },
              statsFG3PCT: { $sum: "$games.stats.fg3pct" },
              statsFTPCT: { $sum: "$games.stats.ftpct" },
      
              specialPTSTO: { $sum: "$games.special.ptsto" },
              specialPTSCH2: { $sum: "$games.special.ptsch2" },
              specialPTSPaint: { $sum: "$games.special.ptsPaint" },
              specialPTSFastb: { $sum: "$games.special.ptsFastb" },
              specialPTSBench: { $sum: "$games.special.ptsBench" },
              specialTies: { $sum: "$games.special.ties" },
              specialLeads: { $sum: "$games.special.leads" },
              specialPOSSCount: { $sum: "$games.special.possCount" },
              specialPOSSTime: { $avg: "$games.special.possTime" },
              specialScoreCount: { $sum: "$games.special.scoreCount" },
              specialScoreTime: { $avg: "$games.special.scoreTime" },
              specialLeadTime: { $avg: "$games.special.leadTime" },
              specialTiedTime: { $avg: "$games.special.tiedTime" },
              specialLargeLead: { $sum: "$games.special.largeLead" },
              specialLargeLeadT: { $sum: "$games.special.largeLeadT" },
            },
          },
          {
            $project: {
              _id: "$_id.gameId",
              tidyName: "$_id.tidyName",
              name: "$_id.name",
              teamName: "$_id.teamName",
              gameDate: "$_id.gameDate",
              opponentName: "$_id.opponentName",
              playerClass: "$_id.playerClass",
              season: "$_id.season",
              opponentCode: "$opponentCode",
              //started: "$_id.started",
              scoring: {
                scorePoints: { $add: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
                scorePointsPerGame: { $avg: ["$statsFGM", "$statsFGM3", "$statsFTM"] },
              },
      
              shooting: {
                fgm: "$statsFGM",
                fga: "$statsFGA",
                fgpct: "$statsFGPCT",
                fg3pct: "$statsFG3PCT",
                fgPerGame: "$statsFGPerGame",
                fgp: { $cond: [{ $eq: ["$statsFGA", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM", "$statsFGA"] }, 100] }] },
                fgm3: "$statsFGM3",
                fga3: "$statsFGA3",
                fg3p: { $cond: [{ $eq: ["$statsFGA3", 0] }, 0, { $multiply: [{ $divide: ["$statsFGM3", "$statsFGA3"] }, 100] }] },
                ftm: "$statsFTM",
                fta: "$statsFTA",
                avgFTMPerGame: "$statsFTMPerGame",
              },
      
              rebound: {
                reb: { $add: ["$statsDREB", "$statsOREB"] },
                oreb: "$statsOREB",
                dreb: "$statsDREB",
                treb: "$statsTREB",
                rebPerGame: { $avg: ["$stasdREB", "$statsOREB"] },
              },
      
              assist: {
                ast: "$statsAST",
                astPerGame: "$statsASTPerGame",
              },
      
              turnover: {
                to: "$statsTO",
                toPerGame: "$statsTOPerGame",
                astTORatio: { $cond: [{ $eq: ["$statsTO", 0] }, 0, { $multiply: [{ $divide: ["$statsAST", "$statsTO"] }, 100] }] },
              },
      
              steal: {
                stl: "$statsSTL",
                stlPerGame: "$statsSTLPerGame",
              },
      
              block: {
                blk: "$statsBLK",
                blkPerGame: "$statsBLKPerGame",
              },
      
              // stats
              stats: {
      
                tp: "$statsTP",
                min: "$statsMIN",
                pf: "$statsPF",
                tf: "$statsTF",
                //dq "$games.totals.stats.dq",
                deadball: "$statsDeadball",
                ftpct: "$statsFTPCT",
              },
              // special
              special: {
                ptsTO: "$specialPTSTO",
                ptsCH2: "$specialPTSCH2",
                ptsPaint: "$specialPTSPaint",
                ptsFastb: "$specialPTSFastb",
                ptsBench: "$specialPTSBench",
                ties: "$specialTies",
                leads: "$specialLeads",
                possCount: "$specialPOSSCount",
                possTime: "$specialPOSSTime",
                scoreCount: "$specialScoreCount",
                scoreTime: "$specialScoreTime",
                leadTime: "$specialLeadTime",
                tiedTime: "$specialTiedTime",
                largeLead: "$specialLargeLead",
                largeLeadT: "$specialLargeLeadT",
              },
            },
          },
          { $sort: { gameDate: 1 } },
        ];
    }
}