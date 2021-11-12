"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const config_1 = require("../../config/config");
exports.saveUserToMongo = (db, user) => {
    const isUserActive = user.active;
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, config_1.saltLength, (err, hash) => {
            // default salt length is 10
            if (err) {
                reject(err);
            }
            else {
                // check database for the user
                console.log("user.confName>>>" + user.confName);
                db.collection("users").findOne({ username: user.username })
                    .catch(reject)
                    .then((existingUser) => {
                    if (existingUser) {
                        reject(new Error("Username is taken"));
                    }
                    else {
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
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                });
            }
        });
    });
};
//# sourceMappingURL=signup.js.map