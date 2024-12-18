import XLSX from "xlsx";
import { Types } from "mongoose";
import { getPayrollByDate } from "@/payroll/getPayrollByDate"; // Adjust the import path

const HEADERS = {
  en: {
    summary: [
      "User ID",
      "Username",
      "Worker ID",
      "Total Orders",
      "Total Value",
      "Average Discounted Value Per Order",
      "Total Payroll",
    ],
  },
  he: {
    summary: [
      "תעודת זהות",
      "שם משתמש",
      "מספר עובד",
      'סה"כ הזמנות',
      'סה"כ ערך',
      "ערך ממוצע לאחר הנחה",
      "סך הכל",
    ],
  },
  ar: {
    summary: [
      "رقم المستخدم",
      "اسم المستخدم",
      "رقم العامل",
      "إجمالي الطلبات",
      "القيمة الإجمالية",
      "متوسط القيمة المخفضة",
      "المجموع الكلي",
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
  let totalPayroll = 0;

  // Populate the summary sheet
  for (const [userId, entry] of Object.entries(payrollMap)) {
    const { username, workerId, totalValue, orderCount, orders } = entry;
    // Calculate average discounted
    const avgDiscounted =
      orders.length > 0
        ? orders.reduce(
            (sum, o) => sum + (o.discountedPrice ?? o.totalPrice),
            0,
          ) / orders.length
        : 0;

    totalPayroll += totalValue;

    summaryData.push([
      userId,
      username,
      workerId?.toString() ?? "",
      orderCount.toString(),
      totalValue.toString(),
      avgDiscounted.toFixed(2),
      "", // Placeholder for total payroll row
    ]);
  }

  // After adding all users, add a total payroll row at the bottom
  if (summaryData.length > 1) {
    summaryData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      totalPayroll.toFixed(2), // total payroll in the last column
    ]);
  }

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
