import * as mongo from "mongodb";
import * as Superlative from "../../../server/ts/src/enums/superlatives"

export interface ISuperlative {
  _id?: string;
  type: Superlative.Type;
  value: number;
  text?: string;
  aggInfo: {
    aggType: Superlative.AggType;
    aggTime: Superlative.AggTime;
    aggScope: Superlative.Scope;
    stat: string;
  };
  scope: Superlative.Scope;
  highest: boolean;
  results: string[];
  season?: number;
  week?: number;
  holderInfo: {
    playId?: string;
    playerId?: string;
    teamId?: string;
    gameId?: string;
    conference?: string;
  };
}