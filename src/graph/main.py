import asyncio
import logging
import json
import queue
from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .connection import redis_aio, redis_sync
from redis.commands.graph import Node, Graph

logger = logging.getLogger("uvicorn")

logger.setLevel(logging.DEBUG)

app = FastAPI()

transaction_queue = queue.Queue()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def insert_into_graph():
    global transaction_queue
    while True:
        if transaction_queue.empty():
            await asyncio.sleep(1)
            continue
        transaction = transaction_queue.get(block=False)
        add_tx_to_graph(transaction)
        


@app.on_event("startup")
async def startup():
    logger.debug("Task listen for events")
    asyncio.create_task(listen_for_events())
    logger.debug("Task insert_ nto graph")
    asyncio.create_task(insert_into_graph())
    logger.debug("Tasks created")

@app.on_event("shutdown")
async def shutdown():
    pass

async def listen_for_events():
    global transaction_queue
    pubsub = redis_aio.pubsub()
    await pubsub.subscribe('transactions:new')
    async for ev in pubsub.listen():
        if ev['type'] == 'subscribe':
            continue
        if ev != None and ev['channel'] == 'transactions:new' and ev['data'] != None:
            transaction_queue.put(json.loads(ev['data']), block=False)

@app.get("/api/graph/wallets")
async def get_graph(sender:str=None, receiver:str = None):
    def get_json(result):
        nodes = {}
        edges = []
        for idx, res in enumerate(result.result_set):
            if res[0].properties.get("address") not in nodes:
                nodes[res[0].properties.get("address")] = {
                    "id": res[0].properties.get("address"), 
                    "label":  res[0].properties.get("address"), "value": (-1) * res[1].properties.get("amount", 0)}
            else:
                nodes[res[0].properties.get("address")]["value"] -= res[1].properties.get("amount", 0)
            
            if res[2].properties.get("address") not in nodes:
                nodes[res[2].properties.get("address")] = {"id": res[2].properties.get("address"), "label":  res[2].properties.get("address"), "value": res[1].properties.get("amount", 0)}
            else:
                nodes[res[2].properties.get("address")]["value"] += res[1].properties.get("amount", 0)
                
            edges.append({
                "id": idx,
                "amount": res[1].properties.get("amount"),
                "from": res[0].properties.get("address"),
                "to": res[2].properties.get("address"),
                "hash": res[1].properties.get("hash")})

        return {"nodes": list(map(lambda x : x[1], nodes.items())), "edges": edges}

    graph = redis_sync.graph("wallets:graph")
    
    if sender == None and receiver == None:
        result = (graph.query("Match (s:wallet)-[t:transaction]->(d:wallet) return s, t, d  LIMIT 100"))
        return get_json(result)
    
    sender_str = " {address:$sender}" if sender != None else ""
    receiver_str = " {address:$receiver}" if receiver != None else ""

    query = f"Match(s:wallet{sender_str})-[t:transaction]->(d:wallet{receiver_str}) return s, t, d  LIMIT 100"
    return get_json(graph.query(query, params={'sender':sender, 'receiver': receiver}))

def insert_if_not_exists(graph:Graph, address):
    result = graph.query("""MATCH (source:wallet {address:$address}) return source""", {"address": address})
    if len(result.result_set) == 0:
        graph.add_node(Node(label="wallet", properties={"address": address}))
        graph.commit()


def update_edge(graph:Graph, wallet_from, wallet_to, amount, hash):
   query = """MATCH (source:wallet {address:$source}) MATCH (destination:wallet {address:$destination}) CREATE  (source)-[t:transaction {amount:$amount, hash:$hash}]->(destination)"""
   graph.query(query, params={"source": wallet_from, "destination": wallet_to, "hash": hash, "amount": amount})

def add_tx_to_graph(tx):
    graph = get_graph()
    wallet_from = tx.get("from")
    wallet_to = tx.get("to")
    amount = tx.get("from_amount")
    hash = tx.get("hash")

    if wallet_from is not None and wallet_to is not None:
        
        insert_if_not_exists(graph, wallet_from)
        insert_if_not_exists(graph, wallet_to)

        update_edge(
            graph,
            wallet_from,
            wallet_to,
            amount,
            hash
        )
     
        graph.commit()

def get_graph() -> Graph:
    return redis_sync.graph("wallets:graph")