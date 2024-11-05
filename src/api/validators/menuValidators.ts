import { validationResult, param, body } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRestaurantId = [
  param("restaurantId").notEmpty().withMessage("Restaurant ID is required"),
];

export const validateCreateCategory = [
  body("category.name")
    .notEmpty()
    .withMessage("Category name is required")
    .isString()
    .withMessage("Category name must be a string"),
  body("category.description")
    .optional()
    .isString()
    .withMessage("Category description must be a string"),
  body("category.index")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Category index must be a non-negative integer"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
    });
  }
  next();
};
