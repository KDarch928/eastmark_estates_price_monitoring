const rp = require('request-promise');
const $ = require('cheerio');
const puppeteer = require('puppeteer');
const data = require("./data.json");
const fs = require('fs');
const url = 'https://www.taylormorrison.com/az/phoenix/mesa/the-estates-at-eastmark-summit-collection/floor-plans/crestone'

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    $('.floorplan-details__stats-priced-from-figure', html).each(function() {
        var housePrice = $(this).text().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '');
        var covertToNum = parseInt(housePrice);
        var webPrice = parseInt(housePrice);
        var curPrice = parseInt(data.curPrice);
        var origPrice = parseInt(data.origPrice);

        console.log($(this).text());
        //console.log(price.webPrice);

        console.log("The current price is " + curPrice);

        if(webPrice > curPrice) {
            //price["webPrice"] = covertToNum;
            //console.log(price.webPrice);
            console.log("The new house price is " + data.curPrice);
            data.curPrice = webPrice.toString();
            
            fs.writeFile('./data.json', JSON.stringify(data), (err) => {
                    if (err) console.log('Error writing file:', err)
            })
            console.log("The new house price is " + data.curPrice);
            var priceChange = webPrice - curPrice;
            console.log("$"+priceChange);
        } else if( webPrice === curPrice) {
            console.log("the price is the same");
        }
       
    });
  })
  .catch(function(err) {
    //handle error
  });