const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleGuard');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/summary', auth, role('analyst', 'admin'), async (req, res, next) => {
  try {
    const records = await prisma.record.findMany({ where: { isDeleted: false } });

    const totalIncome  = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

    // Category totals
    const byCategory = {};
    records.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
    });

    // Monthly trends (last 6 months)
    const monthlyMap = {};
    records.forEach(r => {
      const key = r.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      monthlyMap[key][r.type] += r.amount;
    });

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      byCategory,
      monthlyTrends: monthlyMap,
      recentActivity: records.slice(-5).reverse()
    });
  } catch (e) { next(e); }
});

module.exports = router;