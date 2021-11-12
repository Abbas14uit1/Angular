"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const StatObjectInspector_1 = require("../../src/lib/StatObjectInspector");
ava_1.test("1 level tree: keeps keys for non-object types", (t) => {
    const inputTree = {
        name: "joseph",
        number: 10,
    };
    const desired = ["name", "number"];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputTree);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("2 level tree: ignores keys for objects", (t) => {
    const inputTree = {
        joseph: {
            height: 73,
            gender: "male",
        },
        number: 10,
    };
    const desired = [{ joseph: ["height", "gender"] }, "number"];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputTree);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("keeps keys for arrays", (t) => {
    const inputTree = {
        people: [
            {
                name: "joseph",
                height: 73,
            },
            {
                name: "j",
                height: "73",
            },
        ],
    };
    const desired = [{ people: [["name", "height"], ["name", "height"]] }];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputTree);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("non-object children of arrays are added immediately", (t) => {
    const inputTree = {
        myArray: ["foo", "bar"],
    };
    const desired = [
        {
            myArray: ["foo", "bar"],
        },
    ];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputTree);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("deep tree", (t) => {
    const inputTree = {
        people: [
            {
                name: "joseph",
                height: 73,
            },
            {
                name: "daniel",
                location: "AL",
            },
        ],
        weather: {
            today: {
                sunrise: "6:00am",
                sunset: "8:00pm",
            },
            tomorrow: {
                sunrise: "early",
                sunset: "not late enough",
            },
        },
    };
    const desired = [
        {
            people: [["name", "height"], ["name", "location"]],
        },
        { weather: [{ today: ["sunrise", "sunset"] }, { tomorrow: ["sunrise", "sunset"] }] },
    ];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputTree);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("tree from statcrew excerpt", (t) => {
    const inputData = {
        venue: [
            {
                $: {
                    gameid: "01UA-USC",
                    visid: "USC",
                    homeid: "UA",
                    visname: "USC",
                },
                officials: [
                    {
                        $: {
                            ref: "Reggie Smith",
                            ump: "Tab Slaughter",
                            line: "Mike Moeller",
                        },
                    },
                ],
            }
        ],
    };
    const desired = [{
            venue: [
                [
                    { $: ["gameid", "visid", "homeid", "visname"] },
                    {
                        officials: [
                            [
                                { $: ["ref", "ump", "line"] },
                            ],
                        ],
                    },
                ],
            ],
        }];
    const builder = new StatObjectInspector_1.StatObjectInspector(inputData);
    t.deepEqual(builder.buildUniqArr(), desired);
});
ava_1.test("throws error when called on non-object", (t) => {
    const builder = new StatObjectInspector_1.StatObjectInspector("foo");
    const error = t.throws(() => builder.buildUniqArr());
    t.is(error.name, TypeError.name);
    t.is(error.message, "Not an object");
});
ava_1.test("Unexpected data types throw error", (t) => {
    const builder = new StatObjectInspector_1.StatObjectInspector({ foo: Symbol("bar") });
    const error = t.throws(() => builder.buildUniqArr());
    t.regex(error.message, /Received unexpected data type:+/);
});
//# sourceMappingURL=statObjectInspector.test.js.map