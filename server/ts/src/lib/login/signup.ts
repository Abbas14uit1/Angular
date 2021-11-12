import * as bcrypt from "bcryptjs";
import * as mongo from "mongodb";

import { saltLength } from "../../config/config";
import { reject } from "q";

export interface INewUserInput {
  admin: boolean;
  active: boolean;
  superAdmin: boolean;
  username: string;
  password: string;
  confName: string;
}

export const saveUserToMongo: (db: mongo.Db, user: INewUserInput) => Promise<boolean> =
  (db: mongo.Db, user: INewUserInput) => {
    const isUserActive = user.active;
    return new Promise((resolve, reject) => {
      bcrypt.hash(user.password, saltLength, (err, hash) => {
        // default salt length is 10
        if (err) {
          reject(err);
        } else {
          // check database for the user
          console.log("user.confName>>>"+user.confName);
          db.collection("users").findOne({ username: user.username })
            .catch(reject)
            .then((existingUser) => {
              if (existingUser) {
                reject(new Error("Username is taken"));
              } else {
                const userWithHash = {
                  admin: user.admin || false,
                  isActive: isUserActive,
                  superAdmin: user.superAdmin,
                  username: user.username,
                  hashedPw: hash,
                  confName: user.confName,
                };
                db.collection("users").insertOne(userWithHash)
                  .catch(reject)
                  .then((insertResult) => {
                    if (!insertResult || insertResult.result.ok !== 1) {
                      reject(new Error("Could not save to DB"));
                    } else {
                      resolve(true);
                    }
                  });
              }
            });
        }
      });
    });
  };
