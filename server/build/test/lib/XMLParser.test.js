"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const fs = require("graceful-fs");
const path = require("path");
const pify = require("pify");
const XMLParser_1 = require("../../src/lib/XMLParser");
const config = require("../config/_testConfiguration");
const goodXmlPath = config.statcrewXml2016;
const badXmlPath = path.join(config.fixtureDir, "xml", "ill-formed-xml.xml");
let goodXml;
let badXml;
ava_1.test.before("load files", (t) => __awaiter(this, void 0, void 0, function* () {
    yield t.notThrows(pify(fs.readFile)(goodXmlPath)
        .then((data) => goodXml = data));
    yield t.notThrows(pify(fs.readFile)(badXmlPath)
        .then((data) => badXml = data));
}));
ava_1.test("parses integer", (t) => {
    t.is(XMLParser_1.XMLParser.parseToNumber("10"), 10);
});
ava_1.test("parses float", (t) => {
    t.is(XMLParser_1.XMLParser.parseToNumber("10.5"), 10.5);
});
ava_1.test("parses well-formed xml", (t) => __awaiter(this, void 0, void 0, function* () {
    const parser = new XMLParser_1.XMLParser(goodXml);
    yield t.notThrows(parser.parseXml());
}));
ava_1.test("error when parsing misformed xml", (t) => __awaiter(this, void 0, void 0, function* () {
    const parser = new XMLParser_1.XMLParser(badXml);
    yield t.throws(parser.parseXml());
}));
ava_1.test("error on malformed XML", (t) => __awaiter(this, void 0, void 0, function* () {
    const parser = new XMLParser_1.XMLParser("<malfored string here>");
    yield t.throws(parser.parseXml());
}));
ava_1.test("statcrew type definitions exist and autocomplete", (t) => __awaiter(this, void 0, void 0, function* () {
    const parser = new XMLParser_1.XMLParser(goodXml);
    const parsed = yield parser.parseXml();
    t.is(typeof parsed.$.generated, typeof "");
}));
ava_1.test("XMLParser works on multiple variations of XML files", (t) => __awaiter(this, void 0, void 0, function* () {
    const files = yield pify(fs.readdir)(path.dirname(goodXmlPath));
    t.plan(files.length);
    const paths = files.map((file) => path.join(path.dirname(goodXmlPath), file));
    for (const fileName of paths) {
        const data = yield pify(fs.readFile)(fileName, "UTF-8");
        const parser = new XMLParser_1.XMLParser(data);
        yield t.notThrows(() => parser.parseXml());
    }
}));
//# sourceMappingURL=XMLParser.test.js.map