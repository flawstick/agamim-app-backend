import { Request, Response, NextFunction } from "express";

export function extractTenantId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const tenantId = req.headers["x-tenant-id"] || req.body.tenantId;
  req.headers.tenantId = tenantId as string;
  next();
}
