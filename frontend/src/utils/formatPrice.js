export const formatPrice = (price, { isRental = false } = {}) => {
  if (price === null || price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    return isRental ? "₹0/mo" : "₹0";
  }
  const num = Number(price);

  if (isRental) {
    if (num >= 100000) {
      const inLakhs = (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2);
      return `₹${inLakhs} Lakh/month`;
    }
    return `₹${num.toLocaleString("en-IN")}/month`;
  }

  if (num >= 10000000) {
    const inCr = (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 2);
    return `₹${inCr} Cr`;
  }
  if (num >= 100000) {
    const inLakhs = (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2);
    return `₹${inLakhs} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Safely format client budget based on client role and stored preferences.
 * Correctly distinguishes Buyer purchase budgets from Renter monthly rental budgets.
 * Displays "Not specified" when missing or invalid, avoiding invented defaults.
 */
export const formatClientBudget = (client = {}) => {
  if (!client) return "Not specified";

  const rawRole = (client.role || client.type || "").toLowerCase().trim();
  const isRenter = rawRole === "renter" || rawRole === "rental";

  if (isRenter) {
    // 1. Explicit rentalBudget field
    if (
      client.rentalBudget !== undefined &&
      client.rentalBudget !== null &&
      !isNaN(Number(client.rentalBudget)) &&
      Number(client.rentalBudget) > 0
    ) {
      return formatPrice(client.rentalBudget, { isRental: true });
    }

    // 2. String budget inspection
    const range = (client.budget || client.budgetRange || client.rawBudget || "").trim();
    if (!range) return "Not specified";

    // Prevent erroneous crore default from showing for renters
    if (/cr|crore/i.test(range)) {
      return "Not specified";
    }

    if (/\/mo|\/month|month|per month/i.test(range)) {
      return range;
    }

    const cleanNum = Number(range.replace(/[^0-9.]/g, ""));
    if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum <= 500000) {
      return formatPrice(cleanNum, { isRental: true });
    }

    return range.includes("₹") ? `${range}/month` : `₹${range}/month`;
  }

  // Buyer Role
  if (
    client.buyerBudget !== undefined &&
    client.buyerBudget !== null &&
    !isNaN(Number(client.buyerBudget)) &&
    Number(client.buyerBudget) > 0
  ) {
    return formatPrice(client.buyerBudget, { isRental: false });
  }

  const range = (client.budget || client.budgetRange || client.rawBudget || "").trim();
  if (!range) return "Not specified";

  return range;
};
