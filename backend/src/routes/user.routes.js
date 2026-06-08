const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);

module.exports = router;
