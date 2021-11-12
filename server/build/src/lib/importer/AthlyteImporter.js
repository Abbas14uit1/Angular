"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * abstract class that all of our data importers will extend
 * allows for all importers to be referenced as AthlyteImporters
 */
class AthlyteImporter {
}
exports.AthlyteImporter = AthlyteImporter;
/**
 * enumerated data type to represent visitor or home
 * has to be in a typescript file and not a definition file so that it gets compiled to javascript
 */
var VH;
(function (VH) {
    VH[VH["visitor"] = 0] = "visitor";
    VH[VH["home"] = 1] = "home";
})(VH = exports.VH || (exports.VH = {}));
//# sourceMappingURL=AthlyteImporter.js.map