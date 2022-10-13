/* Checks the individual shortage webpages and parses the NDCs from affected and available products sections */

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

            $('span[id="1_lblProducts"]').find('li').each(function (index, element){
                    affectedProducts.push($(element).text());});
            $('span[id="1_lblAvailable"]').find('li').each(function (index, element){
                    availableProducts.push($(element).text());});

                    var availableNDCs = availableProducts.map(function(v){
                        if(typeof v == "string"){
                            return v.split(",");
                        } else {
                            return v.map(mapper);
                        }
                     });

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

                    // affected.map(function(element){return element.trim()});

            resultsProducts = {
                name: shortageName,
                url: url,
                lastUpdate: lastUpdate,
                affectedNDCs: affected,
                availableNDCs: available
                // affectedProducts: affectedProducts,
                // availableProducts: availableProducts
            };
            return resultsProducts;

            // return {
                // Test for a single product
                // affectedProducts: $('span[id="1_lblProducts"]').find('li').first().text(),
                // availableProducts: $('span[id="1_lblAvailable"]').find('li').first().text(),
            // };  
        })
        .catch(function(err){ 
            //handle error
        });
};

module.exports = shortageParser;