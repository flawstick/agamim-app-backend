import { Request, Response } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import UserModel from "@/models/user";
import CompanyModel from "@/models/company";
import { log } from "@/utils/log";

export const getUsersByTenantId = async (req: Request, res: Response) => {
  const tenantId = req.headers["x-tenant-id"] as string;
  const userId = req.body.user ? req.body.user.userId : null;

  if (!tenantId || !userId) {
    log.warn("Tenant ID or User ID is missing");
    return res.status(400).json({ message: "Tenant ID or User ID is missing" });
  }

  try {
    log.info(`Fetching company with tenant ID ${tenantId}`);
    const company = await CompanyModel.findOne({ tenantId }).lean();

    if (!company) {
      log.warn(`Company with tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.members?.includes(userId)) {
      log.warn(
        `User with ID ${userId} not authorized to view users in tenant ID ${tenantId}`,
      );
      return res
        .status(403)
        .json({
          message: `User not authorized, Insufficient permissions in tenant ${tenantId}`,
        });
    }

    log.info(`Fetching users with tenant ID ${tenantId}`);
    const users = await UserModel.find({ tenantId: company.tenantId });
    res.status(200).json(users);
  } catch (error) {
    log.error("Error fetching users:", error as Error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.headers["x-tenant-id"] as string;
  const userId = req.body.user.userId;

  try {
    const company = await CompanyModel.findOne({ tenantId });
    if (!company) {
      log.warn(`Company with tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.members?.includes(new mongoose.Schema.ObjectId(userId))) {
      log.warn(
        `User with ID ${userId} not authorized to view users in tenant ID ${tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    const user = await UserModel.findById(id).lean();
    if (!user) {
      log.warn(`User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    log.error(`Error fetching user with ID ${id}:`, error as Error);
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const user = req.body;
  const userId = req.body.user.userId;

  try {
    const company = await CompanyModel.findOne({ tenantId: user.tenantId });
    if (!company || !company.members?.includes(userId)) {
      log.warn(
        `User with ID ${userId} not authorized to create users in tenant ID ${user.tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    const newUser = new UserModel(req.body);
    await newUser.save();
    log.info("Created new user");
    res.status(201).json({ ...newUser, user: null });
  } catch (error) {
    log.error("Error creating user:", error as Error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const tenantId = req.headers["x-tenant-id"] as string;
  const userId = req.body.user.userId;

  try {
    const company = await CompanyModel.findOne({ tenantId });
    if (!company || !company.members?.includes(userId)) {
      log.warn(
        `User with ID ${userId} not authorized to update users in tenant ID ${tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    const user = await UserModel.findOne({ _id: id, tenantId });
    if (!user) {
      log.warn(`User with ID ${id} and tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    log.info(`Updated user with ID ${id}`);
    res.status(200).json(updatedUser);
  } catch (error) {
    log.error(`Error updating user with ID ${id}:`, error as Error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.headers["x-tenant-id"] as string;
  const userId = req.body.user.userId;

  try {
    const company = await CompanyModel.findOne({ tenantId });
    if (!company || !company.members?.includes(userId)) {
      log.warn(
        `User with ID ${userId} not authorized to delete users in tenant ID ${tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    const user = await UserModel.findOne({ _id: id, tenantId });
    if (!user) {
      log.warn(`User with ID ${id} and tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    await UserModel.findByIdAndDelete(id);
    log.info(`Deleted user with ID ${id}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    log.error(`Error deleting user with ID ${id}:`, error as Error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};
