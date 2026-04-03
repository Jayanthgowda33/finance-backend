const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleGuard');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List users — admin only
router.get('/', auth, role('admin'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true } });
    res.json(users);
  } catch (e) { next(e); }
});

// Update role or status — admin only
router.patch('/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const { role: newRole, isActive } = req.body;
    const update = {};
    if (newRole)    update.role     = newRole;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await prisma.user.update({ where: { id: +req.params.id }, data: update });
    res.json({ id: user.id, role: user.role, isActive: user.isActive });
  } catch (e) { next(e); }
});

module.exports = router;