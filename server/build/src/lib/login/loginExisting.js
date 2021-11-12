"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
/**
 * Authenticate an existing user with the application.
 * Promise resolves if login was successful; rejects with reason if auth fails
 * @param db Mongo database
 * @param user information about the user trying to login
 */
exports.loginExistingUser = (db, user) => {
    return new Promise((resolve, reject) => {
        db.collection("users").findOne({ username: user.username })
            .catch(reject)
            .then((userDoc) => {
            if (!userDoc) {
                reject(new Error("Username or password incorrect1"));
            }
            else {
                const hashedPw = userDoc.hashedPw;
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
                            confName: userDoc.confName
                        });
                    }
                    else {
                        reject(new Error("Username or password incorrect"));
                    }
                });
            }
        });
    });
};
//# sourceMappingURL=loginExisting.js.map