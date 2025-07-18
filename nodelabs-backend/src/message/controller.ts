import { Request, Response } from "express";
import * as messageService from "@/message/service";

const getMessagesHistroy = async (req: Request, res: Response) => {
  const user = (req as Record<string, any>)["user"];
  const userId = user._id;
  if (!user || userId) {
    res.status(400).send({ message: "Invalid request" });
  }
  const messages = messageService.filterMessages({ _id: userId });
  return res.status(200).json(messages);
};

export { getMessagesHistroy };
