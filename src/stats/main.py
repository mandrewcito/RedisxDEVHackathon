import asyncio
from datetime import datetime, timedelta
import logging

import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .connection import redis_aio, redis_sync
from redis.commands.timeseries import TimeSeries

logger = logging.getLogger("uvicorn")

def get_rts()-> TimeSeries:
    return redis_sync.ts()

rts = get_rts()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_transaction(transaction):
    timestamp = int(transaction.get("time") * 1000)
    logger.debug("Add transactions:series:btc")

    rts.add("transactions:series:btc", timestamp, float(transaction.get("from_amount")))

    logger.debug("Add transactions:series:tx")

    rts.add("transactions:series:tx", timestamp, 1)


@app.on_event("startup")
async def startup():
    if not redis_sync.exists('transactions:series:btc'):
        rts.create('transactions:series:btc', duplicate_policy='SUM', labels={'kind': 'series/btc'} )

    if not redis_sync.exists('transactions:series:tx'):
        rts.create('transactions:series:tx', duplicate_policy='SUM', labels={'kind': 'series/tx'})
    
    for coin in ["usd", "eur"]:
        for price in ["close", "high", "open", "low", "volume"]:
            redis_key = f"btc:{coin}:bars:{price}"
            if not redis_sync.exists(redis_key):
                rts.create(redis_key, duplicate_policy='last', labels={'kind': f"stock/{coin}/{price}"})

    asyncio.create_task(listen_for_events())

@app.on_event("shutdown")
async def shutdown():
    pass

def process_stock_price(stocks):
    for key, stock in stocks.items():
        key = key.lower()
        timestamp = int(datetime.now().timestamp()) * 1000
        rts.add(
                f"btc:{key}:bars:close",
                timestamp,
                stock.get("close")
            )
        rts.add(
                f"btc:{key}:bars:high",
                timestamp,
                stock.get("high")
            )
        rts.add(
                f"btc:{key}:bars:open",
                timestamp,
                stock.get("open")
            )
        rts.add(
                f"btc:{key}:bars:low",
                timestamp,
                stock.get("low")
            )
        rts.add(
                f"btc:{key}:bars:volume",
                timestamp,
                stock.get("volume")
            )
    logger.info("Btc price updated")

async def listen_for_events():
    pubsub = redis_aio.pubsub()
    await pubsub.subscribe("market:update")
    await pubsub.subscribe('transactions:new')
    async for ev in pubsub.listen():
        try:
            if ev['type'] == 'subscribe':
                continue
            if ev != None and ev['channel'] == 'transactions:new' and ev['data'] != None:
                process_transaction(json.loads(ev['data']))
            elif ev != None and ev['channel'] == "market:update" and ev['data'] != None:
                process_stock_price(json.loads(ev['data']))
        except Exception as ex:
            logger.error(ex, stack_info=True)

@app.get("/api/stats/bars/{coin}/{bar_type}")
async def get_bars(coin:str, bar_type:str=None, group_minutes: int = 1, until_minutes:int= 3600 * 7):
    now = datetime.now()
    end = now - timedelta(minutes=group_minutes)
    start = now - timedelta(minutes=until_minutes)

    try:

        if bar_type.strip() != "all":
            return redis_sync.ts().revrange(f"btc:{coin}:bars:{bar_type}", str(int(
                start.timestamp() * 1000)), str(int(end.timestamp() * 1000)))
       
        get_bars = lambda x: redis_sync.ts().revrange(f"btc:{coin}:bars:{x}", str(int(
            start.timestamp() * 1000)), str(int(end.timestamp() * 1000)))

        closings = get_bars("close")
        low = get_bars("low")
        high = get_bars("high")
        open = get_bars("open")

        return list(
            map(
                lambda x: {"x":x[0][0], "y": [x[0][1], x[1][1], x[2][1], x[3][1]]},
                zip(open, high, low, closings)))
    except Exception as ex:
        logger.error(f"btc:{coin}:bars:{bar_type}")
        logger.error(ex, stack_info=True)
        return []


@app.get("/api/stats/chain/{bar_type}")
async def get_chain_bars(bar_type:str, group_minutes: int = 1, until_minutes:int= 3600 * 7):
    now = datetime.now()
    end = now - timedelta(minutes=group_minutes)
    start = now - timedelta(minutes=until_minutes)
    try:
        return redis_sync.ts().revrange(f'transactions:series:{bar_type}', str(int(
            start.timestamp() * 1000)), str(int(end.timestamp() * 1000)))
    except Exception as ex:
        logger.error(ex, stack_info=True)
        logger.error(f'transactions:series:{bar_type}')
        return []