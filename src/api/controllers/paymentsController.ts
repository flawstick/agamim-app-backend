import { Request, Response } from "express";
import OrderModel from "@/models/order";
import UserMonthlyPaymentModel from "@/models/userMonthlyPayment";
import { log } from "@/utils/log";

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
          userId: userId,
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
          userId: userId,
          month: adjustedTargetMonth,
          year: targetYear,
        });

        if (!userMonthlyPayment) {
          // Calculate the start and end dates for the target month
          const startDate = new Date(targetYear, adjustedTargetMonth, 1);
          const endDate = new Date(targetYear, adjustedTargetMonth + 1, 1);

          // Fetch orders for the target month
          const orders = await OrderModel.find({
            userId: userId,
            createdAt: { $gte: startDate, $lt: endDate },
          });

          const totalPayment = orders.reduce(
            (acc, order) => acc + order.totalPrice,
            0,
          );
          const numberOfOrders = orders.length;

          // Create a new user monthly payment record
          userMonthlyPayment = new UserMonthlyPaymentModel({
            userId: userId,
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
