const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleGuard');
const { PrismaClient } = require('@prisma/client');
const { body, query, validationResult } = require('express-validator');
const prisma = new PrismaClient();

// GET all records (viewer, analyst, admin) — with filters
router.get('/', auth, async (req, res, next) => {
  try {
    const { type, category, from, to, page = 1, limit = 10 } = req.query;
    const where = { isDeleted: false };
    if (type)     where.type = type;
    if (category) where.category = category;
    if (from || to) where.date = {
      ...(from && { gte: new Date(from) }),
      ...(to   && { lte: new Date(to) })
    };

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where, skip: (page - 1) * limit, take: +limit,
        orderBy: { date: 'desc' }
      }),
      prisma.record.count({ where })
    ]);
    res.json({ records, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// POST — admin only
router.post('/', auth, role('admin'), [
  body('amount').isFloat({ gt: 0 }),
  body('type').isIn(['income', 'expense']),
  body('category').notEmpty(),
  body('date').isISO8601(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const record = await prisma.record.create({
      data: { ...req.body, date: new Date(req.body.date), userId: req.user.id }
    });
    res.status(201).json(record);
  } catch (e) { next(e); }
});

// PUT — admin only
router.put('/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const record = await prisma.record.update({
      where: { id: +req.params.id },
      data: { ...req.body, ...(req.body.date && { date: new Date(req.body.date) }) }
    });
    res.json(record);
  } catch (e) { next(e); }
});

// DELETE — soft delete, admin only
router.delete('/:id', auth, role('admin'), async (req, res, next) => {
  try {
    await prisma.record.update({ where: { id: +req.params.id }, data: { isDeleted: true } });
    res.json({ message: 'Record deleted' });
  } catch (e) { next(e); }
});

module.exports = router;