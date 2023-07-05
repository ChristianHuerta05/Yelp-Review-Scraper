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

  let businessName;
  let totalRating;
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
    //gets business name
     businessName = $('body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.border-color--default__09f24__NPAKY > div.photo-header-content-container__09f24__jDLBB.border-color--default__09f24__NPAKY > div.photo-header-content__09f24__q7rNO.padding-r2__09f24__ByXi4.border-color--default__09f24__NPAKY > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.headingLight__09f24__N86u1.margin-b1__09f24__vaLrm.border-color--default__09f24__NPAKY > h1').text();
    //gets total rating
    totalRating = $('body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.border-color--default__09f24__NPAKY > div.photo-header-content-container__09f24__jDLBB.border-color--default__09f24__NPAKY > div.photo-header-content__09f24__q7rNO.padding-r2__09f24__ByXi4.border-color--default__09f24__NPAKY > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.margin-b2__09f24__CEMjT.border-color--default__09f24__NPAKY > div:nth-child(1) > span > div').attr('aria-label');
  });
  reviewAmount = parseInt(reviewAmountString.replace(/[^0-9]/g, ''), 10);

  if (endReview == null) endReview = reviewAmount+9;


 
//decides how to sort reviews
const ReviewsSort = '&sort_by='+'date_desc' //for newest review: date_desc, for oldest: date_asc, for highest rating: rating_desc, for lowest rating: rating_asc, for elites: elites_desc, for default make string blank

  // Scrapes data from each page and adds it to the reviews array
  for (let x = startReview; x < endReview + 1 - 10; x += 10) {
    await promiseArray.push(await scrape(x));
  }

  async function scrape(pageNum) {
    let pageURL;
     pageURL = url + '?start=' + pageNum + ReviewsSort;
    

    let htmlContent = await getHTML(pageURL);

    await scrapePage(htmlContent);
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
      let imageNum = $(`#reviews > section > div:nth-child(2) > ul > li:nth-child(${reviewNum}) > div > div:nth-child(3) > div > span > a`).text();
      let images = [];
      //if there are images in review, grabs url for each image and adds to array
      if(imageNum.length > 0){
        imageNum = parseInt(imageNum.match(/\d+/)[0]);
        for(let i = 1; i <= imageNum; i++){
        let imageUrl = $(`#reviews > section > div:nth-child(2) > ul > li:nth-child(${reviewNum}) > div > div.margin-t3__09f24__riq4X.margin-b2__09f24__CEMjT.border-color--default__09f24__NPAKY > div > div:nth-child(${i}) > div > div > div > a > img`).attr('src')
         
        //if too many images in review, go to reviewer page instead and get all images from there
        if(imageUrl==undefined){
          images = [];
           let reviewerPageURL =  await $(`#reviews > section > div:nth-child(2) > ul > li:nth-child(${reviewNum}) > div > div.margin-t3__09f24__riq4X.margin-b2__09f24__CEMjT.border-color--default__09f24__NPAKY > p > a`).attr('href');
          images = await getReviewerPageImages(reviewerPageURL,imageNum);
           
          break;
        } 
         images.push(imageUrl);
        }
       
      }         

     

      if (name == '' || name == undefined) continue;
      reviews.push({ name, location, rating, text, date,images });
    }
  }

  async function getReviewerPageImages(reviewerPageLink, amountOfImages){
    const userPage = await axios.get('https://www.yelp.com/'+reviewerPageLink);
           const html2 = userPage.data;
           const $2 = cheerio.load(html2);
           let newImages = [];
           for(let z = 1; z <= amountOfImages; z++){
            let imageProfileUrl = $2(`#super-container > div.container > div > div.media-landing.js-media-landing > div.media-landing_gallery.photos > ul > li:nth-child(${z}) > div > img`).attr('src');
             newImages.push(imageProfileUrl);
          }

return newImages;
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
  uploadFile(JSON.stringify({ endReview,businessName,totalRating, reviews })).catch(console.error);

  return JSON.stringify({ endReview,businessName,totalRating, reviews });
}

module.exports = scrapeYelpReviews;
