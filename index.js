const $ = require('cheerio');
const puppeteer = require('puppeteer');
const data = require("./data.json");
const fs = require('fs');
require('dotenv').config();
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const client = require('twilio')(accountSid, authToken);

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

  var closeSession; //variable used to hold the browser to close the session when done
  puppeteer
    .launch()
    .then(function (browser) {
      closeSession = browser;
      return browser.newPage();
    })
    .then(function (page) {
      return page.goto(url).then(function () {
        return page.content();
      });
    })
    .then(function (html) {
      $('.floorplan-details__stats-priced-from-figure', html).each(function () {
        var housePrice = $(this).text().replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '');
        //var covertToNum = parseInt(housePrice);
        var webPrice = parseInt(housePrice);
        var curPrice = parseInt(data.curPrice);
        var origPrice = parseInt(data.origPrice);

        //console.log($(this).text());
        //console.log(price.webPrice);

        //console.log("The current price is " + curPrice);




        if (webPrice > curPrice) {

          var increase = webPrice - curPrice; //how much has the price increased
          var totalIncrease = webPrice - origPrice; //how much has the price increased since purchasing
          var mess = `The price has changed on your house from $${curPrice} to $${webPrice}. This is an increase of $${increase}. Since purchasing your home at $${origPrice}, the total price has increased by $${totalIncrease}.`;

          console.log(mess); // console log the message
          sendMessage(process.env.KAYLE_NUM, mess); //send the text message
          sendMessage(process.env.LEONARD_NUM, mess);
          sendMessage(process.env.IVONNE_NUM, mess);

          data.curPrice = webPrice.toString(); //convert the number to a string

          //update the curPrice variable in the json file
          fs.writeFile('./data.json', JSON.stringify(data), (err) => {
            if (err) console.log('Error writing file:', err)
          })
          console.log("The json file var curPrice has changed to " + data.curPrice);

          closeSession.close();

        } else if (webPrice === curPrice) {
          //console.log("the price has not changed");
          var mess = `The price, $${curPrice}, has not changed on your house since you last checked.`;
          console.log(mess);
          sendMessage(process.env.KAYLE_NUM, mess);
          closeSession.close();
        }

      });
    })
    .catch(function (err) {
      //handle error
    });
}

checkPrice();