"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class StatObjectInspector {
    constructor(treeObject) {
        this.sourceData = treeObject;
        this.uniqueData = [];
    }
    buildUniqArr() {
        if (!_.isObject(this.sourceData)) {
            throw new TypeError("Not an object");
        }
        for (const prop in this.sourceData) {
            /* istanbul ignore else */
            if (this.sourceData.hasOwnProperty(prop)) {
                const value = this.sourceData[prop];
                if (_.isString(value) || _.isNumber(value) || _.isNull(value)) {
                    // "terminal" value
                    this.uniqueData.push(prop);
                }
                else if (_.isPlainObject(value)) {
                    const builder = new StatObjectInspector(value);
                    const built = builder.buildUniqArr();
                    this.uniqueData.push({ [prop]: built });
                }
                else if (_.isArray(value)) {
                    const arrChildren = [];
                    for (const child of value) {
                        if (_.isObject(child)) {
                            const builder = new StatObjectInspector(child);
                            const unique = builder.buildUniqArr();
                            arrChildren.push(unique);
                        }
                        else {
                            arrChildren.push(child);
                        }
                    }
                    this.uniqueData.push({
                        [prop]: _.uniq(arrChildren),
                    });
                }
                else {
                    throw new TypeError("Received unexpected data type: ");
                }
            }
        }
        return this.uniqueData;
    }
}
exports.StatObjectInspector = StatObjectInspector;
//# sourceMappingURL=StatObjectInspector.js.map