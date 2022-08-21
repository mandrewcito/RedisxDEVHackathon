import asyncio
from datetime import datetime, timedelta
import logging
import json

from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .connection import redis_aio, redis_sync

logger = logging.getLogger("uvicorn")

app = FastAPI()

SENDERS_KEY = "topk:wallets:senders"
RECEIVERS_KEY = "topk:wallets:receivers"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    if not redis_sync.exists(SENDERS_KEY):
        redis_sync.topk().reserve(SENDERS_KEY, 10, 50, 4, 0.9)
    if not redis_sync.exists(RECEIVERS_KEY):
        redis_sync.topk().reserve(RECEIVERS_KEY, 10, 50, 4, 0.9)
    asyncio.create_task(listen_for_events())

@app.on_event("shutdown")
async def shutdown():
    pass

last_update = None

async def listen_for_events():
    global last_update
    pubsub = redis_aio.pubsub()
    await pubsub.subscribe('transactions:new')

    async for ev in pubsub.listen():
        if ev['type'] == 'subscribe':
            continue
        if ev != None and ev['channel'] == 'transactions:new' and ev['data'] != None:
            data = json.loads(ev['data'])
            
            if data.get("from") != None:
                redis_sync.topk().add(SENDERS_KEY, data.get("from"))
            
            if data.get("to") != None:
                redis_sync.topk().add(RECEIVERS_KEY, data.get("to"))
                
            if last_update == None or (datetime.now() - last_update)  > timedelta(minutes=1):
                await redis_aio.publish("topk:updated", json.dumps({
                    "senders": redis_sync.topk().list(SENDERS_KEY),
                    "receivers": redis_sync.topk().list(RECEIVERS_KEY)
                }))
                last_update = datetime.now()
            
@app.get("/api/topk/wallets/senders")
async def get_topk_wallets():
    return redis_sync.topk().list(SENDERS_KEY)

@app.get("/api/topk/wallets/receivers")
async def get_topk_wallets():
    return redis_sync.topk().list(RECEIVERS_KEY)