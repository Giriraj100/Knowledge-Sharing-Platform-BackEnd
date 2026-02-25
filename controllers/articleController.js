const { pool } = require('../config/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all articles (with search & filter)
const getArticles = async (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT a.id, a.title, a.summary, a.category, a.created_at, u.username as author FROM articles a JOIN users u ON a.author_id = u.id';
  const queryParams = [];

  const conditions = [];
  if (category) {
    conditions.push('a.category = ?');
    queryParams.push(category);
  }
  if (search) {
    conditions.push('(a.title LIKE ? OR a.content LIKE ? OR a.tags LIKE ?)');
    const searchString = `%${search}%`;
    queryParams.push(searchString, searchString, searchString);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.created_at DESC';

  try {
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving articles' });
  }
};

// Get single article by ID
const getArticleById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.username as author FROM articles a JOIN users u ON a.author_id = u.id WHERE a.id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving article' });
  }
};

// Create an article
const createArticle = async (req, res) => {
  const { title, content, category, tags, summary } = req.body;
  const author_id = req.user.id;

  try {
    const [result] = await pool.query(
      'INSERT INTO articles (title, content, category, tags, summary, author_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, category, tags, summary, author_id]
    );

    res.status(201).json({ id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating article' });
  }
};

// Update an article
const updateArticle = async (req, res) => {
  const { title, content, category, tags, summary } = req.body;
  const articleId = req.params.id;
  const author_id = req.user.id;

  try {
    // Check ownership
    const [existing] = await pool.query('SELECT author_id FROM articles WHERE id = ?', [articleId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Article not found' });
    if (existing[0].author_id !== author_id) return res.status(403).json({ message: 'Unauthorized to edit this article' });

    await pool.query(
      'UPDATE articles SET title = ?, content = ?, category = ?, tags = ?, summary = ? WHERE id = ?',
      [title, content, category, tags, summary, articleId]
    );

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating article' });
  }
};

// Delete an article
const deleteArticle = async (req, res) => {
  const articleId = req.params.id;
  const author_id = req.user.id;

  try {
    // Check ownership
    const [existing] = await pool.query('SELECT author_id FROM articles WHERE id = ?', [articleId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Article not found' });
    if (existing[0].author_id !== author_id) return res.status(403).json({ message: 'Unauthorized to delete this article' });

    await pool.query('DELETE FROM articles WHERE id = ?', [articleId]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting article' });
  }
};

// AI Assist using Groq API
const aiAssist = async (req, res) => {
  const { action, content } = req.body;

  if (!content && action !== 'title') {
    return res.status(400).json({ message: 'Content is required for AI processing' });
  }

  try {
    let prompt = "";
    switch (action) {
      case 'improve':
        prompt = `Improve the following technical content for clarity, grammar, and professional tone. Return ONLY the improved content:\n\n${content}`;
        break;
      case 'summarize':
        prompt = `Provide a concise 2-3 sentence summary of the following content for an article card. Return ONLY the summary:\n\n${content}`;
        break;
      case 'tags':
        prompt = `Suggest 3-5 technical tags (comma-separated, no hashtags) for the following content. Return ONLY the tags:\n\n${content}`;
        break;
      case 'title':
        prompt = `Suggest a catchy and professional technical title for the following content. Return ONLY the title:\n\n${content}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid AI action' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful technical writing assistant. Your goal is to provide concise, accurate, and professional improvements to technical articles. Return only the requested output without any conversational filler or introductory text."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiResponse = completion.choices[0]?.message?.content || "";
    res.json({ result: aiResponse.trim() });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ message: 'Error processing AI request with Groq' });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  aiAssist
};
