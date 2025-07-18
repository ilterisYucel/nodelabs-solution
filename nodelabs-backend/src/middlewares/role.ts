import { NextFunction, Request, Response } from "express";
import { hasPermission } from "../common/roles";

const roleMiddleware = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.url.includes("auth") ||
      req.url.includes("healthcheck") ||
      req.url.includes("doc")
    ) {
      return next();
    }
    const reqUser = (req as Record<string, any>)["user"];
    if (!reqUser) {
      res.status(401).json({ message: "User didn't authorized." });
      return;
    }
    if (hasPermission(permission, reqUser)) return next();
    res.status(403).json({ message: "Permission denied." });
  };
};

export { roleMiddleware };
