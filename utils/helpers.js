const validator = require("validator");
const dns = require("dns").promises;
const net = require("net");
const cheerio = require("cheerio");
const stopword = require("stopword");
const fs = require("fs");
const logger = require("../config/logger");

function isPrivateIP(ip) {
  return /^(10\.|127\.|192\.168|172\.(1[6-9]|2\d|3[01]))/.test(ip) || /^::1$|^fc00:|^fe80:/i.test(ip);
}

async function isValidURL(url) {
  try {
    if (!validator.isURL(url)) return false;
    const hostname = new URL(url).hostname;
    const addresses = await dns.lookup(hostname, { all: true });
    return !addresses.some(addr => net.isIP(addr.address) && isPrivateIP(addr.address));
  } catch (error) {
    logger.error(`URL validation error: ${error.message}`);
    return false;
  }
}

function getTopNWords(html, topN) {
  const $ = cheerio.load(html);
  $("script, style").remove();
  const text = $.text().toLowerCase().replace(/[^a-z\s]/g, "");
  fs.writeFileSync("sample.txt", text);
  const words = stopword.removeStopwords(text.split(/\s+/));
  const frequencyMap = {};
  words.forEach(word => { frequencyMap[word] = (frequencyMap[word] || 0) + 1; });
  return Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([word, freq]) => ({ word, freq }));
}

module.exports = { isPrivateIP, isValidURL, getTopNWords };
