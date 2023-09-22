const scrapeYelpReviews = require('./scraper');

let endingReview = 20; //optional param
//ending review must be greater than 10, round review to greatest 10th. ex if 26 enter 30
scrapeYelpReviews('https://www.yelp.com/biz/stanford-university-stanford', endingReview)
  .then((reviews) => {
    console.log(reviews);


  })
  .catch((error) => {
    console.error(error);
  });