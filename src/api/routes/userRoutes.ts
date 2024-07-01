import express from "express";
import { check, body } from "express-validator";
import {
  getUsersByTenantId,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "@/api/controllers/userController";

const router = express.Router();

const validateUser = [
  check("username").notEmpty().withMessage("Username is required"),
  check("hashedPassword").notEmpty().withMessage("Password is required"),
  check("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string"),
  check("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),
  check("tenantId").notEmpty().withMessage("Tenant ID is required"),
];

export const validateChangePassword = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required"),
  body("userId").notEmpty().withMessage("User ID is required"),
];

router.get("/", getUsersByTenantId);
router.get("/:id", getUserById);
router.post("/", validateUser, createUser);
router.put("/:id", validateUser, updateUser);
router.delete("/:id", deleteUser);
router.post("/change-password", validateChangePassword, changePassword);

export default router;
