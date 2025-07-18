import express from "express";
import { roleMiddleware } from "@/middlewares/role";
import * as messageController from "@/message/controller";

const router = express.Router();

router.get(
  "/messages/me",
  roleMiddleware("get-message-history"),
  messageController.getMessagesHistroy
);

export default router;
