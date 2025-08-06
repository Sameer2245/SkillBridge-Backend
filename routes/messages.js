const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const {
  sendMessage,
  getConversationMessages,
  getUserConversations,
  startConversation,
  deleteMessage,
  getUnreadCount
} = require("../controllers/messageController");

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Message management
router.post("/", sendMessage);
router.post("/start-conversation", startConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:conversationId", getConversationMessages);
router.get("/unread-count", getUnreadCount);
router.delete("/:id", deleteMessage);

// File upload for messages
router.post("/upload-attachments", upload.array('attachments', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const attachments = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size
    }));

    res.json({
      message: "Files uploaded successfully",
      attachments
    });
  } catch (error) {
    console.error("Upload attachments error:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

module.exports = router;