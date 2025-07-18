import { Request, Response } from "express";
import * as authService from "@/auth/service";

const register = async (req: Request, res: Response) => {
  const newUser = await authService.registerUser(req.body);
  res.status(201).json(newUser);
};

const login = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "strict",
  });
  res.status(200).json(accessToken);
};

export { login, register };
