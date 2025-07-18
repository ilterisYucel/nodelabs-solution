import { Request } from "express";

const getHeader = (req: Request, headerName: string) => {
  const lowerCaseHeaderName = headerName.toLowerCase();
  for (const key in req.headers) {
    if (key.toLowerCase() === lowerCaseHeaderName) {
      return req.headers[key];
    }
  }
  return null;
};

const getBearerToken = (header: any) => {
  if (header && typeof header === "string" && header.startsWith("Bearer ")) {
    // Extract the token by removing the "Bearer " prefix
    return header.slice(7); // "Bearer ".length === 7
  }
  return null;
};

export { getBearerToken, getHeader };
