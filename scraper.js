const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');
/*

//refrences to change if website change


//review number
"body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.css-1qn0b6x > div.photo-header-content-container__09f24__jDLBB.css-1qn0b6x > div.photo-header-content__09f24__q7rNO.css-2wl9y > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.css-9ul5p9 > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-v3nuob > span.css-1x9ee72 > a"

//review list items
"#reviews > section > div.css-1qn0b6x > ul > li:nth-child(1)"
  
//name 
  `#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > span > a`

//location
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > div > div > span`).textContent

//rating
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-10n911v > div > div:nth-child(1) > span > div`).getAttribute('aria-label');

//text
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-9ul5p9 > p > span`).textContent

//date
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-10n911v > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > span`).textContent

//images container
#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div`

//number of images in container
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div`).querySelectorAll('img').length

//images multiple
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div > div:nth-child(${q + 1}) > div > div > div > img`).getAttribute('src'))

//images single
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div > div > div > div > div> img`).getAttribute('src'))

//userLink 
`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > span > a`).getAttribute('href')


*/
async function scraperYelpReviews(url, getAmount) {
  const reviewArray = [];



  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disabled-setuid-sandbox'],
    defaultNavigationTimeout: 0,
  });
  try {

    const page = await browser.newPage();

    /*sorting parameters:
        oldest: ?sort_by=date_asc  
        newest: ?sort_by=date_desc
        Highest Rated: ?sort_by=rating_desc
        Lowest Rated: ?sort_by=rating_asc
        Elites: ?sort_by=elites_desc
        
        
    */
    let sortType = "&sort_by=date_desc"

    //create google cloud storage object
    const googleCloud = new Storage({
      keyFilename: 'path location to key file.json',
      projectId: 'project id number,found in key file'
    });



    //opens initial page
    await page.goto(url)

    //wait then get review number  

    let reviewNumber;

    const elementTest = await page.$(`#main-content > div.css-174a15u > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.css-9ul5p9 > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-v3nuob > span.css-1evauet > a`) !== null;
    let isDefaultHTMLLayout = false;
    if (elementTest) {
      isDefaultHTMLLayout = true;
      reviewNumber = await page.evaluate(async () => {
        let reviewtemp = await document.querySelector(`#main-content > div.css-174a15u > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.css-9ul5p9 > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-v3nuob > span.css-1evauet > a`).textContent
        reviewtemp = parseInt(reviewtemp.match(/\d+/g).join(""));
        return reviewtemp;
      })
    } else {
      await page.waitForSelector("body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.css-1qn0b6x > div.photo-header-content-container__09f24__jDLBB.css-1qn0b6x > div.photo-header-content__09f24__q7rNO.css-2wl9y > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.css-9ul5p9 > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-v3nuob > span.css-1x9ee72 > a")
      reviewNumber = await page.evaluate(async () => {
        let reviewtemp = await document.querySelector("body > yelp-react-root > div:nth-child(1) > div.photoHeader__09f24__nPvHp.css-1qn0b6x > div.photo-header-content-container__09f24__jDLBB.css-1qn0b6x > div.photo-header-content__09f24__q7rNO.css-2wl9y > div > div > div.arrange__09f24__LDfbs.gutter-1-5__09f24__vMtpw.vertical-align-middle__09f24__zU9sE.css-9ul5p9 > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-v3nuob > span.css-1x9ee72 > a").textContent
        reviewtemp = parseInt(reviewtemp.match(/\d+/g).join(""));
        return reviewtemp;
      })
    }



    //for getting a custom amount of reviews
    if (getAmount != undefined) {
      reviewNumber = getAmount;
    }
    //close initial page
    page.close()
    //for each page that exists add a new page and search

    if (reviewNumber < 10) {
      reviewNumbertemp = 10
    } else {
      reviewNumbertemp = reviewNumber
    }


    for (let i = 0; i <= reviewNumbertemp - 10; i += 10) {

      if (i > reviewNumber) {
        continue
      }
      //open new tab
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(1000000)
      //search page and open
      let newURL = url + "?start=" + i + sortType



      await page.goto(newURL)

      //make sure reviews have loaded


      await page.waitForSelector("#reviews > section > div.css-1qn0b6x > ul > li:nth-child(1)")

      let loopcount = 0;

      //if not on the last loop get 10 reviews else get remaining
      if ((reviewNumber - i) > 10) {
        loopcount = 10;
      } else {
        loopcount = reviewNumber - i
      }



      //loops for each review
      for (let z = 0; z < loopcount; z++) {


        let reviewObject = await page.evaluate((z) => {
          let name = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > span > a`).textContent
          let location = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > div > div > span`).textContent
          let text = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-9ul5p9 > p > span`).textContent

          let rating = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-10n911v > div > div:nth-child(1) > span > div`).getAttribute('aria-label');
          let date = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-10n911v > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > span`).textContent

          let images = []

          //get images
          if (document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div`) !== null) {

            let amount = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div`).querySelectorAll('img').length

            if (amount > 1) {
              for (let q = 0; q < amount; q++) {
                images.push(document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div > div:nth-child(${q + 1}) > div > div > div > img`).getAttribute('src'))

              }
            } else {
              images.push(document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-1cfy6na > div > div > div > div > div > img`).getAttribute('src'))

            }
          }


          let userLink = document.querySelector(`#reviews > section > div.css-1qn0b6x > ul > li:nth-child(${z + 1}) > div > div.css-174a15u > div > div.css-1u1p5a2 > div > div > div.arrange-unit__09f24__rqHTg.arrange-unit-fill__09f24__CUubG.css-1qn0b6x > div.user-passport-info.css-1qn0b6x > span > a`).getAttribute('href')

          userLink = "https://www.yelp.com/" + userLink
          return { name, location, rating, text, date, images, userLink }
        }, z)




        reviewArray.push(reviewObject)
      }


      page.close()








    }



    browser.close()


    //Sends reviews in JSON format to the bucket, fill in bucketName with the bucket name in google cloud and fileName should be the desired name of the JSON file that will be uploaded
    async function uploadFile(jsonReviews) {
      const bucketName = 'BUCKET NAME HERE';
      const fileName = 'NAME OF FILE.json';

      await googleCloud.bucket(bucketName).file(fileName).save(jsonReviews);
    }
    //runs function
    uploadFile(JSON.stringify({ reviewNumber, reviewArray })).catch(console.error);

    return JSON.stringify({ reviewNumber, reviewArray });
  } catch (error) {
    browser.close()
    console.error('error: ', error)
    return [];
  }




}

module.exports = scraperYelpReviews;