import os
import asyncio
import json
import logging
import time
import aioredis
import redis
import websockets


redis_aio = aioredis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

redis_sync = redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

logging.basicConfig(format='%(asctime)s %(levelname)s %(message)s', level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler())

async def compute_tx(tx):
    usd_str = await redis_aio.get("market:cache:USD")
    eur_str = await redis_aio.get("market:cache:EUR")

    if usd_str == None or eur_str ==None:
        logging.warning("Cant publish transaction, stock market price not available")
        return
    
    timestamp = time.strftime("%Y-%m-%d\n%H:%M:%S", time.localtime(tx["time"]))
    hash = tx["hash"]

    btc_usd = json.loads((usd_str)).get("close")
    btc_eur = json.loads((eur_str)).get("close")

    for input, output in  zip(tx["inputs"], tx["out"]):
        from_address = input["prev_out"]["addr"]
        from_amt = int(input["prev_out"]["value"]) / 100000000
        to_address = output["addr"]
        to_amt = int(output["value"]) / 100000000
        est_aud = "{:,.2f} $".format(float(to_amt) * btc_usd)
        est_eur = "{:,.2f} €".format(float(to_amt) * btc_eur)
        
        logging.debug(f"{timestamp}|{hash}|{from_address}|{from_amt}|{to_address}|{to_amt}|{est_aud}|{est_eur}")

        tx = {
            "time": tx["time"],
            "id": f"{hash}-{from_address}-{to_address}",
            "timestamp": timestamp,
            "from": from_address,
            "from_amount": from_amt,
            "to": to_address,
            "usd": est_aud,
            "eur": est_eur,
            "hash": hash 
        }
    
        if (tx.get("from_amount")) > 1:
            await redis_aio.publish("transactions:new", json.dumps(tx))

async def get_unconfirmed_tx():
    async for websocket in websockets.connect("wss://ws.blockchain.info/inv"):
        await websocket.send(json.dumps({"op": "unconfirmed_sub"}))
        try:
            while True:
                tx = json.loads(await websocket.recv())
                logging.debug(tx.get("op"))
                if tx.get("op") == 'utx' and tx.get("x") != None:
                    logging.debug(tx.get("x").keys())
                    await compute_tx(tx.get("x"))
        except websockets.ConnectionClosed:
            continue


if __name__ == '__main__':
    logging.log(logging.INFO, 'Starting up...')
    try:
        asyncio.run(get_unconfirmed_tx())
    except KeyboardInterrupt:
        pass
