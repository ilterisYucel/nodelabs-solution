import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getBearerToken, getHeader } from "../common/headers";

const secretKey = process.env.HASH_SECRET;

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secretKey as string);
  } catch (error) {
    throw new Error("Token verify unsuccessful.");
  }
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.url.includes("auth") ||
    req.url.includes("healthcheck") ||
    req.url.includes("doc")
  ) {
    return next();
  }
  const authHeader = getHeader(req, "authorization");
  const token = getBearerToken(authHeader);
  if (token == null) {
    res.status(401).send("Token not found!");
    return;
  }
  try {
    const user = verifyToken(token);
    (req as Record<string, any>)["user"] = user;
    next();
  } catch {
    res.status(401).send("Token expired!.");
  }
};

export { authMiddleware };
