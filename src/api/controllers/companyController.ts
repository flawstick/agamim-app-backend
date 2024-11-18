import mongoose, { Types } from "mongoose";
import { Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import CompanyModel from "@/models/company";
import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";
import { ObjectId } from "mongoose";
import UserModel from "@/models/user";

export const getAllCompanies = async (req: Request, res: Response) => {
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const companies = await CompanyModel.find({ members: userId }).lean();
    log.info(`Fetched all companies for user ${userId}`);
    res.status(200).json(companies);
  } catch (error) {
    log.error(`Error fetching companies for user ${userId}:`, error as Error);
    res.status(500).json({ message: "Error fetching companies", error });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({
      _id: id,
    }).lean();
    if (!company) {
      log.warn(`Company with ID ${id} not found`);
      return res.status(404).json({ message: "Company not found" });
    }

    const user = await UserModel.findOne({
      tenantId: company?.tenantId,
      _id: userId,
    });

    const isMember = company.members?.find(
      (member: ObjectId) => member.toString() === userId,
    );

    if (!user || !isMember) {
      log.warn(
        `User with ID ${userId} is not a member of company with ID ${id}`,
      );
      return res.status(403).json({ message: "User is not a member" });
    }

    log.info(`Fetched company with ID ${id} for user ${userId}`);
    res.status(200).json(company);
  } catch (error) {
    log.error(
      `Error fetching company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res.status(500).json({ message: "Error fetching company", error });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn("Validation errors:", errors.array() as ValidationError[]);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newCompany = new CompanyModel(req.body);
    await newCompany.save();
    log.info("Created new company");
    res.status(201).json(newCompany);
  } catch (error) {
    log.error("Error creating company:", error as Error);
    res.status(500).json({ message: "Error creating company", error });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn("Validation errors:", errors.array() as ValidationError[]);
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({ _id: id, members: userId });
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    const updatedCompany = await CompanyModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    log.info(`Updated company with ID ${id} for user ${userId}`);
    res.status(200).json(updatedCompany);
  } catch (error) {
    log.error(
      `Error updating company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res.status(500).json({ message: "Error updating company", error });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({ _id: id, members: userId });
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    await CompanyModel.findByIdAndDelete(id);
    log.info(`Deleted company with ID ${id} for user ${userId}`);
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    log.error(
      `Error deleting company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res.status(500).json({ message: "Error deleting company", error });
  }
};

export const getAvailableCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await CompanyModel.find()
      .select("tenantId name coordinates profile")
      .lean();
    log.info(`Fetched all companies for ${req.get("origin")}`);
    res.status(200).json(companies);
  } catch (error) {
    log.error("Error fetching companies:", error as Error);
    res.status(500).json({ message: "Error fetching companies", error });
  }
};

// this returns an array of restaurants with avatar name, rating, category, and address and coordinates
export const getCompanyRestaurants = async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId: string | undefined;
  let restaurants: any[] = [];
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({
      _id: id,
      members: userId,
    }).lean();
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    for (const restaurant of company.restaurants) {
      const restaurantData = await RestaurantModel.findById(restaurant).lean();
      if (restaurantData) {
        const name = restaurantData.name || "No name available";
        const profile = restaurantData.profile || "No profile available";
        const rating = restaurantData.rating || 0;
        const category = restaurantData.category || "No category available";
        const address = restaurantData.address || "No address available";
        const location = restaurantData.location || {
          type: "Point",
          coordinates: [0, 0],
        };

        // Add the restaurant data to the array, even if some properties are missing
        restaurants.push({
          _id: restaurantData._id,
          name,
          profile,
          rating,
          category,
          address,
          location,
        });
      }
      return res.status(200).json(restaurants);
    }
  } catch (error) {
    log.error(
      `Error fetching restaurants for company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res.status(500).json({ message: "Error fetching restaurants", error });
  }
};

export const getNearbyRestaurants = async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId: string | undefined;

  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({
      _id: id,
      members: userId,
    }).lean();

    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    const { coordinates } = company;
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      log.warn(`Coordinates not found for company with ID ${id}`);
      return res.status(400).json({ message: "Coordinates not available" });
    }

    const { lng, lat } = coordinates;
    const radiusInKilometers = 20;

    // Use $geoNear to compute distances and fetch nearby restaurants
    const restaurants = await RestaurantModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] }, // Company's coordinates
          distanceField: "distance", // Name of the field where the distance will be stored
          spherical: true, // Use spherical calculations
          maxDistance: radiusInKilometers * 1000, // Convert to meters (MongoDB expects meters)
        },
      },
    ]);

    // Optionally, convert distance from meters to kilometers
    const restaurantsWithDistanceInKilometers = restaurants.map(
      (restaurant) => ({
        ...restaurant,
        distance: (restaurant.distance / 1000).toFixed(2), // Convert meters to kilometers, rounding to 2 decimals
        name: restaurant.name || "No name available",
        profile: restaurant.profile || "No profile available",
        rating: restaurant.rating || 0,
        category: restaurant.category || "No category available",
        address: restaurant.address || "No address available",
      }),
    );

    log.info(
      `Fetched nearby restaurants with distances for company with ID ${id} for user ${userId}`,
    );

    return res.status(200).json(restaurantsWithDistanceInKilometers);
  } catch (error) {
    log.error(
      `Error fetching nearby restaurants with distances for company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    return res
      .status(500)
      .json({ message: "Error fetching nearby restaurants", error });
  }
};

export const addRestaurantToCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({
      _id: id,
      members: userId,
    });
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    const { restaurantId } = req.body;
    if (!restaurantId) {
      log.warn("Restaurant ID is required");
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      log.warn(`Restaurant with ID ${restaurantId} not found`);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (company.restaurants.includes(restaurantId)) {
      log.warn(
        `Restaurant with ID ${restaurantId} already exists in company with ID ${id}`,
      );
      return res
        .status(400)
        .json({ message: "Restaurant already exists in company" });
    }

    company.restaurants.push(restaurantId);
    await company.save();
    log.info(
      `Added restaurant with ID ${restaurantId} to company with ID ${id} for user ${userId}`,
    );
    res.status(200).json({ message: "Restaurant added to company" });
  } catch (error) {
    log.error(
      `Error adding restaurant to company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res
      .status(500)
      .json({ message: "Error adding restaurant to company", error });
  }
};

