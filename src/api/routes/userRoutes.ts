import express from "express";
import { check } from "express-validator";
import {
  getUsersByTenantId,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getOwnUser,
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

const validateChangePassword = [
  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required"),
  check("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
  check("userId").notEmpty().withMessage("User ID is required"),
];

router.get("/", getUsersByTenantId);
router.get("/:id", getUserById);
router.post("/", validateUser, createUser);
router.put("/:id", validateUser, updateUser);
router.delete("/:id", deleteUser);
router.post("/change-password", validateChangePassword, changePassword);
router.get("/get-own-user", getOwnUser);

export default router;
