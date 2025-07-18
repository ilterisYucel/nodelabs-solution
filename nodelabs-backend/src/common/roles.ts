type UserRole = "admin" | "regular";

type Permission = string | "*";

type RolePermission = {
  name: UserRole;
  permissions: Permission[] | "*";
};

export type { UserRole, Permission, RolePermission };

const RoleConfig: RolePermission[] = [
  {
    name: "admin",
    permissions: "*",
  },
  {
    name: "regular",
    permissions: ["update-profile", "get-profile"],
  },
];

const getRolePermission = (role: string) => {
  const roleConfig = RoleConfig.find((conf) => conf.name === role);
  if (!roleConfig) {
    throw new Error("Invalid role");
  }
  return roleConfig.permissions;
};

const hasPermission = (permission: string, user: any): boolean => {
  const userRole = user.role;
  const rolePermissions = getRolePermission(userRole);
  if (rolePermissions === "*") return true;
  return rolePermissions.includes(permission);
};

export { RoleConfig, getRolePermission, hasPermission };
