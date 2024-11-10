const cheerio = require("cheerio");
const { Heap } = require("heap-js");

/**
 * Extracts the top N words from HTML content.
 * @param {string} html - HTML content to process.
 * @param {number} topN - Number of top words to return.
 * @returns {Array} - Array of word-frequency objects.
 */
function getTopNWords(html, topN) {
  const $ = cheerio.load(html);
  $("script, style").remove(); // Remove unwanted tags

  const text = $("body").text();
  const words = text
    .replace(/[\W_]+/g, " ") // Remove punctuation and special characters
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w); // Filter out empty strings

  // Count word frequencies
  const freq = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  // Min Heap for top N words
  const heap = new Heap((a, b) => a.freq - b.freq);

  for (const [word, count] of Object.entries(freq)) {
    if (heap.size() < topN) {
      heap.push({ word, freq: count });
    } else if (count > heap.peek().freq) {
      heap.replace({ word, freq: count });
    }
  }

  const topWords = [];
  while (!heap.isEmpty()) {
    topWords.push(heap.pop());
  }

  return topWords.reverse(); 
}

module.exports = { getTopNWords };
