/**
 * Indian Currency & Real Estate Budget Formatting Utility
 */

export const formatIndianCurrency = (amount, { isRental = false } = {}) => {
  if (amount === null || amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return "Not specified";
  }

  const num = Number(amount);

  if (isRental) {
    if (num >= 100000) {
      const inLakhs = (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2);
      return `₹ ${inLakhs} Lakh/month`;
    }
    return `₹ ${num.toLocaleString("en-IN")}/month`;
  }

  if (num >= 10000000) {
    const inCrores = (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 2);
    return `₹ ${inCrores} Cr`;
  }

  if (num >= 100000) {
    const inLakhs = (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2);
    return `₹ ${inLakhs} Lakh`;
  }

  return `₹ ${num.toLocaleString("en-IN")}`;
};

/**
 * Format client budget safely based on role (Buyer vs Renter)
 * Prevents assigning crore defaults to renters or inventing values when missing.
 */
export const formatClientBudget = (user = {}) => {
  if (!user) return "Not specified";

  const rawRole = (user.role || "").toLowerCase().trim();
  const isRenter = rawRole === "renter" || rawRole === "rental";

  if (isRenter) {
    // 1. Explicit rentalBudget field
    if (user.rentalBudget !== undefined && user.rentalBudget !== null && !isNaN(Number(user.rentalBudget)) && Number(user.rentalBudget) > 0) {
      return formatIndianCurrency(user.rentalBudget, { isRental: true });
    }

    // 2. String budgetRange inspection
    const range = (user.budgetRange || "").trim();
    if (!range) return "Not specified";

    // If string erroneously says Crores for a renter (from the schema bug), do NOT assume renter's budget is in crores
    if (/cr|crore/i.test(range)) {
      return "Not specified";
    }

    // If already formatted with monthly indicator
    if (/\/mo|\/month|month|per month/i.test(range)) {
      return range;
    }

    // If pure number (e.g. "25000")
    const cleanNum = Number(range.replace(/[^0-9.]/g, ""));
    if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum <= 500000) {
      return formatIndianCurrency(cleanNum, { isRental: true });
    }

    return range.includes("₹") ? range : `₹ ${range}`;
  }

  // Buyer Role
  if (user.buyerBudget !== undefined && user.buyerBudget !== null && !isNaN(Number(user.buyerBudget)) && Number(user.buyerBudget) > 0) {
    return formatIndianCurrency(user.buyerBudget, { isRental: false });
  }

  const range = (user.budgetRange || "").trim();
  if (!range) return "Not specified";

  return range;
};
