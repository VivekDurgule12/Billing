const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateBillTotals = (items = [], summary = {}) => {
  const subtotal = items.reduce(
    (sum, item) => sum + number(item.qty) * number(item.rate),
    0
  );

  const totalWeight = items.reduce(
    (sum, item) =>
      sum + number(item.qty) * number(item.weightPerUnit),
    0
  );

  const discount = Math.min(
    subtotal,
    Math.max(
      0,
      summary.discountType === "percentage"
        ? (subtotal * number(summary.discountValue)) / 100
        : number(summary.discountValue)
    )
  );

  // Porterage settings
  const porterageRate = number(summary.porterageRate) || 10;
  const porteragePerKg = number(summary.porteragePerKg) || 30;

  // Automatically calculate porterage from total weight
  const calculatedPorterage =
    Math.round(
      (totalWeight / porteragePerKg) *
        porterageRate *
        100
    ) / 100;

  // If user entered a porterage value, use it.
  // Otherwise use the automatically calculated value.
 // Empty Porterage = automatic calculation.
// 0 and negative values are valid manual values.
const porterage =
  summary.porterage === "" ||
  summary.porterage === undefined ||
  summary.porterage === null
    ? calculatedPorterage
    : number(summary.porterage);

  const oldBalance = Math.max(
    0,
    number(summary.oldBalance)
  );

  const receivedAmount = Math.max(
    0,
    number(summary.receivedAmount)
  );

  const afterDiscount = subtotal - discount;

  const total =
    afterDiscount +
    porterage +
    oldBalance;

  const payable = Math.max(
    0,
    total - receivedAmount
  );

  const totalProfit = items.reduce(
    (sum, item) =>
      sum +
      (number(item.rate) - number(item.costPrice)) *
        number(item.qty),
    0
  );

  return {
    subtotal,
    totalWeight,
    discount,
    afterDiscount,
    porterage,
    oldBalance,
    receivedAmount,
    total,
    payable,
    totalProfit
  };
};

export const normalizeBillItems = (items = []) => {
  const byProduct = new Map();

  items.forEach((item, index) => {
    const productId =
      item.productId ??
      item.sku ??
      item.sn ??
      item.id ??
      `legacy-${item.name}-${index}`;

    const existing = byProduct.get(String(productId));

    if (existing) {
      existing.qty += number(item.qty);
      existing.amount =
        existing.qty * number(existing.rate);
    } else {
      const qty = number(item.qty);
      const rate = number(item.rate);

      byProduct.set(String(productId), {
        ...item,
        id: item.id ?? `item-${productId}`,
        productId,
        qty,
        rate,
        amount: qty * rate
      });
    }
  });

  return [...byProduct.values()];
};