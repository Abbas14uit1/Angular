import { gameTypes } from "./game-type";

export function getGameTypeData(sportCode: string): string[] {
  const sportGameTypes = gameTypes.filter((e: any) => { return e["sportCode"] == sportCode });
  return sportGameTypes[0].gameTypes;
}