export const removeRestaurantFromCompany = async (
  req: Request,
  res: Response,
) => {
  const { companyId: id } = req.params;
  let userId: string | undefined;
  try {
    userId = req.body.user.userId;
    const company = await CompanyModel.findOne({
      _id: id,
      members: userId,
    });
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
    }

    const { restaurantId } = req.params;
    if (!restaurantId) {
      log.warn("Restaurant ID is required");
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    if (
      !company.restaurants.includes(
        // @ts-ignore
        new mongoose.Types.ObjectId(restaurantId),
      )
    ) {
      log.warn(
        `Restaurant with ID ${restaurantId} does not exist in company with ID ${id}`,
      );
      return res
        .status(400)
        .json({ message: "Restaurant does not exist in company" });
    }

    company.restaurants = company.restaurants.filter(
      (restaurant: ObjectId) => restaurant.toString() !== restaurantId,
    );
    await company.save();
    log.info(
      `Removed restaurant with ID ${restaurantId} from company with ID ${id} for user ${userId}`,
    );
    res.status(200).json({ message: "Restaurant removed from company" });
  } catch (error) {
    log.error(
      `Error removing restaurant from company with ID ${id} for user ${userId}:`,
      error as Error,
    );
    res
      .status(500)
      .json({ message: "Error removing restaurant from company", error });
  }
};

export function updateCompanySettings(req: Request, res: Response) {
  const { id } = req.params;
  let userId: string | undefined;
  const {
    name,
    companyUrl,
    companyLogo,
    description,
    maxOrdersPerDay,
    maxOrdersPerMonth,
    maxPerOrder,
    maxOrderShekels,
    companyContributionPercentage,
  } = req.body;

  try {
    userId = req.body.user.userId;

    const entries: any = {
      name,
      description,
      maxOrdersPerDay,
      maxOrdersPerMonth,
      maxPerOrder,
      maxOrderShekels,
      companyContributionPercentage,
    };

    // Add profile only if companyUrl or companyLogo are defined
    if (companyUrl !== undefined || companyLogo !== undefined) {
      entries["profile"] = {};
      if (companyUrl !== undefined)
        entries["profile"]["url"] = companyUrl || "";
      if (companyLogo !== undefined)
        entries["profile"]["logo"] = companyLogo || "";
    }

    const newEntries = Object.entries(entries).reduce(
      (acc: any, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    CompanyModel.findOneAndUpdate(
      { _id: id, members: userId },
      {
        $set: newEntries, // Ensure you're using $set to only update specified fields
      },
      { new: true, runValidators: true }, // Ensure validators are run on updates
    )
      .then((company) => {
        if (!company) {
          log.warn(
            `Company with ID ${id} not found or user ${userId} not a member`,
          );
          return res.status(404).json({ message: "Company not found" });
        }

        log.info(
          `Updated settings for company with ID ${id} for user ${userId}`,
        );
        return res
          .status(200)
          .json({ message: "Company settings updated", company });
      })
      .catch((error) => {
        log.error(
          `Error updating settings for company with ID ${id} for user ${userId}:`,
          error as Error,
        );
        return res
          .status(500)
          .json({ message: "Error updating company settings", error });
      });
  } catch (error) {
    log.error("Error getting user ID from request body:", error as Error);
    return res.status(400).json({ message: "User ID is required" });
  }
}
