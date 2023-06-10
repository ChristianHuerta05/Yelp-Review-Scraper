const scrapeYelpReviews = require('./scraper');
let startingReview = 0;
let endingReview = 20
//ending review must be greater than 10, round review to greatest 10th. ex if 26 enter 30
scrapeYelpReviews('https://www.yelp.com/biz/the-oaks-at-lakeside-los-angeles',startingReview,endingReview)
  .then((reviews) => {
    console.log(reviews);
   
   
  })
  .catch((error) => {
    console.error(error);
  });
