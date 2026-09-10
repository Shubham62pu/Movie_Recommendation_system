import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getRecommendationsForUser } from "../services/recommend.js";

const router = Router();
router.use(requireAuth);

// GET /api/recommendations
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const results = await getRecommendationsForUser(req.user.id, limit);
    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
