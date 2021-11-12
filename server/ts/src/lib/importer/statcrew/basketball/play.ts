import * as mongo from "mongodb";

import { winstonLogger } from "../../../winstonLogger";
import { VH } from "../../AthlyteImporter";
import { parseScore } from "./helpers/scoreParser";
import { constructDescription } from "./helpers/playParser";
import { BasketballStatcrewImportBase } from "../BasketballStatcrewImportBase";
import { Game } from "./game";
import { Player } from "./player";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/basketball";
import * as AthlytePlay from "../../../../../../../typings/athlyte/basketball/play.d";
import { IStatcrewBasketballJSON } from "../../../../../../../typings/statcrew/basketball";
import * as StatcrewPlay from "../../../../../../../typings/statcrew/basketball/play.d";

/**
 * PlayClass manages the entire lifecycle of games,
 * from parsing the play data (from the output of xml2js)
 * to saving to Mongo.
 */
export class Play extends BasketballStatcrewImportBase {
  /**
   * Convert a starting location string into an object with side and yardline properties
   * @param startPos Starting position string, in format V20, H35, or similar
   */
  

  public parsedData: AthlytePlay.IPlay;
  /**
   * Games and players need to know the ID of plays before saving to Mongo
   */
  public dependents: Array<Game | Player>;

  constructor() {
    super();
    this.dependents = [];
    this.parsedData = {
      _id: undefined,
      gameId: undefined,
      playerIds: [],
    } as any;
  }

  /**
   * Generate a new play ID. Since plays are unique to each game,
   * no need to check Mongo for an already-existing similar play.
   * @param db Mongo DB (here for compatability with base class)
   */
  public async generateId(db: mongo.Db, sportCode: "MBB" | "WBB"): Promise<string> {
    return Promise.resolve(new mongo.ObjectID().toHexString());
  }

  /**
   * Add a player's ID to the list of players involved in this play.
   * Replace the previous code in game used to represent players with the id in the play results
   * @param id ID of a player involved in this play
   */
  public updatePlayerRef(id: string, codeInGame: string): void {
    var index = this.parsedData.playerIds.indexOf(codeInGame);
    if (index !== -1) {
      this.parsedData.playerIds[index] = id;
    }    
    let results: string[] = [];
    
  }

  /**
   * Associate a play with a game.
   * @param id The ID of the game that this play is a part of
   */
  public updateGameRef(id: string) {
    this.parsedData.gameId = id;
  }

  /**
   * Prepare dynamic data for save.
   * For a play, all data is dynamic. No play will add to information
   * to an already-existing play.
   */
  public prepareDynamicData(): Athlyte.IPlay {
    if (this.parsedData._id === undefined ||
      this.parsedData.gameId === undefined) {
      // does not check players, since it may be empty on occasion
      throw new Error("Trying to save data before all fields have been populated");
    } else {
      return this.parsedData;
    }
  }

  /* istanbul ignore next */
  /**
   * Getting static data is a noop for Play; all data is dynamic
   */
  public prepareStaticData(): void {
    return;
  }

  /**
   * Update dependents (other classes which have registered as a dependent
   * of SavePlay). Calling this function results in the ID of this play
   * being passed on to instances of Player and Game save classes.
   */
  public updateDependents() {
    //throw new Error("this is a tragedy");
    for (const dependent of this.dependents) {      
      if (dependent instanceof Player ||
        dependent instanceof Game) {
        dependent.updatePlayRef(this.getId());
      } else {
        throw new Error("Only players and games should be dependents of a play");
      }
    }
  }

  /**
   * Parse play information from Statcrew's format to our own Athlyte format
   * @param inputPlay the play information
   * @param quarter the quarter the play occured in
   */
  public parse(inputPlay: StatcrewPlay.ISinglePlay, period: number, periodTime: string, periodClock: string, sportCode: "MBB" | "WBB") {
    //const [possession, down, togo, startFieldPos] = inputPlay.$.context.split(",");
    //const [drive, playIndexInDrive, playInGame] = inputPlay.$.playid.split(",");    
    const [minutes, seconds] = inputPlay.$.time ? inputPlay.$.time.split(":") : ["0", "0"];
    const possession = inputPlay.$.vh;
    let sanitizedPossession: VH;
    
    sanitizedPossession = possession === "H" ? VH.home : VH.visitor;    

    //winstonLogger.log("info","Name: "  + inputPlay.$.checkname);
    const playerNames: string[] = [inputPlay.$.checkname.replace(',',' ')];
    const type: string = inputPlay.$.type === undefined ? "": inputPlay.$.type;
    const paint: string = inputPlay.$.paint === undefined ? "" : inputPlay.$.paint;
    const uni: string = possession+inputPlay.$.uni;


    //const tokenParser = new TokenParser(inputPlay.$.tokens, sanitizedPossession, inputPlay.$.turnover);
   /* let parsedTokens: AthlytePlay.IPlayResults;
    try {
      parsedTokens = tokenParser.parse();
    } catch (err) {
      winstonLogger.log("error", "unexpected tokens " + inputPlay.$.tokens);
      winstonLogger.log("error", err.message)
      parsedTokens = { playersInvolved: [] };
    } 
    const playStartLocation: Athlyte.IFieldPosition = Play.parsePlayStartLocation(startFieldPos);*/

    this.parsedData = {
      gameId: "",
      sportCode: sportCode,
      playerIds: [uni],
      possession: sanitizedPossession,
      period: period,  
      playInGame: inputPlay.$.seq,
      overtime: period > 2?true:false,    
      playerNames: playerNames,
      gameClockStartTime: { minutes: Number.parseInt(minutes), seconds: Number.parseInt(seconds) },
      action: inputPlay.$.action,
      type: type,
      description: constructDescription(playerNames[0],inputPlay.$.team,inputPlay.$.action,type), 
      //resultedInFirstDown: inputPlay.$.first !== undefined ? true : false,
      //description: playDescription,
      //turnover: inputPlay.$.turnover, // todo: change F, I, etc. to more descriptive names
      score: parseScore(sanitizedPossession, type, String(inputPlay.$.uni), inputPlay.$.hscore, inputPlay.$.vscore) || undefined,
      possessionTeamName: inputPlay.$.team,
      possessionTeamCode: 0
    };
  }

  /**
   * Save a single play to Mongo.
   * Currently useful for testing; might later be useful for live game support
   * @param db Mongo DB
   */
  public save(db: mongo.Db): Promise<string> {
    return db.collection("plays").insertOne(this.prepareDynamicData())
      .then(() => this.getId());
  }

  /**
   * Get the data in this play ready for batch saving with mongo's insertMany function
   */
  public prepareForBatchSave() {
    return this.prepareDynamicData();
  }
}

/**
 * Helper function to automate the parsing of all plays in a games
 * @param input List of all plays
 */
export function parsePlays(input: StatcrewPlay.IPlays, sportCode: "MBB" | "WBB"): Play[] {
  let plays: Play[] = [];
  if (input.period !== undefined){
    for (const period of input.period) {    
      const periodNum = period.$.number;
      const periodTime = period.$.time;
      const periodClock = period.clock[0].$.time;
      const playsInPeriod = period.play.map((inputPlay) => {
        const play = new Play();
        play.parse(inputPlay, periodNum, periodTime, periodClock, sportCode);
        return play;
      });
      plays = plays.concat(playsInPeriod);
    }
  }
  return plays;
}
