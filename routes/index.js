const express = require("express");
const validator = require("validator"); // Import validator
const { isValidURL, getTopNWords } = require("../utils/helpers");
const axios = require("axios");
const logger = require("../config/logger");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { words: null, error: null, url: "", n: "" });
});

router.post("/top-words", async (req, res) => {
  const { url, n } = req.body;
  const errors = [];
  let topN = 10;

  if (!url || typeof url !== "string" || !(await isValidURL(url))) {
    errors.push("Invalid URL.");
  }

  if (n && validator.isInt(String(n), { min: 1, max: 100 })) {
    topN = parseInt(n, 10);
  } else {
    errors.push("N must be an integer between 1 and 100.");
  }

  if (errors.length > 0) {
    return res.status(400).render("index", {
      words: null,
      error: errors.join(" "),
      url,
      n,
    });
  }

  try {
    const response = await axios.get(url);
    const topWords = getTopNWords(response.data, topN);
    res.render("index", { words: topWords, error: null, url, n: topN });
  } catch (error) {
    logger.error(`Error processing URL: ${error.message}`);
    res.status(500).render("index", { words: null, error: "Failed to process URL.", url, n });
  }
});

module.exports = router;
