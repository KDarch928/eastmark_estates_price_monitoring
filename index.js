const rp = require('request-promise');
const $ = require('cheerio');
const puppeteer = require('puppeteer');
const data = require("./data.json");
const fs = require('fs');
require('dotenv').config();
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const client = require('twilio')(accountSid,authToken);

const url = 'https://www.taylormorrison.com/az/phoenix/mesa/the-estates-at-eastmark-summit-collection/floor-plans/crestone'

function sendMessage(num, mess) {
  client.messages.create({
          body: mess,
          from: '+16303150152',
          to: `+${num}`
        })
        .then(message => console.log(message.sid));
}

function checkPrice() {
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

            var increase = webPrice - curPrice;
            var mess = `The price has changed on your house from $${curPrice} to $${webPrice}. This is an incrase of $${increase}`;
            
            //console.log("The new house price is " + data.curPrice);
            data.curPrice = webPrice.toString();
            
            fs.writeFile('./data.json', JSON.stringify(data), (err) => {
                    if (err) console.log('Error writing file:', err)
            })
            console.log("The json file var curPrice has changed to " + data.curPrice);
            //var priceChange = webPrice - curPrice;
            //console.log("$"+priceChange);
        } else if( webPrice === curPrice) {
            //console.log("the price has not changed");
            var mess = `The price, $${curPrice}, has not changed on your house`
            sendMessage(process.env.KAYLE_NUM,mess);
        }

    });
  
  })
  .catch(function(err) {
    //handle error
  });
}

checkPrice();




 