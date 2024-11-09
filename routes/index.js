// routes/index.js

const express = require("express");
const { isValidURL, getTopNWords } = require("../utils/helpers");
const axios = require("axios");
const logger = require("../config/logger");

const router = express.Router();

// GET route to render the form initially
router.get("/", (req, res) => {
  res.render("index", { 
    words: null, 
    url: "", 
    n: "", 
    currentPage: 1,  
    totalPages: 1,   
    limit: 10        
  });
});

// POST route to handle form submissions and errors
router.post("/top-words", async (req, res) => {
  const { url, n, page = 1, limit = 10 } = req.body;
  const errors = [];
  const topN = parseInt(n, 10)  ;

  // URL Validation
  const urlIsValid = await isValidURL(url);
  if (!urlIsValid) {
    errors.push("Invalid URL. The URL must not point to internal or restricted resources.");
  }

  // Validate `n`
  if (isNaN(topN) || topN < 1 || topN > 100) {
    errors.push("N must be an integer between 1 and 100.");
  }

  if (errors.length > 0) {
    console.log("Validation Errors:", errors);
    req.flash("error", errors.join(" "));
    return res.redirect("/");
  }

  // Redirect to the GET /results route if valid
  return res.redirect(`/results?url=${encodeURIComponent(url)}&n=${topN}&page=${page}&limit=${limit}`);
});

// GET route to display results with pagination
router.get("/results", async (req, res) => {
  console.log("GET /results accessed with query:", req.query);
  const { url, n, page = 1, limit = 10 } = req.query;
  const errors = [];
  
  const topN = parseInt(n, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  const urlIsValid = await isValidURL(url);
  if (!urlIsValid) {
    errors.push("Invalid URL. The URL must not point to internal or restricted resources.");
  }

  if (isNaN(topN) || topN < 1 || topN > 100) {
    errors.push("N must be an integer between 1 and 100.");
  }

  if (errors.length > 0) {
    console.log("Validation Errors in /results:", errors);
    req.flash("error", errors.join(" "));
    return res.redirect("/");
  }

  try {
    const response = await axios.get(url);
    const allWords = getTopNWords(response.data, topN);

    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedWords = allWords.slice(startIndex, startIndex + parsedLimit);

    const totalPages = Math.ceil(allWords.length / parsedLimit);
    console.log(`Total Pages: ${totalPages}, Requested Page: ${parsedPage}`);

    if (parsedPage > totalPages && totalPages > 0) {
      req.flash("error", "Requested page exceeds total pages.");
      return res.redirect("/");
    }

    if (parsedPage > totalPages && totalPages > 0) {
      req.flash("error", "Requested page exceeds total pages.");
      return res.redirect("/");
    }

    if (totalPages === 0) {
      req.flash("error", "No results found.");
      return res.redirect("/");
    }
    
    res.render("index", {
      words: paginatedWords,
      url,
      n: topN,
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit
    });
  } catch (error) {
    logger.error(`Error processing URL: ${error.message}`);
    req.flash("error", "Failed to process URL. Please try again.");
    return res.redirect("/");
  }
});

module.exports = router;
