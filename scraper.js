const axios = require('axios');
const cheerio = require('cheerio');
const {Storage} = require('@google-cloud/storage');


async function scrapeYelpReviews(link,start,end){
  
let url = link;
const reviews = [];
let reviewAmount;
let reviewAmountString;
const promiseArray = [];
const startReview = start;
let endReview = end;



//create google cloud storage object
const googleCloud = new Storage({
  keyFilename: 'path location to key file.json',
  projectId: 'project id number,found in key file'
  });


//get HTML from page based on url
async function getHTML(pageURL){
    const { data: html} = await axios.get(pageURL);
    return html
};


//runs initially to get the review amount
await getHTML(url).then((res) =>{
    const $ = cheerio.load(res);
   reviewAmountString = $(`body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.border-color--default__09f24__NPAKY > div.photo-header-content-container__09f24__jDLBB.border-color--default__09f24__NPAKY > div.photo-header-content__09f24__q7rNO.padding-r2__09f24__ByXi4.border-color--default__09f24__NPAKY > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.margin-b2__09f24__CEMjT.border-color--default__09f24__NPAKY > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY.nowrap__09f24__lBkC2 > span > a`).text()
});
reviewAmount = parseInt(reviewAmountString.replace(/[^0-9]/g, ''), 10);


if(endReview == null)
endReview = reviewAmount

if(startReview == null)
startReview = 0;


//scrapes data from page then adds to array


for(let x = startReview;x<endReview+1-10;x+=10){

await promiseArray.push(scrape(x));
}
    async function scrape(pageNum){
        let pageURL
        if(pageNum>9)
 pageURL = url+"?start="+pageNum;
else
pageURL = url


let htmlContent = await getHTML(pageURL)

scrapePage(htmlContent)
async function scrapePage(res){



    const $ = cheerio.load(res);
    
   
    for(let reviewNum = 1; reviewNum<11;reviewNum++){

   let review = $(`#reviews > section > div:nth-child(2) > ul > li:nth-child(${reviewNum})`)
   let name = review.find(`> div > div.margin-b3__09f24__l9v5d.border-color--default__09f24__NPAKY > div > div.css-1r871ch.border-color--default__09f24__NPAKY > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.user-passport-info.border-color--default__09f24__NPAKY > span > a`).text();
   let location = review.find(`> div > div.margin-b3__09f24__l9v5d.border-color--default__09f24__NPAKY > div > div.css-1r871ch.border-color--default__09f24__NPAKY > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > div.user-passport-info.border-color--default__09f24__NPAKY > div.responsive-hidden-small__09f24__qQFtj.border-color--default__09f24__NPAKY > div > span`).text();
   let date = review.find(`> div > div.margin-t1__09f24__w96jn.margin-b1-5__09f24__NHcQi.border-color--default__09f24__NPAKY > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.border-color--default__09f24__NPAKY > span`).text();
   let text = review.find(`> div > div:nth-child(4) > p > span`).text();
   let rating = review.find(`> div > div.margin-t1__09f24__w96jn.margin-b1-5__09f24__NHcQi.border-color--default__09f24__NPAKY > div > div:nth-child(1) > span > div`).attr('aria-label')

   if(name == ""||name == undefined)
   continue;
    reviews.push({name,location,rating,text,date })


}
    }


    }



//run scraper for all pages
await Promise.all(promiseArray)

//Sends reviews in JSON format to the bucket, fill in bucketName with the bucket name in google cloud and fileName should be the desired name of the JSON file that will be uploaded
async function uploadFile(jsonReviews) {
  const bucketName = 'BUCKET NAME HERE';
  const fileName = 'NAME OF FILE.json';

  await googleCloud.bucket(bucketName).file(fileName).save(jsonReviews);
}

//runs function
uploadFile(JSON.stringify({endReview,reviews})).catch(console.error);

return JSON.stringify(reviews);
}

module.exports = scrapeYelpReviews;
