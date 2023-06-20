const scrapeYelpReviews = require('./scraper');
const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  try {
    const startingReview = 0;
    const endingReview = 20;

    const result = await scrapeYelpReviews('https://www.yelp.com/biz/the-oaks-at-lakeside-los-angeles', startingReview, endingReview);
    
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(result);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
