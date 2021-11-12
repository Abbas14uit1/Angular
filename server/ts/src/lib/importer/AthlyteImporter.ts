/**
 * abstract class that all of our data importers will extend
 * allows for all importers to be referenced as AthlyteImporters
 */
export abstract class AthlyteImporter {
  /* istanbul ignore next */
  public abstract parse(input: any): void;
}

/**
 * enumerated data type to represent visitor or home
 * has to be in a typescript file and not a definition file so that it gets compiled to javascript
 */
export enum VH {
  visitor = 0,
  home = 1,
}
