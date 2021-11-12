"use strict";
/**
 * The enumerated data types for the superlative engine
 * had to be in a typscript file and not a definition file so it actually compiles to javascript
 */
Object.defineProperty(exports, "__esModule", { value: true });
var AggType;
(function (AggType) {
    AggType[AggType["sum"] = 0] = "sum";
    AggType[AggType["min"] = 1] = "min";
    AggType[AggType["max"] = 2] = "max";
})(AggType = exports.AggType || (exports.AggType = {}));
var AggTime;
(function (AggTime) {
    AggTime[AggTime["play"] = 0] = "play";
    AggTime[AggTime["game"] = 1] = "game";
    AggTime[AggTime["season"] = 2] = "season";
    AggTime[AggTime["career"] = 3] = "career";
})(AggTime = exports.AggTime || (exports.AggTime = {}));
var Scope;
(function (Scope) {
    Scope[Scope["player"] = 0] = "player";
    Scope[Scope["team"] = 1] = "team";
    Scope[Scope["conf"] = 2] = "conf";
    Scope[Scope["all"] = 3] = "all";
})(Scope = exports.Scope || (exports.Scope = {}));
var Type;
(function (Type) {
    Type[Type["threshold"] = 0] = "threshold";
    Type[Type["leader"] = 1] = "leader";
})(Type = exports.Type || (exports.Type = {}));
//# sourceMappingURL=superlatives.js.map