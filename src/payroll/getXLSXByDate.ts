import XLSX from "xlsx";
import { Types } from "mongoose";
import { getPayrollByDate } from "@/payroll/getPayrollByDate"; // Adjust the import path

const HEADERS = {
  en: {
    summary: [
      "Worker ID",
      "Username",
      "Total Orders",
      "Total Value",
      "Discounted Totals",
    ],
  },
  he: {
    summary: [
      "מספר עובד",
      "שם משתמש",
      'סה"כ הזמנות',
      'סה"כ ערך',
      'סה"כ לאחר הנחה',
    ],
  },
  ar: {
    summary: [
      "رقم العامل",
      "اسم المستخدم",
      "إجمالي الطلبات",
      "القيمة الإجمالية",
      "إجمالي بعد الخصم",
    ],
  },
};

/**
 * Calculates the column widths for the sheet based on the length of the cell values.
 */
function calculateColumnWidths(data: any[][]): { wch: number }[] {
  // Compute max width for each column
  const colWidths: number[] = data[0].map((_col: any, colIndex: number) =>
    data.reduce((maxWidth, row) => {
      const val = row[colIndex] != null ? row[colIndex].toString() : "";
      return Math.max(maxWidth, val.length);
    }, 10),
  );
  return colWidths.map((w) => ({ wch: w + 2 })); // Add some padding
}

/**
 * Generates an XLSX workbook from payroll data without including individual orders.
 * It only shows aggregated user data.
 *
 * Columns:
 * Worker ID | Username | Total Orders | Total Value | Discounted Totals
 *
 * Final Rows:
 * - Totals
 * - Net Amount (Total Value - Discounted Totals)
 * - Amount Company Paid (Discounted Totals)
 *
 * @param {string | Types.ObjectId} tenantId - The ID of the tenant (company).
 * @param {Date} startDate - The start date for the payroll period.
 * @param {Date} endDate - The end date for the payroll period.
 * @param {"en"|"he"|"ar"} lang - The language for the headers.
 * @returns {Promise<Buffer>} - A buffer representing the XLSX file.
 */
export async function generatePayrollXLSX(
  tenantId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date,
  lang: "en" | "he" | "ar" = "en",
): Promise<Buffer> {
  // Fetch the payroll data
  const payrollMap = await getPayrollByDate(tenantId, startDate, endDate);

  const summaryHeaders = HEADERS[lang].summary;
  const summaryData = [summaryHeaders];

  let totalOrdersSum = 0;
  let totalValueSum = 0;
  let totalDiscountedSum = 0;

  // Populate the summary sheet
  for (const entry of Object.values(payrollMap)) {
    const { username, workerId, totalValue, orderCount, orders } = entry;

    // Sum of discounted totals for this user
    const userDiscountedSum = orders.reduce(
      (sum, o) => sum + (o.discountedPrice ?? o.totalPrice),
      0,
    );

    totalOrdersSum += orderCount;
    totalValueSum += totalValue;
    totalDiscountedSum += userDiscountedSum;

    summaryData.push([
      workerId?.toString() ?? "",
      username,
      orderCount.toString(),
      totalValue.toFixed(2),
      userDiscountedSum.toFixed(2),
    ]);
  }

  // Add totals row
  if (summaryData.length > 1) {
    summaryData.push([
      "",
      "Totals",
      totalOrdersSum.toString(),
      totalValueSum.toFixed(2),
      totalDiscountedSum.toFixed(2),
    ]);
  }

  // Add net amount row (Total Value - Discounted Totals)
  const netAmount = totalValueSum - totalDiscountedSum;
  summaryData.push(["", "Net Amount", "", netAmount.toFixed(2), ""]);

  // Add amount company paid row (Discounted Totals)
  summaryData.push([
    "",
    "Amount Company Paid",
    "",
    "",
    totalDiscountedSum.toFixed(2),
  ]);

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Create summary sheet
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);

  // Calculate column widths
  summaryWS["!cols"] = calculateColumnWidths(summaryData);

  // Append sheet to the workbook
  XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

  // Write the workbook to a buffer without styles
  const xlsxBuffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  });

  return xlsxBuffer;
}
