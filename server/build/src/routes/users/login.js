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
const loginExisting_1 = require("../../lib/login/loginExisting");
const signup_1 = require("./signup");
exports.loginErrorMessages = {
    blankUsernameOrPassword: "Username or password cannot be blank",
    detailsFailedValidation: "Username or password failed validation",
    wrongLoginDetails: "User not found or password was incorrect",
    userisNotActive: "Your Account is currently InActive. Please Contact Admin",
};
const loginRouter = express_1.Router();
exports.loginRouter = loginRouter;
loginRouter.post("/", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const username = req.body.username;
    const password = req.body.password;
    if (!username || username === "") {
        return res.status(400).json({
            errors: [{
                    code: "LoginError",
                    title: exports.loginErrorMessages.blankUsernameOrPassword,
                }],
        });
    }
    else if (!password || password === "") {
        return res.status(400).json({
            errors: [{
                    code: "LoginError",
                    title: exports.loginErrorMessages.blankUsernameOrPassword,
                }],
        });
    }
    else if (!signup_1.passwordTest(password) || !signup_1.usernameTest(username)) {
        return res.status(400).json({
            errors: [{
                    code: "LoginError",
                    title: exports.loginErrorMessages.detailsFailedValidation,
                }],
        });
    }
    else {
        try {
            const userDetails = yield loginExisting_1.loginExistingUser(db, { username, password });
            if (!userDetails.isActive) {
                return res.status(400).json({
                    errors: [{
                            code: "LoginError",
                            title: exports.loginErrorMessages.userisNotActive,
                        }],
                });
            }
            else {
                return res.status(200).json({
                    data: {
                        username: userDetails.username,
                        admin: userDetails.admin,
                        token: jwt.sign({ username: userDetails.username, admin: userDetails.admin }, config_1.jwtSecret, config_1.jwtSignOpts),
                        superAdmin: userDetails.superAdmin,
                        confName: userDetails.confName
                    },
                });
            }
        }
        catch (err) {
            return res.status(403).json({
                errors: [{
                        code: "LoginError",
                        title: exports.loginErrorMessages.wrongLoginDetails,
                    }],
            });
        }
    }
}));
//# sourceMappingURL=login.js.map