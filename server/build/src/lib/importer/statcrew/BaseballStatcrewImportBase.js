"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AthlyteImporter_1 = require("../AthlyteImporter");
/**
 * BaseImportClass serves as template for the various other classes (game, play, player, team) to implement
 * to ensure that child classes have all the required methods for registering and updating dependents.
 * By having the various subclasses all implement the same base class,
 * we can use [dynamic dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch) when registering
 * and updating dependents.
 * The class is abstract to prevent direct instantiation, although some non-abstract member methods exist that
 * are available for children to call.
 */
class BaseballStatcrewImportBase extends AthlyteImporter_1.AthlyteImporter {
    constructor() {
        super();
        //this.dependents = [];
    }
    /**
     * Set the ID; useful both for testing (manually setting an ID) and when running the app.
     * When running the app, the ID should come from `this.generateID()` to ensure that the ID
     * does not conflict with one in Mongo.
     * @param id ID to set for this class
     */
    populateId(id) {
        this.parsedData._id = id;
    }
    /**
     * Get the ID; will throw an error if the ID has not yet been set.
     * This prevents accidentally saving to Mongo without setting an ID.
     */
    getId() {
        const id = this.parsedData._id;
        if (!id) {
            throw new Error("Trying to access ID before it has been set");
        }
        else {
            return id;
        }
    }
    /**
     * Add a list of dependents to this classes dependents;
     * dependents are other classes which need to know the ID of this class
     * @param deps List of dependents of this class
     */
    registerDependents(deps) {
        this.dependents = this.dependents.concat(deps);
    }
}
exports.BaseballStatcrewImportBase = BaseballStatcrewImportBase;
//# sourceMappingURL=BaseballStatcrewImportBase.js.map