import { Types } from "mongoose";
import OrderModel from "@/models/order";
import CompanyModel from "@/models/company";

// Interface for the result
interface ICompanyStats {
  thisMonthTotal: number;
  monthChangePercentage: number;
  thisWeekTotal: number;
  weekChangePercentage: number;
}

/**
 * Gets the company's financial stats for the current month/week vs. last month/week.
 * - Validates the company membership of the user.
 * - Calculates:
 *    1. This month's total order revenue and the percentage change from last month.
 *    2. This week's total order revenue and the percentage change from last week.
 *
 * @param {string} tenantId - The tenant ID of the company
 * @param {Types.ObjectId} userId - The ID of the user requesting the data
 * @returns {Promise<ICompanyStats>} The financial statistics
 */
export async function getCompanyStats(
  tenantId: string,
  userId: Types.ObjectId,
): Promise<ICompanyStats> {
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  // Validate that the user belongs to the specified company
  const company = await CompanyModel.findOne({
    tenantId,
    members: { $elemMatch: { $eq: userId } },
  });

  if (!company) {
    throw new Error(
      `Company with tenantId ${tenantId} not found or user is not a member`,
    );
  }

  // Dates for monthly comparison
  // Current month start (e.g., 1st of current month at 00:00)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Start of last month and end of last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  // Dates for weekly comparison
  // We assume the week starts on Monday. Adjust as needed.
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday=0, Sunday=6
  const startOfThisWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - currentDayOfWeek,
  );
  const startOfLastWeek = new Date(
    startOfThisWeek.getFullYear(),
    startOfThisWeek.getMonth(),
    startOfThisWeek.getDate() - 7,
  );
  const endOfLastWeek = new Date(
    startOfThisWeek.getFullYear(),
    startOfThisWeek.getMonth(),
    startOfThisWeek.getDate() - 1,
    23,
    59,
    59,
    999,
  );

  // Helper function to sum totalPrice for a given date range
  async function getTotalForPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const orders = await OrderModel.aggregate([
      {
        $match: {
          tenantId,
          status: { $nin: ["cancelled", "rejected"] },
          createdAt: {
            $gte: startDate,
            ...(endDate ? { $lte: endDate } : {}),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    return orders.length > 0 ? orders[0].totalRevenue : 0;
  }

  // Get totals
  const thisMonthTotal = await getTotalForPeriod(startOfThisMonth, now);
  const lastMonthTotal = await getTotalForPeriod(
    startOfLastMonth,
    endOfLastMonth,
  );

  const thisWeekTotal = await getTotalForPeriod(startOfThisWeek, now);
  const lastWeekTotal = await getTotalForPeriod(startOfLastWeek, endOfLastWeek);

  // Calculate percentage changes
  // Percentage change = ((This period - Last period) / Last period) * 100
  // If last period total is 0, handle accordingly (e.g. if last month was 0, any positive number this month = 100% increase)
  function calcPercentageChange(thisValue: number, lastValue: number): number {
    if (lastValue === 0) {
      if (thisValue === 0) {
        return 0; // no change
      } else {
        return 100; // went from 0 to something positive, treat as 100% increase
      }
    }
    return ((thisValue - lastValue) / lastValue) * 100;
  }

  const monthChangePercentage = calcPercentageChange(
    thisMonthTotal,
    lastMonthTotal,
  );
  const weekChangePercentage = calcPercentageChange(
    thisWeekTotal,
    lastWeekTotal,
  );

  return {
    thisMonthTotal,
    monthChangePercentage,
    thisWeekTotal,
    weekChangePercentage,
  };
}
