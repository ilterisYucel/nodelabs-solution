import bcrypt from "bcryptjs";
import "dotenv/config";
import jwt, { SignOptions } from "jsonwebtoken";
import { NodeLabsError } from "@/common/errors";
import * as UserService from "@/user/service";
import { LoginUserSchema, RegisterUserSchema } from "@/auth/types";
import { UserDocument } from "@/user/model";

const accessSecretKey = process.env.ACCESS_SECRET;
const refreshSecretKey = process.env.REFRESH_SECRET;
const accessExpires = process.env.ACCESS_EXPIRES;
const refreshExpires = process.env.REFRESH_EXPIRES;

const registerUser = async ({ email, password }: RegisterUserSchema) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split("@")[0];
  const newUser = await UserService.createUser({
    email: email,
    username: username,
    password: hashedPassword,
  });
  return newUser;
};

const loginUser = async ({ identifier, password }: LoginUserSchema) => {
  const userWithEmail = await UserService.filterUser({ email: identifier });
  const userWithUsername = await UserService.filterUser({
    username: identifier,
  });

  const user = userWithEmail || userWithUsername;
  if (!user) {
    throw new NodeLabsError(`Invalid credentials.`, 400);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new NodeLabsError(`Invalid credentials.`, 400);
  }
  user.isActive = true;
  user.lastActiveAt = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user);

  return { accessToken, refreshToken };
};

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, accessSecretKey as string);
  } catch (error) {
    throw new NodeLabsError("Token verify unsuccessful.", 401);
  }
};

const generateTokens = (user: UserDocument) => {
  const accessToken = jwt.sign(
    { ...user },
    accessSecretKey as string,
    {
      expiresIn: accessExpires as string,
    } as SignOptions
  );

  const refreshToken = jwt.sign(
    user._id,
    refreshSecretKey as string,
    {
      expiresIn: refreshExpires as string,
    } as SignOptions
  );

  return { accessToken, refreshToken };
};

export { loginUser, registerUser, verifyToken };
