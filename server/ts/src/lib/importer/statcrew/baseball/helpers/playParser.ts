import { winstonLogger } from "../../../../winstonLogger";

import * as Athlyte from "../../../../../../../../typings/athlyte/baseball/";
import { PlayerId } from "../../../../../../../../typings/athlyte/baseball/index.d";
import * as AthlytePlay from "../../../../../../../../typings/athlyte/baseball/play.d";
import { IStatcrewBaseballJSON } from "../../../../../../../../typings/statcrew/baseball";
import * as StatcrewPlay from "../../../../../../../../typings/statcrew/baseball/play.d";
import { VH } from "../../../AthlyteImporter";
import { Player } from "../player";



  /**
   * Parse the batter information and returns the athlyte batter compatible data
   * @param batter is a StatcrewPlay.IBatter object.
  */

  export function parseBatter(batter: StatcrewPlay.IBatter): AthlytePlay.IBatter {
       
    return {
      name: batter.$.name,
      id: batter.$.code,
      action: batter.$.action,
      out: batter.$.out,
      adv: batter.$.adv,
      tobase: batter.$.tobase,
      ab: batter.$.ab,
      k: batter.$.k,
      kl: batter.$.kl,
      flyout: batter.$.flyout,
      wherehit: batter.$.wherehit,  
    }
  }

  /**
   * Parse the pitcher information and returns the athlyte pitcher compatible object
   * @param pitcher is a StatcrewPlay.IPitcher object.
  */

  export function parsePitcher(pitcher: StatcrewPlay.IPitcher): AthlytePlay.IPitcher {
      
    return {
      name: pitcher.$.name,
      id: pitcher.$.code,
      bf: pitcher.$.bf,
      ip: pitcher.$.ip,
      ab: pitcher.$.ab,
      k: pitcher.$.k,
      kl: pitcher.$.kl,
      flyout: pitcher.$.flyout,
    }
  }

  /**
   * Parse the pitches information and returns the athlyte pitches compatible object
   * @param pitches is a StatcrewPlay.IPitches object.
  */

  export function parsePitches(pitches: StatcrewPlay.IPitches): AthlytePlay.IPitches {
      
    return {
      text: pitches.$.text,
      b: pitches.$.b,
      s: pitches.$.s,
    }
  }

  /**
   * Parse the fielder information and returns the athlyte fielder compatible object
   * @param fielder is a StatcrewPlay.IFielder object.
  */

  export function parseFielder(fielder: StatcrewPlay.IFielder[]): AthlytePlay.IFielder[] {      
    const athyteFielder: AthlytePlay.IFielder[] =[];
    if( !fielder) {
      return athyteFielder;
    }
    fielder.forEach((fielderInstance,index)=>{
      athyteFielder.push({        
        pos: fielderInstance.$.pos,
        name: fielderInstance.$.name,
        id: fielderInstance.$.code,
        po: fielderInstance.$.po,
        a: fielderInstance.$.a,
      });
    });
    return athyteFielder;
  }

  /**
   * Parse the runner information and returns the athlyte runner compatible object
   * @param runner is a StatcrewPlay.IRunner object.
  */

  export function parseRunner(runner: StatcrewPlay.IRunner): AthlytePlay.IRunner | undefined {
    
    return {
      base: runner.$.base,
      name: runner.$.name,
      id: runner.$.code,
      action: runner.$.action,
      out: runner.$.out,
      adv: runner.$.adv,
      tobase: runner.$.tobase,
      scored: runner.$.scored,
      por: runner.$.por,
    }  
    
  }

  /**
   * Parse the runner information and returns the athlyte runner compatible object
   * @param runner is a StatcrewPlay.IRunner object.
  */

  export function parseSub(sub: StatcrewPlay.ISub): AthlytePlay.ISub | undefined {
    
    return {
      for: sub.$.for,
      who: sub.$.who,
      pos: sub.$.pos,
      spot: sub.$.spot,
      team: sub.$.vh == "H"? VH.home: VH.visitor,
      forId: sub.$.forcode,
      whoId: sub.$.whocode,      
    }  
    
  }

  /*export function addPlayerInvolved(playerId: PlayerId): void {
    if (this.results.playersInvolved.indexOf(playerId) === -1) {
      this.results.playersInvolved.push(playerId);
    }
  }*/  

