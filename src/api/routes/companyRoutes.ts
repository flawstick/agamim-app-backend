import express from "express";
import { check } from "express-validator";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getAvailableCompanies,
} from "@/api/controllers/companyController";

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

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post("/", validateCompany, createCompany);
router.put("/:id", validateCompany, updateCompany);
router.delete("/:id", deleteCompany);
router.get("/public/available", getAvailableCompanies);

export default router;
