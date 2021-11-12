import * as fs from "graceful-fs";
import * as path from "path";
import * as pify from "pify";
import * as xml2js from "xml2js";

import { IStatcrewBaseballJSON } from "../../../../typings/statcrew/baseball";
import { IStatcrewBasketballJSON } from "../../../../typings/statcrew/basketball";
import { IStatcrewFootballJSON } from "../../../../typings/statcrew/football";

export class XMLParser {
  public static parseToNumber = (value: string) => {
    if (!isNaN(value as any)) {
      return value as any % 1 === 0 ? parseInt(value, 10) : parseFloat(value);
    } else {
      return value;
    }
  }

  private options: xml2js.OptionsV2;
  private defaultOptions: xml2js.OptionsV2 = {
    trim: true,
    normalizeTags: true,
    normalize: true,
    async: true,
    explicitRoot: false,
    attrValueProcessors: [XMLParser.parseToNumber],
  };
  private parser: xml2js.Parser;
  private xmlData: string;

  constructor(data: string, options?: xml2js.OptionsV2) {
    this.xmlData = data;
    this.options = Object.assign({}, this.defaultOptions, options);
    this.parser = new xml2js.Parser(this.options);
  }

  public getGameType(): string {
    const determinant = this.xmlData.toString().substr(1, this.xmlData.indexOf(" ") - 1);
    return determinant;
  }

  public async parseXml(): Promise<any> {
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
  }

  private async parseFootballXml(): Promise<IStatcrewFootballJSON> {
    return pify(this.parser.parseString)(this.xmlData);
  }

  private async parseBasketballXml(): Promise<IStatcrewBasketballJSON> {
    return pify(this.parser.parseString)(this.xmlData);
  }

  private async parseBaseballXml(): Promise<IStatcrewBaseballJSON> {
    return pify(this.parser.parseString)(this.xmlData);
  }
}
