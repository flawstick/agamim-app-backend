import { Request, Response } from "express";
import OrderModel from "@/models/order";
import UserMonthlyPaymentModel from "@/models/userMonthlyPayment";
import { log } from "@/utils/log";
import mongoose from "mongoose";
import { getPayrollByDate } from "@/payroll/getPayrollByDate";
import CompanyModel from "@/models/company";
import { generatePayrollXLSX } from "@/payroll/getXLSXByDate";

/*
 * Get the monthly payment of a userId
 * Dynamically calculates current month
 * for previous months creates a record in the database
 * if it already exists, just fetches in bulk like feed
 * fetches based on month offset not date for flexibility
 *
 * @param {Request} required req - The request object
 * @param {Response} required res - The response object
 * @query {number} optional bulk - The number of months to fetch
 * @query {number} optional monthOffset - The offset of the month to fetch
 * @returns {Promise<void>} - A promise that resolves to void
 * */
export async function getUserMonthlyPayment(req: Request, res: Response) {
  const { userId } = req.body?.user || {};
  const bulk = parseInt(req.query.bulk as string, 10) || 1; // Fetch up to 5 months
  const monthOffset = parseInt(req.query.monthOffset as string, 10) || 0;
  const maxBulk = Math.min(bulk, 10);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const results = [];

    for (let i = 0; i < maxBulk; i++) {
      const targetMonth = currentMonth - (monthOffset + i);
      const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
      const adjustedTargetMonth =
        targetMonth < 0 ? 11 + targetMonth + 1 : targetMonth;

      if (monthOffset + i === 0) {
        // Calculate payments dynamically for the current month without storing it
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 1);

        const orders = await OrderModel.find({
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lt: endDate },
        });

        if (orders.length > 0) {
          const totalPayment = orders.reduce(
            (acc, order) => acc + order.totalPrice,
            0,
          );
          const numberOfOrders = orders.length;

          results.push({
            month: currentMonth + 1,
            year: currentYear,
            totalPayment,
            numberOfOrders,
          });
        } else {
          results.push({
            month: currentMonth + 1,
            year: currentYear,
            totalPayment: 0,
            numberOfOrders: 0,
          });
        }
      } else {
        // Check if the user monthly payment record already exists for previous months
        let userMonthlyPayment = await UserMonthlyPaymentModel.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          month: adjustedTargetMonth,
          year: targetYear,
        });

        if (!userMonthlyPayment) {
          // Calculate the start and end dates for the target month
          const startDate = new Date(targetYear, adjustedTargetMonth, 1);
          const endDate = new Date(targetYear, adjustedTargetMonth + 1, 1);

          // Fetch orders for the target month
          const orders = await OrderModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lt: endDate },
          });

          const totalPayment = orders.reduce(
            (acc, order) => acc + order.totalPrice,
            0,
          );
          const numberOfOrders = orders.length;

          // Create a new user monthly payment record
          userMonthlyPayment = new UserMonthlyPaymentModel({
            userId: new mongoose.Types.ObjectId(userId),
            month: adjustedTargetMonth,
            year: targetYear,
            totalPayment: totalPayment,
            numberOfOrders: numberOfOrders,
          });

          await userMonthlyPayment.save();
        }

        results.push(userMonthlyPayment);
      }
    }

    log.info(
      `Fetched payments for user ${userId} for the last ${maxBulk} months.`,
    );
    return res.status(200).json(results);
  } catch (error) {
    log.error("Failed to get user monthly payments:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCompanyPayrollByDate(req: Request, res: Response) {
  let tenantId: string | null = null;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  try {
    tenantId = req.params.tenantId as string;
    startDate = new Date(req.query.start as string);
    endDate = new Date(req.query.end as string);

    let company = await CompanyModel.findOne({ tenantId });
    if (!company?.members?.includes(req.body?.user?.userId))
      return res.status(403).json({
        message:
          "User does not have permission to view payroll for this company",
      });

    let userMap: Record<string, any> = {};
    userMap = await getPayrollByDate(tenantId, startDate, endDate);
    return res.status(200).json(userMap);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
export async function getCompanyPayrollXLSXByDate(req: Request, res: Response) {
  try {
    const tenantId = req.params.tenantId as string;
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    const startDate = new Date(req.query.start as string);
    if (!startDate || isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "Invalid start date" });
    }

    const endDate = new Date(req.query.end as string);
    if (!endDate || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid end date" });
    }

    const language = (req.query.lang as "en" | "he" | "ar") || "en";

    // Validate user authorization
    const company = await CompanyModel.findOne({ tenantId });
    if (!company?.members?.includes(req.body?.user?.userId)) {
      return res.status(403).json({
        message:
          "User does not have permission to view payroll for this company",
      });
    }

    // Generate the XLSX buffer
    const xlsxBuffer = await generatePayrollXLSX(
      tenantId,
      startDate,
      endDate,
      language,
    );

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="payroll_summary.xlsx"',
    );
    res.setHeader("Content-Length", xlsxBuffer.length.toString());

    // Send the XLSX buffer as binary data
    return res.status(200).send(xlsxBuffer);
  } catch (error: any) {
    // Catch and return any errors
    return res.status(400).json({ message: error.message });
  }
}
