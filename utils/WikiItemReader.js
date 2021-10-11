const cheerio = require("cheerio");
const axios = require("axios");
const Const = require("./Const.js");
const WikiItem = require("../models/WikiItem.js");

class WikiItemReader {
  /**
   * Generate a stub for an article
   * @param {Array} p Page paragraphs
   * @returns {String} The stub for the article
   */
  static getStub(p) {
    var stub = "";
    var current = p.eq(1);
    do {
      let txt = current.text();
      if (txt != "") {
        stub += txt;
      }
      current = current.next();
    } while (current[0] && current[0].name == "p");
    return stub;
  }

  /**
   * Scrape an article for it's data:
   * title,image,short description,stub
   * @param {String} url  The url to scrape
   * @param {Integer} orderID This scrape request id in the queue
   * @param {Integer} depthLeft How deep to crawl The article (0=scrape in origin article only)
   * @returns {WikiItem,Array} A WikiItem containing the scraped data | An array containing internal links
   */
  static async read(url, orderID, depthLeft) {
    try {
      // Add wikipedia prefix to the URL if needed
      if (url.indexOf(Const.WIKI_URL) === -1) {
        url = Const.WIKI_URL + url;
      }

      // Get article content for scraping
      const { data } = await axios.get(url);
      // Load HTML to $
      const $ = cheerio.load(data);

      // Get all paragraphs
      var paragraphs = $("div.mw-parser-output p");
      // Remove references
      paragraphs.find("sup").remove();
      // Generate Stub
      var stub = WikiItemReader.getStub(paragraphs);

      const title = $("h1").text();
      const img = $('meta[property="og:image"]').attr("content");
      const short = $(".shortdescription").text();

      // Get links and split to internal/external arrays
      const rawLinks = paragraphs.find("a");
      var externalLinks = [];
      var internalLinks = [];
      rawLinks.each(function (i, link) {
        /*if (i > 10) {
          return;
        }*/
        link = $(link).attr("href");
        if (link !== undefined) {
          // If there's and actual link
          if (link.indexOf("/wiki/") > -1) {
            // If link is internal (->Wikipedia)
            if (internalLinks.indexOf(link) === -1) {
              // Prevent duplicates
              internalLinks.push({
                url: link,
                depthLeft: depthLeft,
              });
            }
          } else {
            // If the link is external
            if (externalLinks.indexOf(link) === -1) {
              // Prevent duplicates
              externalLinks.push(link);
            }
          }
        }
      });

      return {
        wikiItem: new WikiItem({
          order_id: orderID,
          url: url,
          title: title,
          img: img,
          short: short,
          stub: stub,
          internal_links: internalLinks,
          external_links: externalLinks,
        }),
        internalLinks: internalLinks,
      };
    } catch (err) {
      console.error(err);
    }
  }
}
module.exports = WikiItemReader;
