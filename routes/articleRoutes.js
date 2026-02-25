const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  aiAssist
} = require('../controllers/articleController');

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Protected routes (require valid JWT)
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

// AI assist route
router.post('/ai', protect, aiAssist);

module.exports = router;
