// routes/index.js
const express = require("express");
const { getTopNWords } = require("../utils/helpers");
const axios = require("axios");
const logger = require("../config/logger");

const router = express.Router();

function generatePaginationUrl(url, n, page, limit) {
  return `/results?url=${encodeURIComponent(url)}&n=${n}&page=${page}&limit=${limit}`;
}

// GET route to render the initial form
router.get("/", (req, res) => {
  res.render("index", {
    words: null,
    url: "",
    n: "",
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    startIndexDisplay: 0,
    endIndexDisplay: 0,
  });
});

// POST route to handle form submission
router.post("/top-words", (req, res) => {
  const { url, n } = req.body;
  const errors = [];

  const topN = parseInt(n, 10);

  if (isNaN(topN) || topN < 1 || topN > 100) {
    errors.push("N must be an integer between 1 and 100.");
  }

  if (errors.length > 0) {
    req.flash("error", errors.join(" "));
    return res.redirect("/");
  }

  // Redirect to GET /results with parameters
  return res.redirect(generatePaginationUrl(url, topN, 1, 10));
});

// GET route to display paginated results
router.get("/results", async (req, res) => {
  const { url, n, page = 1, limit = 10 } = req.query;
  const errors = [];

  const topN = parseInt(n, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  if (isNaN(topN) || topN < 1 || topN > 100) {
    errors.push("N must be an integer between 1 and 100.");
  }

  if (errors.length > 0) {
    req.flash("error", errors.join(" "));
    return res.redirect("/");
  }

  try {
    const response = await axios.get(url);
    const allWords = getTopNWords(response.data, topN);

    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedWords = allWords.slice(startIndex, startIndex + parsedLimit);

    const totalPages = Math.ceil(allWords.length / parsedLimit);

    if (parsedPage > totalPages && totalPages > 0) {
      req.flash("error", "Requested page exceeds total pages.");
      return res.redirect("/");
    }

    if (totalPages === 0) {
      req.flash("error", "No results found.");
      return res.redirect("/");
    }

    const startIndexDisplay = startIndex + 1;
    const endIndexDisplay = Math.min(startIndex + parsedLimit, allWords.length);

    res.render("index", {
      words: paginatedWords,
      url,
      n: topN,
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      startIndexDisplay,
      endIndexDisplay,
      generatePaginationUrl: (pageNumber) => generatePaginationUrl(url, topN, pageNumber, parsedLimit),
    });
  } catch (error) {
    logger.error(`Error processing URL: ${error.message}`);
    req.flash("error", "Failed to process URL. Please try again.");
    return res.redirect("/");
  }
});

module.exports = router;
