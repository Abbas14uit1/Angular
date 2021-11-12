/**
 * Note: this entire file is called .test.ts so that NYC ignores it and doesn't try code coverage
 */

import { test } from "ava";
import * as jsonfile from "jsonfile";
import * as path from "path";
import * as pify from "pify";

import { XMLParser } from "../../../../src/lib/XMLParser";
import { fixtureDir } from "../../../config/_testConfiguration";

import { IStatcrewBasketballJSON } from "../../../../../../typings/statcrew/basketball";

/**
 * Path to Statcrew data
 */
export const defaultDataPath = path.join(fixtureDir, "json", "statcrew", "basketball_UA123012.json");

/**
 * Load JSON file into a JS object
 * @param inputPath Path to JSON file to read in
 */
export async function readJson(inputPath: string = defaultDataPath): Promise<IStatcrewBasketballJSON> {
  return await pify(jsonfile.readFile)(inputPath);
}

export async function readXml(inputData: string): Promise<IStatcrewBasketballJSON> {
  const parser = new XMLParser(inputData);
  return parser.parseXml();
}

/**
 * Overwrite the plays array with a single play from the game.
 * Good for testing specific behavior with data.
 * Modifies the input object.
 * @param inputData Statcrew JSON data
 * @param quarter Quarter index in game, from 0 to 3
 * @param play Play index in quarter, starts at 0 in each quarter
 */
export function focusToSpecificPlay(inputData: IStatcrewBasketballJSON, period: number, play: number): void {
  inputData.plays[0].period = [inputData.plays[0].period[period]];
  inputData.plays[0].period[0].play = [inputData.plays[0].period[0].play[play]];
}
