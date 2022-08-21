from audioop import add
from functools import lru_cache
import os
import asyncio
import requests
import aioredis
import json
import logging
import redis

from typing import List, Union

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .connection_manager import ConnectionManager

logger = logging.getLogger("uvicorn")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()

redis_aio = aioredis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

redis_sync = redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

async def listen_for_events():
    pubsub = redis_aio.pubsub()
    await pubsub.subscribe('transactions:new')
    await pubsub.subscribe("topk:updated")
    async for ev in pubsub.listen():
        if ev['type'] == 'subscribe':
            continue
        elif ev['channel'] == 'transactions:new':
            await manager.broadcast(
                json.dumps({"type": "tx", "data": json.loads(ev['data'])}))
        elif ev["channel"] == "topk:updated":
            await manager.broadcast(
                json.dumps({"type": "topk", "data": get_topk()}))

def get_topk():

    response_senders = requests.get("http://topk/api/topk/wallets/senders")
    response_receivers = requests.get("http://topk/api/topk/wallets/receivers")

    return {
        "senders": response_senders.json() if response_senders.status_code == 200 else [],
        "receivers": response_receivers.json() if response_receivers.status_code == 200 else [],
    }

previous = {}

@app.get("/api/stock/current")
async def read_root():
    global previous

    usd, eur = await redis_aio.get("market:cache:USD"), await redis_aio.get("market:cache:EUR")
    
    if usd is not None:
        previous["USD"] =  json.loads(usd)
    
    if eur is not None:
        previous ["EUR"] = json.loads(eur) 
    
    return previous
    
@app.get("/")
async def read_root():
    return {"Hello": "World"}

@lru_cache
def query_btc_address(url, address):
    response = requests.get(f"{url}{address}")
    if response.status_code == 200:
        return response.content
    raise ValueError(f"Error calling service blockchain status_code {response.status_code}")


@app.get("/api/wallets/{address}")
async def read_root(address: str):
    toBtc = lambda x: int(x) / 100000000
    return {
        "address": address * 1000,
        "received": toBtc(query_btc_address("https://blockchain.info/q/getreceivedbyaddress/", address)),
        "sent": toBtc(query_btc_address("https://blockchain.info/q/getsentbyaddress/", address)),
        "balance": toBtc(query_btc_address("https://blockchain.info/q/addressbalance/", address)),
        "addressfirstseen": query_btc_address("https://blockchain.info/q/addressfirstseen/", address)
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.debug(f"Client #{client_id} left the chat")

@app.on_event("startup")
async def startup():
    asyncio.create_task(listen_for_events())

@app.on_event("shutdown")
async def shutdown():
    pass