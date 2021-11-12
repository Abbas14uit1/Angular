import * as mongo from "mongodb";

import { winstonLogger } from "../../../winstonLogger";
import { VH } from "../../AthlyteImporter";
import { parseScore } from "./helpers/scoreParser";
import * as playParser from "./helpers/playParser";
import { BaseballStatcrewImportBase } from "../BaseballStatcrewImportBase";
import { Game } from "./game";
import { Player } from "./player";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/baseball";
import * as AthlytePlay from "../../../../../../../typings/athlyte/baseball/play.d";
import { IStatcrewBaseballJSON } from "../../../../../../../typings/statcrew/baseball";
import * as StatcrewPlay from "../../../../../../../typings/statcrew/baseball/play.d";

/**
 * PlayClass manages the entire lifecycle of games,
 * from parsing the play data (from the output of xml2js)
 * to saving to Mongo.
 */
export class Play extends BaseballStatcrewImportBase {
  

  public parsedData: AthlytePlay.IPlay;
  private batInPlayVisitor: number = 0;
  private batInPlayHome: number = 0;
  private outInPlayVisitor: number = 0;
  private outInPlayHome: number = 0;

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
  public async generateId(db: mongo.Db, sportCode: "MBA" | "WSB"): Promise<string> {
    return Promise.resolve(new mongo.ObjectID().toHexString());
  }

  /**
   * Add a player's ID to the list of players involved in this play.
   * Replace the previous code in game used to represent players with the id in the play results
   * @param id ID of a player involved in this play
   */
  public updatePlayerRef(id: string, codeInGame: string): void {
    this.parsedData.playerIds.forEach((playerId,index) => {
      if (playerId == codeInGame){
        this.parsedData.playerIds[index] = id;        
      }
    })
    //this.parsedData.playerIds.push(id);
    let results: string[] = [];
    if (this.parsedData.results) {
      results = Object.getOwnPropertyNames(this.parsedData.results);
    }

    if(this.parsedData.results.sub && this.parsedData.results.sub.forId == codeInGame){
      this.parsedData.results.sub.forId = id;
    }

    if(this.parsedData.results.sub && this.parsedData.results.sub.whoId == codeInGame){
      this.parsedData.results.sub.whoId = id;
    }

    if(this.parsedData.results.batter && this.parsedData.results.batter.id === codeInGame){
      this.parsedData.results.batter.id = id;
    }

    if(this.parsedData.results.pitcher && this.parsedData.results.pitcher.id === codeInGame){
      this.parsedData.results.pitcher.id = id;
    }

    if(this.parsedData.results.runner && this.parsedData.results.runner.id === codeInGame){
      this.parsedData.results.runner.id = id;
    }

    if(this.parsedData.results.fielder){
      this.parsedData.results.fielder.forEach((fielder,index)=>{
          if(fielder.id === codeInGame && this.parsedData.results.fielder){
          this.parsedData.results.fielder[index].id = id;
        }
      });      
    }
    
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
  public parse(inputPlay: StatcrewPlay.IPlay, inningNumber: number, possession: string, teamId: string, sportCode: "MBA" | "WSB" ) {

    let sanitizedPossession: VH;
    
    if (possession !== "V" && possession !== "H") {
      throw new TypeError("Unexpected possession");
    } else {
      sanitizedPossession = possession === "H" ? VH.home : VH.visitor;
    }

    let batter: AthlytePlay.IBatter | undefined ;
    let outs=0;
    if(inputPlay.batter){
        batter = playParser.parseBatter(inputPlay.batter[0]);
      
      if(batter.out == 1){
        outs = possession ==="H"?++this.outInPlayHome: ++this.outInPlayVisitor;
      }
      else{
        outs = possession ==="H"?this.outInPlayHome: this.outInPlayVisitor;
      }
    }

    
    const playInBat = possession ==="H"?this.batInPlayHome++: this.batInPlayVisitor++;

    this.parsedData = {
      gameId: "",
      sportCode: sportCode,      
      possession: sanitizedPossession,
      inningNumber,
      playInBat,
      playInGame: inputPlay.$.seq,
      outs,
      description: inputPlay.narrative[0].$.text,
      batProf: inputPlay.$.batprof,
      pitchProf: inputPlay.$.pchprof,
      results: {
        batter: batter=== undefined?undefined : batter,
        sub: inputPlay.sub?playParser.parseSub(inputPlay.sub[0]) : undefined,
        runner: inputPlay.runner?playParser.parseRunner(inputPlay.runner[0]) : undefined,
        pitches: inputPlay.pitches?playParser.parsePitches(inputPlay.pitches[0]): undefined,
        pitcher: inputPlay.pitcher?playParser.parsePitcher(inputPlay.pitcher[0]): undefined,
        fielder: inputPlay.fielder?playParser.parseFielder(inputPlay.fielder): undefined,      
      },
      score: inputPlay.runner?inputPlay.runner[0].$.scored?Number(inputPlay.runner[0].$.scored):0:0,
      playerIds: [],
      narrative: inputPlay.narrative[0].$.text,      
    }    

    if(this.parsedData.results.batter && batter){
      this.parsedData.playerIds.push(batter.id?batter.id:"");  
    }
    
    if(this.parsedData.results.runner){
      this.parsedData.playerIds.push(this.parsedData.results.runner.id?this.parsedData.results.runner.id:"");  
    }    
    if(this.parsedData.results.pitcher){
      this.parsedData.playerIds.push(this.parsedData.results.pitcher.id?this.parsedData.results.pitcher.id:"");  
    }
    if(this.parsedData.results.fielder){
      this.parsedData.results.fielder.forEach((fielder,index)=>{
        this.parsedData.playerIds.push(fielder.id?fielder.id:"");
      });  
    }
    
    

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
export function parsePlays(input: StatcrewPlay.IAllPlaysSummary, sportCode: "MBA" | "WSB"): Play[] {
  let plays: Play[] = [];
  for (const inning of input.inning) {
    const inningNum = inning.$.number;
      for (const batInning of inning.batting) {
        const vh: string = batInning.$.vh;
        const teamId: string = batInning.$.id;
        const playsInInning = batInning.play.map((inputPlay) => {
          const play = new Play();
          play.parse(inputPlay, inningNum, vh, teamId, sportCode);
          return play;
        });
        plays = plays.concat(playsInInning);
      }
  }
  return plays;
}
