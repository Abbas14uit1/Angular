import { Router } from "express";
import * as mongo from "mongodb";
import * as bcrypt from "bcryptjs";
const usersRoute: Router = Router();
/**
 * Get all users.
 */
usersRoute.get("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const users = await db.collection("users").aggregate([
    {
      $project: {
        _id: 0,
        id: "$_id",
        admin: "$admin",
        superAdmin: "$superAdmin",
        username: "$username",
        email: { $ifNull: ["$email", "$username"] },
        password: "$hashedPw",
        isActive: { $ifNull: ["$isActive", true] },
        createdOn: { $ifNull: ["$createdOn", new Date()] },
        lastUpdatedOn: { $ifNull: ["$lastUpdatedOn", new Date()] },
        confName: { $ifNull: ["$confName", ""] },
      },
    },
  ]).toArray();
  return res.status(200).json({
    data: users,
  });
});
/**
 * Insert new user.
 */
usersRoute.post("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const existingUser = await db.collection("users").findOne({ username: req.body.username });
  if (!existingUser) {
    const newUser: any = {
      admin: req.body.admin == null ? false : req.body.admin,
      superAdmin: req.body.superAdmin == null ? false : req.body.superAdmin,
      hashedPw: bcrypt.hashSync(req.body.password, 10),
      username: req.body.username,
      isActive: true,
      email: req.body.email,
      confName:req.body.confName,
      createdOn: new Date(),
      lastUpdatedOn: new Date(),
    };
    try {
      await db.collection("users").insertOne(newUser);
      res.status(201).json({
        data: newUser._id
      });
      return;
    } catch (err) {
      res.status(500).json({
        errors: [{
          code: "MongoRetrievalError",
          title: "Unknown error occured during Mongo operation",
          message: err.message,
        }],
      });
      return;
    }
  }
  else {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: "User exists already.",
      }],
    });
    return;
  }
});
/**
 * Update new user.
 */
usersRoute.put("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  var ObjectId = mongo.ObjectId;
  const o_id = new ObjectId(req.body.id);
  const existingUser = await db.collection("users").findOne({ _id: o_id });
  if (existingUser) {
    try {
      console.log(req.body.password == existingUser["hashedPw"]);
      const password = req.body.password == existingUser["hashedPw"]
        ? req.body.password : bcrypt.hashSync(req.body.password, 10);
      await db.collection("users").updateOne({ "_id": o_id },
        {
          $set: {
            "username": req.body.username,
            "admin": req.body.admin,
            "superAdmin": req.body.superAdmin,
            "lastUpdatedOn": new Date(),
            "hashedPw": password,
            "isActive": req.body.isActive,
            "email": req.body.email,
            "confName":req.body.confName,
          }
        },
        { "upsert": false });
      res.status(200).json({
        data: "User updates successfully",
      });
    }
    catch (err) {
      res.status(500).json({
        errors: [{
          code: "MongoRetrievalError",
          title: "Unknown error occured during Mongo operation",
          message: err.message,
        }],
      });
      return;
    }
  }
  else {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: "User does not exists",
      }],
    });
    return;
  }
});
/**
 * Delete new user.
 */
usersRoute.put("/delete", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  var ObjectId = mongo.ObjectId;
  const o_id = new ObjectId(req.body.id);
  const existingUser = await db.collection("users").findOne({ _id: o_id });
  if (existingUser) {
    try {
      await db.collection("users").deleteOne({ "_id": o_id });
      res.status(200).json({
        data: "User deleted successfully",
      });
    }
    catch (err) {
      res.status(500).json({
        errors: [{
          code: "MongoRetrievalError",
          title: "Unknown error occured during Mongo operation",
          message: err.message,
        }],
      });
      return;
    }
  }
  else {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: "User does not exists",
      }],
    });
    return;
  }
});

export { usersRoute };
