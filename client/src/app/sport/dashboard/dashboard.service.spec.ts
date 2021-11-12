import { NgModule } from "@angular/core";
import { async, getTestBed, inject, TestBed } from "@angular/core/testing";
import { MaterialModule } from "../../material/material.module";

import { BaseRequestOptions, Http, HttpModule, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import * as moment from "moment";
import { IRoster } from "../../../../../typings/athlyte/football/dashboard/roster.d";
import { ISeasonGame } from "../../../../../typings/athlyte/football/dashboard/season.d";
import { IGame } from "../../../../../typings/athlyte/football/game.d";
import { IFieldPosition, VH } from "../../../../../typings/athlyte/football/index.d";
import { DashboardService } from "./dashboard.service";

describe("DashboardService", () => {
  let backend: MockBackend;
  let service: DashboardService;

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

  beforeEach(async(() => {
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
        DashboardService,
      ],
    });
    const testbed = getTestBed();
    backend = testbed.get(MockBackend);
    service = testbed.get(DashboardService);
  }));

  // tslint:disable-next-line:no-shadowed-variable
  function setupConnections(backend: MockBackend, options: any) {
    backend.connections.subscribe((connection: MockConnection) => {
      if (connection.request.url === "api_v1/dashboard") {
        const responseOptions = new ResponseOptions(options);
        const response = new Response(responseOptions);

        connection.mockRespond(response);
      } else if (connection.request.url === "api_v1/dashboard/season/:year/:teamId") {
        const responseOptions = new ResponseOptions(options);
        const response = new Response(responseOptions);
      }
    });
  }

  // tslint:disable-next-line:no-shadowed-variable
  it("should be created", inject([DashboardService], (service: DashboardService) => {
    expect(service).toBeTruthy();
  }));

  it("should return game season data", () => {
    setupConnections(backend, {
      body: testGames,
      status: 200,
    });

    service.getSeason(2016, "testId", "testId").subscribe((data: ISeasonGame[]) => {
      expect(data.length).toBe(1);
      expect(data[0]._id).toBe("testId");
    });
  });

  it("should return seasons", () => {
    setupConnections(backend, {
      body: testGames,
      status: 200,
    });

    service.getSeasons("testId", "testId").subscribe((data: any[]) => {
      expect(data.length).toBe(1);
      expect(data[0]).toBe(2016);
    });
  });

  it("should return roster", () => {
    setupConnections(backend, {
      body: testGames,
      status: 200,
    });

    service.getSeasonRoster(2016, "testId", "testId").subscribe((data: IRoster[]) => {
      expect(data.length).toBe(3);
      expect(data[0]._id).toBe("test");
    });
  });

});
