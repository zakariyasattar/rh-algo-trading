//http://aurbano.eu/robinhood-node//

/////////// FILL THESE OUT //////
var RH_USERNAME = "";
var RH_PASSWORD = "";
var RAPID_KEY = "";
/////////////////////////////////

var robinhood = require('robinhood');
var request = require('sync-request');
var ab2str = require('arraybuffer-to-string');
var unirest = require("unirest");
var nodemailer = require('nodemailer');
var localStorage = require('localStorage');
const mailgun = require("mailgun-js");
var CronJob = require('cron').CronJob;

var finalString = "";
var credentials;
global.topMovingSymbols = [];
var possibleBuyNoRating = [];
var possibleBuys = [];
var finalStock = "";

// get all data
var res = request('POST', "https://api.robinhood.com/oauth2/token/?grant_type=password&client_id=c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS&username=" + RH_USERNAME + "&password=" + RH_PASSWORD, {
});

// parse data from Buffer to string
var responseBody = (ab2str(res.body));

// modify response body string
for(var i = 18; i < responseBody.length; i++) {
		finalString += responseBody[i]
}

//isolate access token
finalString = finalString.substring(0, finalString.indexOf('"'));

// apply access token
var credentials = {
	token: finalString + ""
};

var x = new CronJob('* 10 * * 1-5', function() {
	if(new Date().getDay() > 0 && new Date().getDay() < 6) {
    Robinhood.positions(function(err, response, body){
				for(var i = 0; i < Object.keys(body.results).length; i++) {
					var JSONobj = body.results[Object.keys(body.results)[i]];
					if(JSONobj.quantity != "0.0000") {
						var stockSymbol = "";
						Robinhood.url(JSONobj.instrument, function	(error, response, body) {
							stockSymbol = body.symbol;
							var options = {
								type: 'limit',
								quantity: 1,
								bid_price: 1.00,
								instrument: {
										url: JSONobj.instrument,
										symbol: stockSymbol
								},
							}

							Robinhood.place_sell_order(options, function(error, response, body){})	
						})					
					}
				}  
			});
      
      
		var Robinhood = require('robinhood')(credentials, function() {
				Robinhood.url('https://api.robinhood.com/midlands/tags/tag/top-movers/', function(error, response, body) {
						// get first elem json
						for(var i = 0; i < Object.keys(body.instruments).length; i++){
							Robinhood.url(body.instruments[Object.keys(body.instruments)[i]], function(error, response, body) {
								Robinhood.quote_data(body.symbol, function(error, response, body) {
									var instrument = (body.results[Object.keys(body.results)[0]].instrument);
									var bid_price = (body.results[Object.keys(body.results)[0]].bid_price);
									var stockSymbol = (body.results[Object.keys(body.results)[0]].symbol)
									var currPrice = (body.results[Object.keys(body.results)[0]].last_trade_price)
									var lastClose = (body.results[Object.keys(body.results)[0]].previous_close);
									var percentDiff = (currPrice - lastClose) / lastClose;
									var buying_power = "";

									if(currPrice - lastClose < 0 && percentDiff < -.05 && currPrice < 10) {
										Robinhood.popularity(stockSymbol, function(error, response, body) {
											if(body.num_open_positions > 1500) {
												var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-analysis");

												req.query({
													"symbol": stockSymbol
												});

												req.headers({
													"x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
													"x-rapidapi-key": RAPID_KEY
												});

												req.end(function (response) {
													const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
													var trend = response.body.recommendationTrend.trend;
													var trendArr = [];

													for(var i = 0; i < Object.keys(trend).length; i++) {
														var jsonObj = trend[Object.keys(trend)[i]];

														var buy = jsonObj.buy + jsonObj.strongBuy;

														trendArr.push(buy / (buy + jsonObj.hold + jsonObj.sell + jsonObj.strongSell))
													}

													if(average(trendArr) > .75) {
														possibleBuys.push([stockSymbol, percentDiff]);
													}
													else {
														possibleBuyNoRating.push([stockSymbol, percentDiff]);
													}

												if(possibleBuys.length != 0) {
													var highestDiff = 100000000;

													for(var r = 0; r < possibleBuys.length; r++) {
														if(possibleBuys[r][1] < highestDiff) {
															highestDiff = possibleBuys[r][1];
															localStorage.setItem('finalStock', possibleBuys[r][0])
														}
													}
												}
												else {
													var highestDiff = 100000000;

													for(var r = 0; r < possibleBuyNoRating.length; r++) {
														if(possibleBuyNoRating[r][1] < highestDiff) {
															highestDiff = possibleBuyNoRating[r][1];
															localStorage.setItem('finalStock', possibleBuyNoRating[r][0])
														}
													}
												}
											});

												setTimeout(function(){ 
													var finalStock = (localStorage.getItem('finalStock')); 


												if(finalStock != "") {
													Robinhood.accounts(function(err, response, body){
														buying_power = ((body.results[Object.keys(body.results)[0]].margin_balances.day_trade_buying_power));


													var options = {
															type: 'limit',
															quantity: Math.floor((buying_power) / currPrice),
															bid_price: bid_price,
															instrument: {
																	url: instrument,
																	symbol: stockSymbol
															}
													}
													Robinhood.place_buy_order(options, function(error, response, body){
													})
													})
												}
												else {
												}
												}, 5000);
	j
											} // check if open positions is > 2000 
										}); // get popularity of stock
									} // make sure stock passes all requirements
								}); // get quote data for each instrument
							}); // Robinhood url (each instrument)
						} // loop through top movers
				}); // Robinhood url (top-movers) 
			}); //Robinhood initiator
	}
}, null, true, 'America/Chicago');//cron job
 
