import asyncio

import os
import logging
import aioredis
import json
import requests

from datetime import datetime, timedelta

logging.basicConfig(format='%(asctime)s %(levelname)s %(message)s', level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

redis = aioredis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

async def get_stock_quotes(pair, key, minutes_interval=1, since=(datetime.now() - timedelta(minutes=1)).timestamp()) -> dict:
    response = requests.get(f'https://api.kraken.com/0/public/OHLC?pair={pair}&interval={minutes_interval}&since={since}')
    def compute_price(array):
        x = array[0]
        return {
                    "time": x[0], #datetime.fromtimestamp(x[0]),
                    "open": float(x[1]),
                    "high": float(x[2]),
                    "low": float(x[3]),
                    "close": float(x[4]),
                    "vwap": float(x[5]),
                    "volume": float(x[6]),
                    "count": int(x[7])
            }

    if response.status_code == 200:
        data = response.json().get("result")
        return compute_price(data[key])
    else:
        logging.error(f"Market error f{response.status_code} {response.content}")


async def get_btc_pricing():
    while True:
        try:
            data = {
                "USD": await get_stock_quotes("BTCUSD", "XXBTZUSD"),
                "EUR": await get_stock_quotes("BTCEUR", "XXBTZEUR")
            }

            for key, value in data.items():
                await redis.set(
                    f"market:cache:{key}",
                    json.dumps(value))
            
            await redis.publish("market:update", json.dumps(data))
        except Exception as ex:
            logging.error(ex)

        await asyncio.sleep(60)

if __name__ == '__main__':
    logging.info('Starting up...')
    try:
        asyncio.run(get_btc_pricing())
    except KeyboardInterrupt:
        pass
