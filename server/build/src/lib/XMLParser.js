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
const pify = require("pify");
const xml2js = require("xml2js");
class XMLParser {
    constructor(data, options) {
        this.defaultOptions = {
            trim: true,
            normalizeTags: true,
            normalize: true,
            async: true,
            explicitRoot: false,
            attrValueProcessors: [XMLParser.parseToNumber],
        };
        this.xmlData = data;
        this.options = Object.assign({}, this.defaultOptions, options);
        this.parser = new xml2js.Parser(this.options);
    }
    getGameType() {
        const determinant = this.xmlData.toString().substr(1, this.xmlData.indexOf(" ") - 1);
        return determinant;
    }
    parseXml() {
        return __awaiter(this, void 0, void 0, function* () {
            const determinant = this.xmlData.toString().substr(1, this.xmlData.indexOf(" ") - 1);
            switch (determinant) {
                case ("fbgame"):
                    return this.parseFootballXml();
                case ("bsgame"):
                    return this.parseBaseballXml();
                case ("bbgame"):
                    return this.parseBasketballXml();
                default:
                    throw Error("XML code: " + determinant + " is invalid.");
            }
        });
    }
    parseFootballXml() {
        return __awaiter(this, void 0, void 0, function* () {
            return pify(this.parser.parseString)(this.xmlData);
        });
    }
    parseBasketballXml() {
        return __awaiter(this, void 0, void 0, function* () {
            return pify(this.parser.parseString)(this.xmlData);
        });
    }
    parseBaseballXml() {
        return __awaiter(this, void 0, void 0, function* () {
            return pify(this.parser.parseString)(this.xmlData);
        });
    }
}
XMLParser.parseToNumber = (value) => {
    if (!isNaN(value)) {
        return value % 1 === 0 ? parseInt(value, 10) : parseFloat(value);
    }
    else {
        return value;
    }
};
exports.XMLParser = XMLParser;
//# sourceMappingURL=XMLParser.js.map