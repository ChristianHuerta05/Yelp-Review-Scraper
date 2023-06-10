/**
 * This program scrapes Yelp reviews based on a given URL and retrieves the reviews within a specified range.
 * The scraped reviews are stored in a JSON file and uploaded to Google Cloud Storage.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { Storage } = require('@google-cloud/storage');

/**
 * Scrapes Yelp reviews from the specified URL within the given review range.
 * @param {string} link - The URL of the Yelp page to scrape reviews from.
 * @param {number} start - The starting index of the review range (optional, defaults to 0).
 * @param {number} end - The ending index of the review range (optional, defaults to total review count).
 * @returns {Promise<string>} - JSON string containing the scraped reviews.
 */
async function scrapeYelpReviews(link, start = 0, end = null) {
  let url = link;
  const reviews = [];
  let reviewAmount;
  let reviewAmountString;
  const promiseArray = [];
  const startReview = start;
  let endReview = end;

  // Create Google Cloud Storage object
  const googleCloud = new Storage({
    keyFilename: 'path/to/keyfile.json',
    projectId: 'your-project-id',
  });

  /**
   * Retrieves the HTML content from a given URL.
   * @param {string} pageURL - The URL to fetch HTML content from.
   * @returns {Promise<string>} - HTML content of the page.
   */
  async function getHTML(pageURL) {
    const { data: html } = await axios.get(pageURL);
    return html;
  }

  // Runs initially to get the total review count
  await getHTML(url).then((res) => {
    const $ = cheerio.load(res);
    reviewAmountString = $(`body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.border-color--default__09f24__NPAKY > div.photo-header-content-container__09f24__jDLBB.border-color--default__09f24__NPAKY > div.photo-header-content__09f24__q7rNO.padding-r2__09f24__ByXi4.border-color--default__09f24__NPAKY > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.margin-b2__09f24__CEMjT.border-color--default__09f24__NPAKY > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY.nowrap__09f24__lBkC2 > span > a`).text();
  });
  reviewAmount = parseInt(reviewAmountString.replace(/[^0-9]/g, ''), 10);

  if (endReview == null) endReview = reviewAmount;
  

  // Scrapes data from each page and adds it to the reviews array
  for (let x = startReview; x < endReview + 1 - 10; x += 10) {
    await promiseArray.push(scrape(x));
  }

  async function scrape(pageNum) {
    let pageURL;
    if (pageNum > 9) pageURL = url + '?start=' + pageNum;
    else pageURL = url;

    let htmlContent = await getHTML(pageURL);

    scrapePage(htmlContent);
  }

  async function scrapePage(res) {
    const $ = cheerio.load(res);

    for (let reviewNum = 1; reviewNum < 11; reviewNum++) {
      let review = $(`#reviews > section > div:nth-child(2) > ul > li:nth-child(${reviewNum})`);
      let name = review.find(`> div > div.margin-b3__09f24__l9v5d.border-color--default__09f24__NPAKY > div > div.css-1r871ch.border-color--default__09f24__NPAKY > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.user-passport-info.border-color--default__09f24__NPAKY > span > a`).text();
      let location = review.find(`> div > div.margin-b3__09f24__l9v5d.border-color--default__09f24__NPAKY > div > div.css-1r871ch.border-color--default__09f24__NPAKY > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.user-passport-info.border-color--default__09f24__NPAKY > div.responsive-hidden-small__09f24__qQFtj.border-color--default__09f24__NPAKY > div > span`).text();
      let date = review.find(`> div > div.margin-t1__09f24__w96jn.margin-b1-5__09f24__NHcQi.border-color--default__09f24__NPAKY > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > span`).text();
      let text = review.find(`> div > div:nth-child(4) > p > span`).text();
      let rating = review.find(`> div > div.margin-t1__09f24__w96jn.margin-b1-5__09f24__NHcQi.border-color--default__09f24__NPAKY > div > div:nth-child(1) > span > div`).attr('aria-label');

      if (name == '' || name == undefined) continue;
      reviews.push({ name, location, rating, text, date });
    }
  }

  // Run the scraper for all pages
  await Promise.all(promiseArray);

  /**
   * Uploads reviews in JSON format to a Google Cloud Storage bucket.
   * @param {string} jsonReviews - JSON string containing the reviews.
   * @returns {Promise<void>}
   */
  async function uploadFile(jsonReviews) {
    const bucketName = 'your-bucket-name';
    const fileName = 'reviews.json';

    await googleCloud.bucket(bucketName).file(fileName).save(jsonReviews);
  }

  // Runs the upload function
  uploadFile(JSON.stringify({ endReview, reviews })).catch(console.error);

  return JSON.stringify({endReview,reviews});
}

module.exports = scrapeYelpReviews;
