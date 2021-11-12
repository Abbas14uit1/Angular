/**
 * The enumerated data types for the superlative engine
 * had to be in a typscript file and not a definition file so it actually compiles to javascript
 */

export enum AggType {
  sum,
  min,
  max,
}

export enum AggTime {
  play,
  game,
  season,
  career,
}

export enum Scope {
  player,
  team,
  conf,
  all,
}

export enum Type {
  threshold,
  leader,
}
