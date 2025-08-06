const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  createOrder,
  confirmPayment,
  getUserOrders,
  getOrderById,
  deliverOrder,
  acceptDelivery,
  requestRevision,
  cancelOrder
} = require("../controllers/orderController");

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Order management
router.post("/", createOrder);
router.post("/confirm-payment", confirmPayment);
router.post("/create-checkout-session", require('../controllers/paymentController').createCheckoutSession);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

// Order actions
router.post("/:id/deliver", deliverOrder);
router.post("/:id/accept", acceptDelivery);
router.post("/:id/revision", requestRevision);
router.post("/:id/cancel", cancelOrder);

module.exports = router;