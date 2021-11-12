import { Router } from "express";
import * as jwt from "jsonwebtoken";
import * as mongo from "mongodb";

import { jwtSecret, jwtSignOpts } from "../../config/config";

import { loginExistingUser } from "../../lib/login/loginExisting";
import { passwordTest, usernameTest } from "./signup";

// types
import { IAdminUserDetails } from "../../../../../typings/user/user.d";

export const loginErrorMessages = {
  blankUsernameOrPassword: "Username or password cannot be blank",
  detailsFailedValidation: "Username or password failed validation",
  wrongLoginDetails: "User not found or password was incorrect",
  userisNotActive: "Your Account is currently InActive. Please Contact Admin",
};

const loginRouter: Router = Router();

loginRouter.post("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;

  const username: string = req.body.username;
  const password: string = req.body.password;
  if (!username || username === "") {
    return res.status(400).json({
      errors: [{
        code: "LoginError",
        title: loginErrorMessages.blankUsernameOrPassword,
      }],
    });
  } else if (!password || password === "") {
    return res.status(400).json({
      errors: [{
        code: "LoginError",
        title: loginErrorMessages.blankUsernameOrPassword,
      }],
    });
  } else if (!passwordTest(password) || !usernameTest(username)) {
    return res.status(400).json({
      errors: [{
        code: "LoginError",
        title: loginErrorMessages.detailsFailedValidation,
      }],
    });
  } else {
    try {
      const userDetails = await loginExistingUser(db, { username, password });
      if(!userDetails.isActive){
        return res.status(400).json({
          errors: [{
            code: "LoginError",
            title: loginErrorMessages.userisNotActive,
          }],
        });
      }else{
        return res.status(200).json({
          data: {
            username: userDetails.username as string,
            admin: userDetails.admin as boolean,
            token: jwt.sign(
              { username: userDetails.username as string, admin: userDetails.admin as boolean  },
              jwtSecret!,
              jwtSignOpts,
            ),
            superAdmin: userDetails.superAdmin as boolean,
            confName: userDetails.confName as string
          } as IAdminUserDetails,
        });
      }
    } catch (err) {
      return res.status(403).json({
        errors: [{
          code: "LoginError",
          title: loginErrorMessages.wrongLoginDetails,
        }],
      });
    }
  }
});

export { loginRouter };
