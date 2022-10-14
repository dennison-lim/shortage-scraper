// Checks the individual shortage webpages and parses the NDCs from affected and available products sections

const rp = require('request-promise');
const cheerio = require('cheerio');

const shortageParser = function(url) {
    return rp(url)
        .then(function(html) {
            var $ = cheerio.load(html);
            var affectedProducts = [];
            var availableProducts = [];
            var resultsProducts = [];

            var shortageName = $('span[id="1_lblDrug"]').text();
            var lastUpdate = $('span[id="1_lblDate"]').text();

        //  Parses the text from each li and returns array. Structure is below
        //     <span id="exampleID">
        //       <ul>
        //         <li>This text, is comma separated, but will need to trim, whitespace before, and after</li>
        //         <li><This is also, comma separated text, and each will, have exactly, five comma separated blocks</li>

            $('span[id="1_lblProducts"]').find('li').each(function (index, element){
                    affectedProducts.push($(element).text());});
            $('span[id="1_lblAvailable"]').find('li').each(function (index, element){
                    availableProducts.push($(element).text());});

                  // Splits the array of strings ["This is, a long, comma, separated, string", "This, is another, comma, 
                  // separated, string" ] into an array of arrays
                  // We want these to be unique elements as part of the pattern of keys below

                    var availableNDCs = availableProducts.map(function(v){
                        if(typeof v == "string"){
                            return v.split(",");
                        } else {
                            return v.map(mapper);
                        }
                     });

                    //  Assigns the key for each element. Most products will have 5 keys. Unfortunately there seems to be 
                    //  some manufacturers that have commas in their name. That results in 6 values where one is missing a 
                    //  key name. Will need to address outside of a POC.
                     
                     var available = availableNDCs.map((c) => {
                        return {
                            "productName": c[0],
                            "productMfg": c[1],
                            "packageSize": c[2],
                            "packageQty": c[3],
                            "ndc": c[4]
                        }
                     });

                     var affectedNDCs = affectedProducts.map(function(v){
                        if(typeof v == "string"){
                            return v.split(",");
                        } else {
                            return v.map(mapper);
                        }
                     });

                     var affected = affectedNDCs.map((c) => {
                        return {
                            "productName": c[0],
                            "productMfg": c[1],
                            "packageSize": c[2],
                            "packageQty": c[3],
                            "ndc": c[4]
                        }
                     });

            // Sets up array of arrays to return. At this step, there is still white space that needs to be trimmed.
            // It is handled when logged to console in the next step via JSON.stringify, but should ideally be handled here

            resultsProducts = {
                name: shortageName,
                url: url,
                lastUpdate: lastUpdate,
                affectedNDCs: affected,
                availableNDCs: available
            };
            return resultsProducts;

            // return {
                // Test for a single product
                // affectedProducts: $('span[id="1_lblProducts"]').find('li').first().text(),
                // availableProducts: $('span[id="1_lblAvailable"]').find('li').first().text(),
            // };  
        })
        .catch(function(err){ 
        });
};

module.exports = shortageParser;