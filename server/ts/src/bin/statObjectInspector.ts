#!/usr/bin/env node
import * as path from "path";
import * as yargs from "yargs";

import { StatObjectInspector } from "../lib/StatObjectInspector";
import { winstonLogger } from "../lib/winstonLogger";
import { XMLParser } from "../lib/XMLParser";

const argv = yargs
  .usage("Usage: $0 [file]")
  .demandCommand(1, "Needs a path to an XML file")
  .argv;

const inputFile = path.resolve(argv._[0]);

async function main() {
  const parser = new XMLParser(inputFile);

  const parsed = await parser.parseXml();
  const builder = new StatObjectInspector(parsed);
  return builder.buildUniqArr();
}

main()
  .then((tree) => {
    winstonLogger.addConsole({
      colorize: true,
      prettyPrint: true,
    });
    winstonLogger.log("info", JSON.stringify(tree, undefined, 2));
  });
