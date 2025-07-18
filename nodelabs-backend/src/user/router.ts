import express from "express";
import { roleMiddleware } from "@/middlewares/role";
import * as userController from "@/user/controller";
import { body, param } from "express-validator";
import { validationMiddleware } from "@/middlewares/validations";

const router = express.Router();

router.get(
  "/user/list",
  roleMiddleware("get-users"),
  userController.getAllUsers
);
router.get(
  "/user/:id",
  roleMiddleware("get-user"),
  validationMiddleware([param("id").notEmpty()]),
  userController.getUser
);
router.get(
  "/user/me",
  roleMiddleware("get-profile"),
  userController.getProfile
);
router.put(
  "/user/me",
  roleMiddleware("update-profile"),
  validationMiddleware([
    body("email").optional().isEmail(),
    body("username")
      .optional()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").optional().isLength({ min: 8 }),
  ]),
  userController.updateProfile
);
router.post(
  "/user",
  roleMiddleware("create-user"),
  validationMiddleware([
    body("email").isEmail(),
    body("username")
      .optional()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").isLength({ min: 8 }),
  ]),
  userController.createUser
);
router.post(
  "/users/filter",
  roleMiddleware("filter-users"),
  validationMiddleware([
    body("email").optional().isEmail(),
    body("username")
      .optional()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").optional().isLength({ min: 8 }),
  ]),
  userController.filterUsers
);
router.post(
  "/user/filter",
  roleMiddleware("filter-user"),
  validationMiddleware([
    body("email").optional().isEmail(),
    body("username")
      .optional()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").optional().isLength({ min: 8 }),
  ]),
  userController.filterUser
);
router.put(
  "/user/:id",
  roleMiddleware("update-user"),
  validationMiddleware([
    body("email").optional().isEmail(),
    body("username")
      .optional()
      .custom((value) => {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(value)) {
          throw new Error("Invalid username format");
        }
        return true;
      }),
    body("password").optional().isLength({ min: 8 }),
  ]),
  userController.updateUser
);
router.delete(
  "/user/:id",
  roleMiddleware("delete-user"),
  validationMiddleware([param("id").notEmpty()]),
  userController.deleteUser
);

export default router;
