"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt = require("jsonwebtoken");
const config_1 = require("../../config/config");
const signup_1 = require("../../lib/login/signup");
const signupRouter = express_1.Router();
exports.signupRouter = signupRouter;
const usernameRegex = /^[\w\d]{6,72}$/; // any combo of letters and digits, >= 6 char and < 72
const passwordRegex = /^.{6,72}$/; // anything except new lines, >= 6 char and < 72
exports.usernameTest = (username) => usernameRegex.test(username);
exports.passwordTest = (password) => passwordRegex.test(password);
signupRouter.post("/", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    // TODO: sanitize input?
    // TODO: rate limiting?
    const username = req.body.username;
    const password = req.body.password;
    const newUserIsAdmin = req.body.admin ? req.body.admin : false;
    const confName = req.body.confName;
    if (newUserIsAdmin) {
        // adding an admin user requires that the request is coming from a signed-in admin user
        const authString = req.headers.authorization;
        if (!authString || authString.substring(0, 3) !== "JWT") {
            return res.status(401).json({
                errors: [{
                        code: "LoginError",
                        title: "Authorization field was incorrectly formed",
                    }],
            });
        }
        const token = authString.split(" ")[1];
        const decoded = jwt.verify(token, config_1.jwtSecret, { algorithms: [config_1.jwtSignOpts.algorithm] });
        if (!decoded.admin) {
            return res.status(401).json({
                errors: [{
                        code: "LoginError",
                        title: "Adding a new admin requires that request comes from another logged-in admin",
                    }],
            });
        }
    }
    if (!username || username === "") {
        return res.status(400).json({
            errors: [{
                    code: "SignupError",
                    title: "Username was not specified",
                }],
        });
    }
    else if (!password || password === "") {
        return res.status(400).json({
            errors: [{
                    code: "SignupError",
                    title: "Password was not specified",
                }],
        });
    }
    else if (!usernameRegex.test(username)) {
        return res.status(400).json({
            errors: [{
                    code: "SignupError",
                    title: "Username did not meed criteria",
                    details: "Must be >= 6 characters and < 72, only letters and digits",
                }],
        });
    }
    else if (!passwordRegex.test(password)) {
        return res.status(400).json({
            errors: [{
                    code: "SignupError",
                    title: "Password did not meet criteria",
                    details: "Must be >= 6 characters and < 72; cannot contain a newline char",
                }],
        });
    }
    else {
        console.log("confName>>>" + confName);
        const user = {
            admin: newUserIsAdmin,
            superAdmin: false,
            active: true,
            password,
            username,
            confName,
        };
        try {
            const saveResult = yield signup_1.saveUserToMongo(db, user);
            /* istanbul ignore else */
            if (saveResult) {
                return res.status(201).json({
                    data: {
                        username: user.username,
                        token: jwt.sign({ username: user.username, admin: user.admin }, config_1.jwtSecret, config_1.jwtSignOpts),
                    },
                });
            }
            else {
                throw new Error("Unknown error occured while adding user to database");
            }
        } /* istanbul ignore next */
        catch (err) {
            return res.status(400).json({
                errors: [{
                        code: "SignupError",
                        title: "Error occured while saving user to database",
                        details: err.message,
                    }],
            });
        }
    }
}));
//# sourceMappingURL=signup.js.map