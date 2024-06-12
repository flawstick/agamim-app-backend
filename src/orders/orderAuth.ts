import { Request, Response, NextFunction } from "express";

export function extractTenantId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const tenantId = req.headers["x-tenant-id"] || req.body.tenantId;
  if (!tenantId) {
    return res.status(400).json({ message: "Tenant ID is required" });
  }
  req.headers.tenantId = tenantId as string;
  next();
}
