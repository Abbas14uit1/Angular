import { test } from "ava";
import * as fs from "graceful-fs";
import * as path from "path";
import * as pify from "pify";
import { IStatcrewFootballJSON } from "../../../../typings/statcrew/football";
import { XMLParser } from "../../src/lib/XMLParser";
import * as config from "../config/_testConfiguration";

const goodXmlPath = config.statcrewXml2016;
const badXmlPath = path.join(config.fixtureDir, "xml", "ill-formed-xml.xml");

let goodXml: string;
let badXml: string;

test.before("load files", async (t) => {
  await t.notThrows(pify(fs.readFile)(goodXmlPath)
    .then((data) => goodXml = data));
  await t.notThrows(pify(fs.readFile)(badXmlPath)
    .then((data) => badXml = data));
});

test("parses integer", (t) => {
  t.is(XMLParser.parseToNumber("10"), 10);
});

test("parses float", (t) => {
  t.is(XMLParser.parseToNumber("10.5"), 10.5);
});

test("parses well-formed xml", async (t) => {
  const parser = new XMLParser(goodXml);
  await t.notThrows(parser.parseXml());
});

test("error when parsing misformed xml", async (t) => {
  const parser = new XMLParser(badXml);
  await t.throws(parser.parseXml());
});

test("error on malformed XML", async (t) => {
  const parser = new XMLParser("<malfored string here>");
  await t.throws(parser.parseXml());
});

test("statcrew type definitions exist and autocomplete", async (t) => {
  const parser = new XMLParser(goodXml);
  const parsed = await parser.parseXml();
  t.is(typeof parsed.$.generated, typeof "");
});

test("XMLParser works on multiple variations of XML files", async (t) => {
  const files: string[] = await pify(fs.readdir)(path.dirname(goodXmlPath));
  t.plan(files.length);
  const paths = files.map((file) => path.join(path.dirname(goodXmlPath), file));
  for (const fileName of paths) {
    const data = await pify(fs.readFile)(fileName, "UTF-8");
    const parser = new XMLParser(data);
    await t.notThrows(() => parser.parseXml());
  }
});
