import redis
import aioredis
import os

redis_aio = aioredis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)

redis_sync = redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379"),
    decode_responses=True)