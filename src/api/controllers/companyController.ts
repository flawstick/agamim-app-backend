import { Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import CompanyModel from "@/models/company";
import { log } from "@/utils/log";

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
      members: userId,
    }).lean();
    if (!company) {
      log.warn(
        `Company with ID ${id} not found or user ${userId} not a member`,
      );
      return res.status(404).json({ message: "Company not found" });
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
      .select("tenantId name coordinates")
      .lean();
    log.info(`Fetched all companies for ${req.get("origin")}`);
    res.status(200).json(companies);
  } catch (error) {
    log.error("Error fetching companies:", error as Error);
    res.status(500).json({ message: "Error fetching companies", error });
  }
};
