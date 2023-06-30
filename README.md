# Yelp-Review-Scraper

Scrapes reviews from businesses yelp url

scraper.js module takes in the url of a businesses main yelp page then returns array with review objects, example of response shown below.

{endReview:,
businessName:,
totalRating:,
,[
  {
    name: 'reviewer name.',
    location: 'reviewer location',
    rating: 'reviewer rating',
    text: 'reviewer text’ ,
    date: 'review date'
    pictures
  },
  {
    name: 'reviewer name.',
    location: 'reviewer location',
    rating: 'reviewer rating',
    text: 'reviewer text’ ,
    date: 'review date',
    images[]
  },
  {
    name: 'reviewer name.',
    location: 'reviewer location',
    rating: 'reviewer rating',
    text: 'reviewer text’ ,
    date: 'review date',
    images[]
  },
  {
    name: 'reviewer name.',
    location: 'reviewer location',
    rating: 'reviewer rating',
    text: 'reviewer text’ ,
    date: 'review date',
    images[]
  }
]
}
