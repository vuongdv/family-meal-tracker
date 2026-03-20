/**
 * Calculate how much each person should pay/receive
 * based on all entries for a given month.
 *
 * @param {Array} entries - list of daily entries
 * @param {Array} members - list of member names
 * @returns {Object} { balances, transfers, totalSpent, perPerson }
 */
export function calculateSettlement(entries, members) {
  const n = members.length;
  if (n === 0 || entries.length === 0) {
    return {
      balances: [],
      transfers: [],
      totalSpent: 0,
      perPersonSummary: members.map((name) => ({
        name,
        spent: 0,
        shouldPay: 0,
        diff: 0,
      })),
    };
  }

  // Net balance for each member: positive = is owed money, negative = owes money
  const netBalance = new Array(n).fill(0);
  const totalSpentByPerson = new Array(n).fill(0);
  const totalShouldPay = new Array(n).fill(0);

  for (const entry of entries) {
    const { buyerIndex, amount, participants } = entry;
    const share = amount / participants.length;

    // The buyer spent this amount
    totalSpentByPerson[buyerIndex] += amount;

    // Each participant should pay their share
    for (const pIdx of participants) {
      totalShouldPay[pIdx] += share;
    }

    // Update net balance:
    // Buyer is owed the full amount minus their own share
    // Each other participant owes their share
    netBalance[buyerIndex] += amount;
    for (const pIdx of participants) {
      netBalance[pIdx] -= share;
    }
  }

  // Calculate optimized transfers using the greedy algorithm
  const transfers = minimizeTransfers(netBalance, members);

  const totalSpent = totalSpentByPerson.reduce((a, b) => a + b, 0);

  const perPersonSummary = members.map((name, i) => ({
    name,
    spent: totalSpentByPerson[i],
    shouldPay: totalShouldPay[i],
    diff: totalSpentByPerson[i] - totalShouldPay[i],
  }));

  return {
    balances: netBalance,
    transfers,
    totalSpent,
    perPersonSummary,
  };
}

/**
 * Minimize the number of transfers needed to settle all debts.
 * Uses a greedy approach: match the largest creditor with the largest debtor.
 *
 * @param {Array<number>} netBalance - net balance per person
 * @param {Array<string>} members - member names
 * @returns {Array} list of { from, to, fromName, toName, amount }
 */
function minimizeTransfers(netBalance, members) {
  const balances = [...netBalance];
  const transfers = [];

  // Separate into debtors (negative balance) and creditors (positive balance)
  while (true) {
    let maxCreditorIdx = -1;
    let maxDebtorIdx = -1;
    let maxCredit = 0;
    let maxDebt = 0;

    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > maxCredit + 0.01) {
        maxCredit = balances[i];
        maxCreditorIdx = i;
      }
      if (balances[i] < -maxDebt - 0.01) {
        maxDebt = -balances[i];
        maxDebtorIdx = i;
      }
    }

    if (maxCreditorIdx === -1 || maxDebtorIdx === -1) break;

    const transferAmount = Math.min(maxCredit, maxDebt);
    if (transferAmount < 1) break; // Less than 1 VND, stop

    transfers.push({
      from: maxDebtorIdx,
      to: maxCreditorIdx,
      fromName: members[maxDebtorIdx],
      toName: members[maxCreditorIdx],
      amount: Math.round(transferAmount),
    });

    balances[maxCreditorIdx] -= transferAmount;
    balances[maxDebtorIdx] += transferAmount;
  }

  return transfers;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Format currency in VND
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get current month string YYYY-MM
 */
export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get today's date string YYYY-MM-DD
 */
export function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Format date to Vietnamese display
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Get month label from YYYY-MM
 */
export function getMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  return `Tháng ${parseInt(month)}/${year}`;
}
