# rh-algo-trading
Here's my take on algo trading on Robinhood!

# How It Works

This algorithm runs on a cron job set to go off at 10:00 AM Chicago time. Every time this code runs, it pulls top-movers from the Robinhood Node api and analyzes which stock which is less than $10 dropped the most with a buy rating above 80%. It also checks if there are at least 1500 people who own this stock on Robinhood. It seems to work so far, give it a try and let me know!

# Credit

http://aurbano.eu/robinhood-node/

I got all the function documentation from the link above. Check it out to modify this!
