"use strict";
//Notice: Code taken from https://www.dustinhorne.com/post/2016/06/09/implementing-a-dictionary-in-typescript
Object.defineProperty(exports, "__esModule", { value: true });
class KeyedCollection {
    constructor() {
        this.items = {};
        this.count = 0;
    }
    ContainsKey(key) {
        return this.items.hasOwnProperty(key);
    }
    Count() {
        return this.count;
    }
    Add(key, value) {
        if (!this.items.hasOwnProperty(key))
            this.count++;
        this.items[key] = value;
    }
    Remove(key) {
        var val = this.items[key];
        delete this.items[key];
        this.count--;
        return val;
    }
    Item(key) {
        return this.items[key];
    }
    Keys() {
        var keySet = [];
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }
        return keySet;
    }
    Values() {
        var values = [];
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }
        return values;
    }
}
exports.KeyedCollection = KeyedCollection;
//# sourceMappingURL=KeyedCollection.js.map