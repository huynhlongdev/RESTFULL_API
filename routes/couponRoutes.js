const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupon,
  getCoupon,
  deleteCoupon,
  updateCoupon,
} = require("../controllers/couponController");
const { protected, allowedRole } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protected, allowedRole("admin", "manage"), createCoupon)
  .get(getAllCoupon);

router
  .route("/:code")
  .get(getCoupon)
  .put(protected, allowedRole("admin", "manage"), updateCoupon)
  .delete(protected, allowedRole("admin", "manage"), deleteCoupon);

module.exports = router;
