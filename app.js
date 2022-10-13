// Checks the main webpage and scrapes all the URLs for shortage pages

const rp = require('request-promise');
const cheerio = require('cheerio');
const shortageParser = require('./shortageParser');
const url = 'https://www.ashp.org/drug-shortages/current-shortages/drug-shortages-list?page=All&loginreturnUrl=SSOCheckOnly';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);
    const shortageList = [];
    
    // Finds the first result in the table, then returns the URL to the shortage page
    // shortageList.push($('tbody').find('a').first().attr('href'));

    // Finds the EVERY result in the table, then returns the URL to the shortage page 
    // (don't run - brute forces the site)
    // $('tbody').find('a').each(function (index, element){
    //   shortageList.push($(element).attr('href'));
    // });

    // Finds the first i results, then returns the URL to the shortage page
    for (let i = 0; i < 3; i++) {
      shortageList.push($('tr > td > a', html)[i].attribs.href);
    }
    
    // Prints the URLs used in finding the NDCs. For debugging only.
    console.log("DEBUG - URL(s) used: " + shortageList);

    // Sends all URLs through function shortageParser to get NDCs
    return Promise.all (
      shortageList.map(function(url) {
        return shortageParser('https://www.ashp.org/drug-shortages/current-shortages/' + url);
      })
    );
  })

/* Returns the array from shortageParser that contains affectedProducts and avalableProducts (NDCs) */
  .then(function(shortages) {
    // console.log(shortages);
    console.log(JSON.stringify(shortages).replace(/(\\)?"\s*|\s+"/g, ($0, $1) => $1 ? $0 : '"'));  // For outputting JSON
  })

  .catch(function(err){ 
  });