import { Request, Response } from "express";
import * as userService from "./service";

const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  const result = await userService.getAllUsers();
  res.status(200).json(result);
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send(`${id} is invalid user id.`);
    return;
  }
  const result = await userService.getUser(id);
  if (!result) {
    res.status(404).send(`${id} is not found.`);
    return;
  }
  res.status(200).json(result);
};

const getProfile = async (req: Request, res: Response) => {
  const user = (req as Record<string, any>)["user"];
  if (!user) {
    res.status(400).send({ message: "Invalid request" });
  }
  return res.status(200).json(user);
};

const updateProfile = async (req: Request, res: Response) => {
  const user = (req as Record<string, any>)["user"];
  const userId = user._id as string;
  if (!user || !userId) {
    res.status(400).send({ message: "Invalid request" });
  }
  const updated = await userService.updateUser(userId, req.body);
  return res.status(200).json(updated);
};

const createUser = async (req: Request, res: Response): Promise<void> => {
  const result = await userService.createUser(req.body);
  res.status(201).json(result);
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await userService.updateUser(id as string, req.body);
  res.status(200).json(result);
};

const filterUser = async (req: Request, res: Response): Promise<void> => {
  const filter = req.body;
  const result = await userService.filterUser(filter);
  res.status(200).json(result);
};

const filterUsers = async (req: Request, res: Response): Promise<void> => {
  const filter = req.body;
  const result = await userService.filterUsers(filter);
  res.status(200).json(result);
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send(`${id} is invalid user id.`);
    return;
  }
  const result = await userService.deleteUser(id);
  res.status(200).json(result);
};

export {
  createUser,
  deleteUser,
  filterUser,
  filterUsers,
  getAllUsers,
  getUser,
  getProfile,
  updateProfile,
  updateUser,
};
