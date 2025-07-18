interface RegisterUserSchema {
  email: string;
  password: string;
}

interface LoginUserSchema {
  identifier: string;
  password: string;
}

export type { LoginUserSchema, RegisterUserSchema };
