import { Request, Response, Router } from "express";
import * as jwt from "jsonwebtoken";
import * as mongo from "mongodb";

import { jwtSecret, jwtSignOpts } from "../../config/config";

import { loginExistingUser } from "../../lib/login/loginExisting";
import { INewUserInput, saveUserToMongo } from "../../lib/login/signup";

const signupRouter: Router = Router();

const usernameRegex = /^[\w\d]{6,72}$/; // any combo of letters and digits, >= 6 char and < 72
const passwordRegex = /^.{6,72}$/; // anything except new lines, >= 6 char and < 72

export const usernameTest = (username: string) => usernameRegex.test(username);
export const passwordTest = (password: string) => passwordRegex.test(password);

signupRouter.post("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  // TODO: sanitize input?
  // TODO: rate limiting?
  const username = req.body.username;
  const password = req.body.password;
  const newUserIsAdmin: boolean = req.body.admin ? req.body.admin : false;
  const confName = req.body.confName;
  if (newUserIsAdmin) {
    // adding an admin user requires that the request is coming from a signed-in admin user
    const authString = req.headers.authorization as string;
    if (!authString || authString.substring(0, 3) !== "JWT") {
      return res.status(401).json({
        errors: [{
          code: "LoginError",
          title: "Authorization field was incorrectly formed",
        }],
      });
    }
    const token = authString.split(" ")[1];
    const decoded = jwt.verify(
      token,
      jwtSecret!,
      { algorithms: [jwtSignOpts.algorithm!] }) as { username: string, admin: boolean };
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
  } else if (!password || password === "") {
    return res.status(400).json({
      errors: [{
        code: "SignupError",
        title: "Password was not specified",
      }],
    });
  } else if (!usernameRegex.test(username)) {
    return res.status(400).json({
      errors: [{
        code: "SignupError",
        title: "Username did not meed criteria",
        details: "Must be >= 6 characters and < 72, only letters and digits",
      }],
    });
  } else if (!passwordRegex.test(password)) {
    return res.status(400).json({
      errors: [{
        code: "SignupError",
        title: "Password did not meet criteria",
        details: "Must be >= 6 characters and < 72; cannot contain a newline char",
      }],
    });
  } else {
    console.log("confName>>>"+confName);
    const user: INewUserInput = {
      admin: newUserIsAdmin,
      superAdmin: false,
      active: true,
      password,
      username,
      confName,
    };
    try {
      const saveResult = await saveUserToMongo(db, user);
      /* istanbul ignore else */
      if (saveResult) {
        return res.status(201).json({
          data: {
            username: user.username,
            token: jwt.sign(
              { username: user.username, admin: user.admin },
              jwtSecret!,
              jwtSignOpts,
            ),
          },
        });
      } else {
        throw new Error("Unknown error occured while adding user to database");
      }
    } /* istanbul ignore next */ catch (err) {
      return res.status(400).json({
        errors: [{
          code: "SignupError",
          title: "Error occured while saving user to database",
          details: err.message,
        }],
      });
    }
  }
});

export { signupRouter };
