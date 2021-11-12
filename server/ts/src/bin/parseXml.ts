import * as fs from "graceful-fs";
import * as jsonfile from "jsonfile";
import * as path from "path";
import * as pify from "pify";
import * as yargs from "yargs";
import { XMLParser } from "../lib/XMLParser";

const argv = yargs
  .usage("Usage: $0 --in [file] --out [file]")
  .demandOption(["in", "out"])
  .argv;

const filePath = path.resolve(argv.in);

pify(fs.readFile)(filePath, "UTF-8")
  .then((xmlData) => {
    const parser = new XMLParser(xmlData);
    return parser.parseXml();
  }).then((jsonData) => {
    return jsonfile.writeFile(
      argv.out,
      jsonData,
      { spaces: 2 },
    );
  });
