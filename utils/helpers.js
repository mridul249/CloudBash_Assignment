const dns = require("dns").promises;
const net = require("net");
const validator = require("validator");

const cheerio = require("cheerio");
const stopword = require("stopword");
const fs = require("fs");

/**
 * Checks if the given IP address is private.
 * @param {string} ip - IP address to check.
 * @returns {boolean} - True if the IP is private, false otherwise.
 */
function isPrivateIP(ip) {
  return (
    /^10\./.test(ip) || // 10.0.0.0 - 10.255.255.255
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || // 172.16.0.0 - 172.31.255.255
    /^192\.168\./.test(ip) || // 192.168.0.0 - 192.168.255.255
    /^127\./.test(ip) || // Loopback
    /^::1$/.test(ip) || // IPv6 Loopback
    /^fc00:/i.test(ip) || // IPv6 Private Range
    /^fe80:/i.test(ip) // IPv6 Link-Local
  );
}

/**
 * Validates if the provided URL is public and accessible.
 * @param {string} url - URL to validate.
 * @returns {Promise<boolean>} - True if URL is valid and public, false otherwise.
 */
async function isValidURL(url) {
  if (
    !validator.isURL(url, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname;
    const addresses = await dns.lookup(hostname, { all: true });

    // Check if any address is private
    for (const address of addresses) {
      if (net.isIP(address.address) && isPrivateIP(address.address)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error during URL validation:", error);
    return false;
  }
}

/**
 * Extracts and processes the top N words from HTML content.
 * @param {string} html - The HTML content to process.
 * @param {number} topN - The number of top words to return.
 * @returns {Array} - Array of objects containing words and their frequencies.
 */
function getTopNWords(html, topN) {
  const $ = cheerio.load(html);

  // Remove script and style tags and any inline styles
  $("script, style").remove();
  const cleanText = $("body").text();

  // Convert text to lowercase and remove punctuation and special characters
  const words = cleanText
    .replace(/[\W_]+/g, " ") // Remove punctuation and special characters
    .toLowerCase() // Convert to lowercase
    .split(/\s+/) // Split into words
    .filter((word) => word.length > 0); // Remove empty strings

  // Remove stopwords
  const filteredWords = stopword.removeStopwords(words);

  // Count word frequencies
  const frequencyMap = {};
  filteredWords.forEach((word) => {
    if (word) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });

  // Convert frequency map to array and sort by frequency
  const topWords = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, frequency]) => ({ word, freq: frequency }));

  // Save cleaned text for debugging purposes (optional)
  fs.writeFileSync("sample.txt", cleanText, (err) => {
    if (err) {
      console.error("Error writing to file:", err.message);
    }
  });

  return topWords;
}

module.exports = { isPrivateIP, isValidURL, getTopNWords };
