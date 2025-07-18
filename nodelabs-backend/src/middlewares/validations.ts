import { Request, Response, NextFunction } from "express";
import { ContextRunner } from "express-validator";

const validationMiddleware = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ message: "Invalid request" });
      }
    }

    return next();
  };
};

export { validationMiddleware };
