import express from "express";
import cors from "cors";
import * as requestIP from "request-ip";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "@/middlewares/auth";
import { errorMiddleware } from "@/middlewares/error";
import userRouter from "@/user";
import messageRouter from "@/message";
import authRouter from "@/auth";
import path from "path";
import helmet from "helmet";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later",
});

const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later",
});

const createApp = (): express.Express => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: "deny",
      },
    })
  );

  app.use(compression());
  app.use(cors());
  app.use(requestIP.mw());
  app.use(express.json());

  app.use(authMiddleware);
  app.use("/api", apiLimiter, userRouter);
  app.use("/api", strictLimiter, authRouter);
  app.use("/api", apiLimiter, messageRouter);
  app.use(errorMiddleware);

  // Health check endpoint
  app.get("/healthcheck", (req, res) => {
    res.status(200).json({
      message: "NodeLabs backend is running.",
      developer: "İlteriş Yücel",
      requestIP: req.ip,
      time: new Date(),
    });
  });

  app.use(express.static(path.join(__dirname, "..", "public")));

  return app;
};

export { createApp };
