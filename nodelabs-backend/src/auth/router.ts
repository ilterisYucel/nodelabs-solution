import express from "express";
import * as authController from "./controller";
import { body } from "express-validator";
import { validationMiddleware } from "@/middlewares/validations";

const router = express.Router();

router.post(
  "/auth/register",
  validationMiddleware([
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ]),
  authController.register
);

router.post(
  "/auth/login",
  validationMiddleware([
    body("identifier")
      .notEmpty()
      .bail()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").isLength({ min: 8 }),
  ]),
  authController.login
);

export default router;
