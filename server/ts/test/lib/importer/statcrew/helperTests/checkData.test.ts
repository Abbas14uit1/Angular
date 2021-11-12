import { test } from "ava";

import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";

import { checkInputData } from "../../../../../src/lib/importer/statcrew/helpers/checkData";
import { readJson } from "../_data.helper";

let inputData: IStatcrewFootballJSON;
test.before("read full input file", async (t) => {
  inputData = await readJson();
  t.not(inputData, undefined);
});

test("check for unexpected data, contains no unexpected data", (t) => {
  const unexpected: boolean = checkInputData(inputData);
  t.is(unexpected, false);
});
