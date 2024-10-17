import { Request, Response } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import UserModel from "@/models/user";
import CompanyModel from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { log } from "@/utils/log";
import RestaurantModel from "@/models/restaurant";
import { calculateDeliveryTime, haversineDistance } from "@/utils/harvestine";

export const getUsersByTenantId = async (req: Request, res: Response) => {
  const tenantId = req.headers["x-tenant-id"] as string;
  const userId = req.body.user.userId;

  if (!tenantId || !userId) {
    log.warn("Tenant ID or User ID is missing");
    return res.status(400).json({ message: "Tenant ID or User ID is missing" });
  }

  try {
    log.info(`Fetching company with tenant ID ${tenantId}`);
    const company = await CompanyModel.findOne({ tenantId });

    if (!company) {
      log.warn(`Company with tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (
      !company.members?.some(
        (member: mongoose.ObjectId) => member.toString() === userId,
      )
    ) {
      log.warn(
        `User with ID ${userId} not authorized to view users in tenant ID ${tenantId}`,
      );
      return res.status(403).json({
        message: `User not authorized, Insufficient permissions in tenant ${tenantId}`,
      });
    }

    const users = await UserModel.find({ tenantId: company.tenantId }).lean();
    log.info(`Fetched all users for tenant ID ${tenantId}`);
    res.status(200).json(users);
  } catch (error) {
    log.error("Error fetching users:", error as Error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.body.user.userId;

  try {
    const user = await UserModel.findById(id).lean();
    if (!user) {
      log.warn(`User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const company = await CompanyModel.findOne({
      tenantId: user.tenantId,
    }).lean();
    if (!company) {
      log.warn(`Company with tenant ID ${user.tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.members?.some((member) => member.toString() === userId)) {
      log.warn(
        `User with ID ${userId} not authorized to view user with ID ${id}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    log.info(`Fetched user with ID ${id}`);
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
    if (
      !company ||
      !company.members?.some((member) => member.toString() === userId)
    ) {
      log.warn(
        `User with ID ${userId} not authorized to create users in tenant ID ${user.tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    // Hash the user's password before saving
    const hashedPassword = await hashPassword(user.hashedPassword, 10);
    const newUser = new UserModel({ ...user, hashedPassword });

    await newUser.save();
    log.info("Created new user");
    res.status(201).json({ ...newUser.toObject(), user: null });
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
  const userId = req.body.user.userId;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      log.warn(`User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const company = await CompanyModel.findOne({ tenantId: user.tenantId });
    if (!company) {
      log.warn(`Company with tenant ID ${user.tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.members?.some((member) => member.toString() === userId)) {
      log.warn(
        `User with ID ${userId} not authorized to update users in tenant ID ${user.tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
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
  const userId = req.body.user.userId;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      log.warn(`User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const company = await CompanyModel.findOne({ tenantId: user.tenantId });
    if (!company) {
      log.warn(`Company with tenant ID ${user.tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.members?.some((member) => member.toString() === userId)) {
      log.warn(
        `User with ID ${userId} not authorized to delete users in tenant ID ${user.tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    await UserModel.findByIdAndDelete(id);
    log.info(`Deleted user with ID ${id}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    log.error(`Error deleting user with ID ${id}:`, error as Error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const tenantId = req.headers["x-tenant-id"] as string;
  const { userId, newPassword, confirmPassword } = req.body;
  const accountId = req.body.user.userId;

  if (newPassword !== confirmPassword) {
    log.warn(`Password confirmation does not match.`);
    return res
      .status(400)
      .json({ message: "New password and confirmation do not match" });
  }

  try {
    const company = await CompanyModel.findOne({ tenantId });
    if (
      !company ||
      !company.members?.some((member) => member.toString() === accountId)
    ) {
      log.warn(
        `User with ID ${accountId} not authorized to create users in tenant ID ${tenantId}`,
      );
      return res.status(403).json({ message: "User not authorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      log.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.hashedPassword = hashedPassword;
    await user.save();

    log.info(`Password updated for user ID ${userId}`);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    log.error(`Error changing password for user ID ${userId}:`, error as Error);
    res.status(500).json({ message: "Error changing password", error });
  }
};

// Function for users to get their own data based on jwt
export async function getOwnUser(req: Request, res: Response) {
  const userId = req.body.user.userId;

  try {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      log.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    log.info(`Fetched user with ID ${userId}`);
    res.status(200).json(user);
  } catch (error) {
    log.error(`Error fetching user with ID ${userId}:`, error as Error);
    res.status(500).json({ message: "Error fetching user", error });
  }
}

export async function getUserRestaurants(req: Request, res: Response) {
  let tenantId: string | undefined;
  let userId: string | undefined;

  try {
    tenantId = req.params?.tenantId;
    userId = req.body.user.userId;

    const user: any = await UserModel.findOne({ _id: userId, tenantId }).lean();
    if (!user) {
      log.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const company = await CompanyModel.findOne({ tenantId: tenantId }).lean();
    if (!company) {
      log.warn(`Company with tenant ID ${tenantId} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    const companyCoords = company.coordinates;
    if (!companyCoords || !companyCoords.lat || !companyCoords.lng) {
      log.warn(`Coordinates not found for company with tenant ID ${tenantId}`);
      return res
        .status(400)
        .json({ message: "Company coordinates not available" });
    }

    let restaurants = await RestaurantModel.find({
      _id: { $in: company.restaurants },
    }).lean();

    if (!restaurants || restaurants.length === 0) {
      log.warn(`No restaurants found for company with tenant ID ${tenantId}`);
      return res.status(404).json({ message: "No restaurants found" });
    }

    restaurants = restaurants.map((restaurant) => {
      const restaurantCoords = {
        lat: restaurant.location?.coordinates[0] as number,
        lng: restaurant.location?.coordinates[1] as number,
      };

      if (!restaurantCoords || !restaurantCoords.lat || !restaurantCoords.lng) {
        log.warn(
          `Coordinates not found for restaurant with ID ${restaurant._id}`,
        );
        return {
          ...restaurant,
          distance: null,
          deliveryTime: null,
        };
      }

      const distance = haversineDistance(companyCoords, restaurantCoords);
      const deliveryTime = calculateDeliveryTime(distance);

      return {
        ...restaurant,
        distance: parseFloat(distance.toFixed(2)),
        deliveryTime,
      };
    });

    log.info(`Fetched all restaurants for company with tenant ID ${tenantId}`);
    return res.status(200).json(restaurants);
  } catch (error) {
    log.error("Error fetching user restaurants:", error as Error);
    return res
      .status(500)
      .json({ message: "Error fetching user restaurants", error });
  }
}
