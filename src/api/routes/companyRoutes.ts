import express from "express";
import { check } from "express-validator";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getAvailableCompanies,
  getCompanyRestaurants,
  getNearbyRestaurants,
  addRestaurantToCompany,
  removeRestaurantFromCompany,
  updateCompanySettings,
  getCompanyByTenantId,
} from "@/api/controllers/companyController";
import { getCompanyPayrollByDate } from "../controllers/paymentsController";

const router = express.Router();

const validateCompany = [
  check("name").notEmpty().withMessage("Name is required"),
  check("address")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  check("contactEmail")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),
  check("contactPhone")
    .optional()
    .isString()
    .withMessage("Contact phone must be a string"),
  check("tenantId").notEmpty().withMessage("Tenant ID is required"),
  check("restaurants")
    .optional()
    .isArray()
    .withMessage("Restaurants must be an array of ObjectIds"),
  check("members")
    .optional()
    .isArray()
    .withMessage("Members must be an array of ObjectIds"),
  check("coordinates")
    .optional()
    .custom((value) => {
      if (typeof value !== "object" || value === null) {
        throw new Error(
          "Coordinates must be an object with lat and lng properties",
        );
      }
      if (typeof value.lat !== "number" || typeof value.lng !== "number") {
        throw new Error("Coordinates must contain lat and lng as numbers");
      }
      return true;
    })
    .withMessage("Invalid coordinates object"),
];

router.get("/public/available", getAvailableCompanies);
router.get("/tenant/:tenantId", getCompanyByTenantId);
router.put("/settings/:id", updateCompanySettings);
router.get("/payroll/:tenantId", getCompanyPayrollByDate);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post("/", validateCompany, createCompany);
router.put("/:id", validateCompany, updateCompany);
router.delete("/:id", deleteCompany);
router.get("/:id/restaurants/nearby", getNearbyRestaurants);
router.get("/:id/restaurants", getCompanyRestaurants);
router.post("/:id/restaurants", addRestaurantToCompany);
router.delete(
  "/:companyId/restaurants/:restaurantId",
  removeRestaurantFromCompany,
);

export default router;
