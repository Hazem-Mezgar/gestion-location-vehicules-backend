const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  attachCarsToCategory,
} = require("../controllers/categoryController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

// public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// admin-only
router.post("/", requireAuth, requireRole(["admin"]), createCategory);

router.put("/:id", requireAuth, requireRole(["admin"]), updateCategory);

router.delete("/:id", requireAuth, requireRole(["admin"]), deleteCategory);

router.put(
  "/:id/cars",
  requireAuth,
  requireRole(["admin"]),
  attachCarsToCategory
);

module.exports = router;
