import * as bcrypt from "bcryptjs";
import * as mongo from "mongodb";

export interface IExistingUserData {
  username: string;
  admin: boolean;
  superAdmin: boolean;
  isActive: boolean;
  confName: string;
}

export interface IExistingUserInput {
  username: string;
  password: string;
}

export interface IExistingUserDBEntry {
  username: string;
  hashedPw: string;
  admin: boolean;
  superAdmin: boolean;
  isActive: boolean;
  confName: string;
}

/**
 * Authenticate an existing user with the application.
 * Promise resolves if login was successful; rejects with reason if auth fails
 * @param db Mongo database
 * @param user information about the user trying to login
 */
export const loginExistingUser: (db: mongo.Db, user: IExistingUserInput) => Promise<IExistingUserData> =
  (db: mongo.Db, user: IExistingUserInput) => {
    return new Promise((resolve, reject) => {
      db.collection("users").findOne({ username: user.username})
        .catch(reject)
        .then((userDoc) => {
          if (!userDoc) {
            reject(new Error("Username or password incorrect1"));
          } else {
            const hashedPw: string = userDoc.hashedPw;
            bcrypt.compare(user.password, hashedPw)
              .catch(reject)
              .then((res) => {
                if (res) {
                  // password matches hash
                  resolve({
                    admin: userDoc.admin,
                    username: userDoc.username,
                    superAdmin: userDoc.superAdmin,
                    isActive: userDoc.isActive,
                    confName:userDoc.confName
                  });
                } else {
                  reject(new Error("Username or password incorrect"));
                }
              });
          }
        });
    });
  };
