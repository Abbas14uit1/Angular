import { async, getTestBed, inject, TestBed } from "@angular/core/testing";
import { MaterialModule } from "../../material/material.module";

import { BaseRequestOptions, Http, HttpModule, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import * as moment from "moment";
import "rxjs/add/operator/map";
import { IRoster } from "../../../../../typings/athlyte/football/dashboard/roster.d";
import { ISeasonGame } from "../../../../../typings/athlyte/football/dashboard/season.d";
import { IGame } from "../../../../../typings/athlyte/football/game.d";
import {
  IGameFullRosterPlayer,
  IGameInfo,
  IGameStarterRosterPlayer,
  IPlayerDefense,
  IPlayerFumbles,
  IPlayerInterceptions,
  IPlayerPassing,
  IPlayerReceiving,
  IPlayerRushing,
  ITeamGame,
  ITeamStats,
} from "../../../../../typings/athlyte/football/game/game.d";
import { IFieldPosition, VH } from "../../../../../typings/athlyte/football/index.d";
import { IPlayer } from "../../../../../typings/athlyte/football/player.d";
import { ITeam } from "../../../../../typings/athlyte/football/team.d";

import { NgModule } from "@angular/core";
import { GameService } from "./game.service";

describe("GameService", () => {
  let backend: MockBackend;
  let service: GameService;

  // sample data
  const testGames: IGame[] = [
    {
      _id: "testId",
      sportCode: "MFB",
      meta: {
        startTime: new Date("2011-04-11T10:20:30Z"),
        endTime: new Date("2011-04-11T10:20:30Z"),
        officials: [
          {
            pos: "testPos",
            name: "testName",
          },
        ],
        rules: {
          quarters: 4,
          minutes: 60,
          downs: 4,
          yards: 100,
          kickoffSpot: 20,
          touchbackSpot: 25,
          kickoffTouchbackSpot: 0,
        },
      },
      venue: {
        geoLocation: "test, T",
        stadiumName: "greatStadium",
        neutralLocation: false,
        nightGame: false,
        conferenceGame: true,
        postseasonGame: false,
        attendance: 100,
        gameType: ["Regular Season"],
      },
      team: {
        home: {
          id: "testHomeId",
          code: 0,
          conf: "Big 10",
          confDivision: "",
          name: "testHome",
          score: 50,
        },
        visitor: {
          id: "testVisitorId",
          code: 1,
          conf: "Big 10",
          confDivision: "",
          name: "testVisitor",
          score: 50,
        },
      },
      summary: {
        scores: [1, 2, 3, 4],
        drives: [[1, 2, 4]],
        driveDetails: [{
          drivingTeam: 1,
          drivingTeamName: "testHomeId",
          startPlay: {
            playType: "test",
            quarter: 1,
            clock: "test",
            fieldPos: {
              side: 1,
              yardline: 1,
              endzone: false,
            },
          },
          endPlay: {
            playType: "test",
            quarter: 1,
            clock: "test",
            fieldPos: {
              side: 1,
              yardline: 1,
              endzone: false,
            },
          },
          plays: 1,
          yards: 5,
          timeOfPossession: "test",
        }],
        fgas: [1, 2, 3],
        longplay: [1, 2, 3],
      },
      gameDate: new Date("10/10/2000"),
      actualDate: "10/10/2000",
      season: 2016,
      playerIds: ["test", "test", "test"],
      teamIds: {
        home: "testHomeId",
        visitor: "testVisitorId",
      },
      playIds: ["test", "test", "test"],
      updateTime: new Date("2021-04-11T10:20:30Z"),
    },
  ];

  const testTeams: ITeam[] = [
    {
      code: 1,
      name: "testTeam",
      tidyName: "TT",
      games: {
        teamId: "testTeamId",
        gameId: "testId",
        opponentCode: 102,
        conference: "Big 10",
        conferenceDivision: "",
        opponentConference: "Big 10",
        opponentConferenceDivision: "",
        opponentName: "testOpponent",
        gameDate: new Date("10/10/2000"),
        sportCode: "MFB",
        actualDate: "10/10/2000",
        season: 2016,
        homeAway: 0,
        players: ["test", "test", "test"],
        linescore: {
          score: 20,
          periods: [
            {
              period: 1,
              score: 5,
            },
            {
              period: 2,
              score: 5,
            },
            {
              period: 3,
              score: 5,
            },
            {
              period: 4,
              score: 5,
            },
          ],
        },
        totals: {
          firstdowns: {
            fdTotal: 0,
            fdRush: 0,
            fdPass: 0,
            fdPenalty: 0,
          },
          penalties: {
            penTotal: 0,
            penYards: 0,
          },
          conversions: {
            convThird: 0,
            convThirdAtt: 0,
            convFourth: 0,
            convFourthAtt: 0,
          },
          redzone: {
            redAtt: 0,
            redScores: 0,
            redPoints: 0,
            redTdRush: 0,
            redTdPass: 0,
            redFgMade: 0,
            redEndFga: 0,
            redEndDown: 0,
            redEndInt: 0,
            redEndFumb: 0,
            redEndHalf: 0,
            redEndGame: 0,
          },
        },
        qtrTotals: [{
          qtrNum: 1,
          firstdowns: {
            fdTotal: 0,
            fdRush: 0,
            fdPass: 0,
            fdPenalty: 0,
          },
          penalties: {
            penTotal: 0,
            penYards: 0,
          },
          conversions: {
            convThird: 0,
            convThirdAtt: 0,
            convFourth: 0,
            convFourthAtt: 0,
          },
          redzone: {
            redAtt: 0,
            redScores: 0,
            redPoints: 0,
            redTdRush: 0,
            redTdPass: 0,
            redFgMade: 0,
            redEndFga: 0,
            redEndDown: 0,
            redEndInt: 0,
            redEndFumb: 0,
            redEndHalf: 0,
            redEndGame: 0,
          },
	      }],
        homeTeam: {
          id: "testHomeId",
          code: 0,
          conf: "Big 10",
          confDivision: "",
          name: "testHome",
          score: 50,
        },
        visitorTeam: {
          id: "testVisitorId",
          code: 1,
          conf: "Big 10",
          confDivision: "",
          name: "testVisitor",
          score: 50,
        },
        gameType: ["Regular Season"],
        geoLocation: "greatLocation",
        attendance: 100,
        nightGame: false,
        neutralLocation: false,
        startTime: new Date("2011-04-11T10:20:30Z"),
      },
    },
  ];

  const testPlayers: IPlayer[] = [
    {
      _id: "testId",
      name: "testPlayer",
      teamCode: 101,
      tidyName: "testPlayer",
      teamName: "teastTeam",
      teamConference: "Southeastern Conference",
      teamConferenceDivision: "West",
      teamId: "testTeamId",
      teamTidyName: "testTeamTidyName",
      sportCode: "MFB",
      games: [{
        gameId: "testId",
        season: 2016,
        playerClass: "FR",
        uniform: "20",
        pos: {
          opos: "testPos",
        },
        opponentCode: 102,
        opponentName: "testOpponent",
        opponentConference: "Pac-12 Conference",
        opponentConferenceDivision: "North",
        started: true,
        side: 1,
        codeInGame: "testCode",
        plays: ["test", "test", "test"],
        stats: {
          fumble: {
            fumbTotal: 0,
            fumbLost: 0,
          },
          receiving: {
            rcvNum: 0,
            rcvYards: 0,
            rcvTd: 0,
            rcvLong: 0,
          },
          intReturn: {
            irNo: 0,
            irYards: 0,
            irTd: 0,
            irLong: 0,
          },
          pass: {
            passComp: 0,
            passAtt: 0,
            passInt: 0,
            passYards: 0,
            passTd: 0,
            passLong: 0, // longest pass
            passSacks: 0, // number of sacks
            passSackYards: 0, // yards lost from sacks
          },
          rushing: {
            rushAtt: 0,
            rushYards: 0,
            rushGain: 0,
            rushLoss: 0,
            rushTd: 0,
            rushLong: 0, // longest rush
          },
          defense: {
            dTackUa: 0,    // tackle unassisted
            dTackA: 0,
            dTackTot: 0,
            dTflua: 0,
            dTfla: 0,
            dTflyds: 0,
            dSacks: 0,
            dSackUa: 0,
            dSackA: 0,
            dSackYards: 0,
            dBrup: 0,
            dFf: 0,
            dFr: 0,
            dFryds: 0,
            dInt: 0,
            dIntYards: 0,
            dQbh: 0,
            dblkd: 0,
          },
        },
        gameDate: new Date("10/10/2000"),
        actualDate: "10/10/2000",
      }],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpModule],
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backendInstance: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions],
        },
        GameService,
      ],
    });
    const testbed = getTestBed();
    backend = testbed.get(MockBackend);
    service = testbed.get(GameService);
  });

  // tslint:disable-next-line:no-shadowed-variable
  function setupConnections(backend: MockBackend, options: any) {
    backend.connections.subscribe((connection: MockConnection) => {
      if (connection.request.url === "api_v1/game") {
        const responseOptions = new ResponseOptions(options);
        const response = new Response(responseOptions);

        connection.mockRespond(response);
      }
    });
  }

  // tslint:disable-next-line:no-shadowed-variable
  it("should be created", inject([GameService], (service: GameService) => {
    expect(service).toBeTruthy();
  }));

  it("should return game info", () => {
    setupConnections(backend, {
      body: testGames,
      status: 200,
    });

    service.getGameInfo("testId", "testId").subscribe((data: IGameInfo[]) => {
      expect(data.length).toBe(1);
      expect(data[0].gameDate).toBe(new Date("10/10/2000"));
      expect(data[0].actualDate).toBe("10/10/2000");
      expect(data[0].venue.attendance).toBe(100);
    });
  });
  it("should return team games", () => {
    setupConnections(backend, {
      body: testGames,
      status: 200,
    });

    service.getTeamGames("testId", "testId").subscribe((data: ITeamGame[]) => {
      expect(data.length).toBe(1);
      expect(data[0].gameSpecificData.gameDate).toBe(new Date("10/10/2000"));
      expect(data[0].gameSpecificData.actualDate).toBe("10/10/2000");
    });
  });

  it("should return team stats", () => {
    setupConnections(backend, {
      body: testTeams,
      status: 200,
    });

    service.getOverallTeamStats("testId", "testId").subscribe((data: ITeamStats[]) => {
      expect(data.length).toBe(1);
      expect(data[0].fds).toBe(0);
    });
  });

  it("should return player rushing stats", () => {
    setupConnections(backend, {
      body: testPlayers,
      status: 200,
    });

    service.getPlayerRushing("testId", "testId", "testId").subscribe((data: IPlayerRushing[]) => {
      expect(data.length).toBe(1);
      expect(data[0].attempts).toBe(0);
      expect(data[0].long).toBe(0);
      expect(data[0].name).toBe("testPlayer");
      expect(data[0].touchdowns).toBe(0);
      expect(data[0].yards).toBe(0);
    });
  });

  // it("should return player receiving stats", () => {
  //   setupConnections(backend, {
  //     body: testPlayers,
  //     status: 200,
  //   });

  //   service.getPlayerReceiving("testId", "testId").subscribe((data: IPlayerReceiving[]) => {
  //     expect(data.length).toBe(1);
  //     expect(data[0].receptions).toBe(0);
  //     expect(data[0].long).toBe(0);
  //     expect(data[0].name).toBe("testPlayer");
  //     expect(data[0].touchdowns).toBe(0);
  //     expect(data[0].yards).toBe(0);
  //   });
  // });
  it("should return player passing stats", () => {
    setupConnections(backend, {
      body: testPlayers,
      status: 200,
    });

    service.getPlayerPassing("testId", "testId", "testId").subscribe((data: IPlayerPassing[]) => {
      expect(data.length).toBe(1);
      expect(data[0].attempts).toBe(0);
      expect(data[0].name).toBe("testPlayer");
      expect(data[0].touchdowns).toBe(0);
      expect(data[0].yards).toBe(0);
    });
  });

  it("should return player defense stats", () => {
    setupConnections(backend, {
      body: testPlayers,
      status: 200,
    });

    service.getPlayerDefense("testId", "testId", "testId").subscribe((data: IPlayerDefense[]) => {
      expect(data.length).toBe(1);
      expect(data[0].assists).toBe(0);
      expect(data[0].name).toBe("testPlayer");
      expect(data[0].interceptions).toBe(0);
      expect(data[0].tackles).toBe(0);
    });
  });

  it("should return player interception stats", () => {
    setupConnections(backend, {
      body: testPlayers,
      status: 200,
    });

    service.getPlayerInterceptions("testId", "testId", "testId").subscribe((data: IPlayerInterceptions[]) => {
      expect(data.length).toBe(1);
      expect(data[0].long).toBe(0);
      expect(data[0].num).toBe("testPlayer");
      expect(data[0].touchdowns).toBe(0);
      expect(data[0].yards).toBe(0);
    });
  });

  it("should return player fumble stats", () => {
    setupConnections(backend, {
      body: testPlayers,
      status: 200,
    });

    service.getPlayerFumbles("testId", "testId", "testId").subscribe((data: IPlayerFumbles[]) => {
      expect(data.length).toBe(1);
      expect(data[0].total).toBe(0);
      expect(data[0].name).toBe("testPlayer");
      expect(data[0].lost).toBe(0);
    });
  });
});
