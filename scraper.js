const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes Yelp reviews based on the input query or URL.
 * @param {string} input - The Yelp URL or search query.
 * @returns {Object[]} - Array of unique reviewer names with their location, rating, and text.
 */
async function scrapeYelpReviews(input) {
  const lastIndex = input.lastIndexOf('?');
  if (lastIndex !== -1) {
   input = input.substring(0, lastIndex);
  }

  try {
    let url;
    if (input.startsWith('https://www.yelp.com/')) {
      url = input;
    } else {
      url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(input)}`;
    }

    const reviewerNames = [];
    let success = false;
    let requestCounter = 0; // Counter for the number of requests made

    while (!success) {
      const response = await axios.get(url);
      const html = response.data;
      const $main = cheerio.load(html);

      // Extract the number of reviews
      const targetElement = $main('a.css-19v1rkv');
      const str = targetElement.text();
      const pattern = /^\(([\d,]+)\sreviews\)/;
      const match = str.match(pattern);
      let number;

      if (match && match[1]) {
        const numberString = match[1].replace(/,/g, '');
        number = parseInt(numberString, 10);
      }

      const promises = [];
      for (let x = 0; x < number + 10; x += 10) {
        const pageNum = x === 0 ? '' : `?start=${x}`;
        promises.push(scrape(pageNum, url, $main, reviewerNames));
      }

      await Promise.all(promises);

      if (reviewerNames.length > 0) {
        success = true;
      } else {
        // Delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        requestCounter++;

        // Check if 15 requests have been made and the array is still empty
        if (requestCounter === 15) {
          return []; // Return the empty array
        }
      }
    }

    const uniqueReviewerNames = removeDuplicates(reviewerNames);
    return uniqueReviewerNames;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

/**
 * Scrapes the reviews from a specific page.
 * @param {string} pageNumber - The page number to scrape.
 * @param {string} url - The base URL.
 * @param {Function} $ - Cheerio function.
 * @param {Object[]} reviewerNames - Array to store the reviewer names.
 */
async function scrape(pageNumber, url, $, reviewerNames) {
  const updatedUrl = url + pageNumber;
  const response = await axios.get(updatedUrl);
  const html = response.data;
  const $page = cheerio.load(html);

  $page('.margin-b5__09f24__pTvws.border-color--default__09f24__NPAKY').each((index, element) => {
    const parentDiv = $page(element);
    const nameElement = parentDiv.find('span.fs-block.css-ux5mu6[data-font-weight="bold"]');
    const locationElement = parentDiv.find('span.css-qgunke');
    const ratingElement = parentDiv.find('span.display--inline__09f24__c6N_k.border-color--default__09f24__NPAKY');
    const textElement = parentDiv.find('span.raw__09f24__T4Ezm');
    const dateElement = parentDiv.find('span.css-chan6m');
  

    const location = locationElement.text();
    const name = nameElement.text();
    const rating = ratingElement.find('div').first().attr('aria-label');
    const text = textElement.text();
    const date = dateElement.text();



    if (name !== '' && name !== "Username") {
      reviewerNames.push({ name, location, rating, text, date});
    }
  });
}

/**
 * Removes duplicate reviewer names from the array.
 * @param {Object[]} arr - Array of reviewer names.
 * @returns {Object[]} - Array with duplicate names removed.
 */
function removeDuplicates(arr) {
  const uniqueNames = [];
  const addedNames = new Set();

  for (const item of arr) {
    if (!addedNames.has(item.name)) {
      uniqueNames.push(item);
      addedNames.add(item.name);
    }
  }

  return uniqueNames;
}

module.exports = scrapeYelpReviews;
