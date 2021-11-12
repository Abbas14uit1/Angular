#!/usr/bin/env node
import * as fs from "graceful-fs";
import * as path from "path";
import * as pify from "pify";
import * as yargs from "yargs";

import { checkInputData } from "../lib/importer/statcrew/helpers/checkData";
import { winstonLogger } from "../lib/winstonLogger";
import { XMLParser } from "../lib/XMLParser";

async function main(inputPath: string) {
  winstonLogger.addConsole({
    colorize: true,
    prettyPrint: true,
    level: "debug",
  });
  winstonLogger.addFile({
    colorize: true,
    prettyPrint: true,
    level: "debug",
    filename: inputPath.split(".")[0] + "unexpected.txt",
  });
  const inputXmlData = await pify(fs.readFile)(inputPath);
  const parser = new XMLParser(inputXmlData);
  const parsed = await parser.parseXml();
  checkInputData(parsed);
}

const argv = yargs
  .usage("Usage: $0 [file]")
  .demandCommand(1, "Needs a path to an XML file")
  .argv;

const inputFile = path.resolve(argv._[0]);

main(inputFile)
  .then(() => winstonLogger.log("info", "Done!"));
