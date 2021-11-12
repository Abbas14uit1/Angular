import * as Athlyte from "../../../../typings/athlyte/football";
import { VH } from "../lib/importer/AthlyteImporter";

export function calculateDistance(
  poss: VH,
  start: Athlyte.IFieldPosition,
  end: Athlyte.IFieldPosition,
): number {
  if (start.yardline === 50 && end.yardline === 50) {
    return 0;
  }
  if (start.side === end.side && start.side !== poss) {
    // on opponent side, going from 40 to 20 is +20 yards
    return start.yardline - end.yardline;
  } else if (start.side === end.side && start.side === poss) {
    // on your side, going from 40 to 20 is -20 yards
    return -1 * (start.yardline - end.yardline);
  }
  // if not returned yet, then startSide !== endSide
  // cross over 50 yard line during play
  /* istanbul ignore else */
  if (start.side === poss) {
    // start on own side, cross 50 onto their side
    // going from own 40 to their 40 is +20 yards
    return (50 - start.yardline) + (50 - end.yardline);
  } else if (start.side !== poss) {
    // start on their side, cross 50 onto our own side
    // going from their 40 to our 40 is -20 yards
    return -1 * ((50 - start.yardline) + (50 - end.yardline));
  } else {
    throw new Error("Distance calculation failed");
  }
}
