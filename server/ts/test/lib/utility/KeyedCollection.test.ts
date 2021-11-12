import test from "ava";
import * as express from "express";
import * as _ from "lodash";
import * as moment from "moment";
import * as mongo from "mongodb";
import * as request from "supertest";

import { KeyedCollection } from "../../../src/lib/utility/KeyedCollection";

test("Test key collection add", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);	
	t.is(mapCollection.Count(),1);
});

test("Test key collection contains key", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);	
	t.is(mapCollection.ContainsKey("a"),true);
});

test("Test key collection remove", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);	
	t.is(mapCollection.Remove("a"),1);	
});

test("Test key collection item", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);	
	t.is(mapCollection.Item("a"),1);	
});

test("Test key collection for all keys", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);
	mapCollection.Add("b",2);
	const len: Number =  mapCollection.Keys().length;
	t.is(len,2);	
});

test("Test key collection for all values", async (t) => {

	const mapCollection = new KeyedCollection<Number>();
	mapCollection.Add("a",1);
	mapCollection.Add("b",2);
	const len: Number = await mapCollection.Values().length;
	t.is(len,2);	
});