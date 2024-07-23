#!/bin/bash

docker compose up -d mongo
echo "Waiting for mongodb container to start"
sleep 10

echo "Initializing replica set"
docker exec -it mongo-cdj mongosh --eval "rs.initiate({
 \"_id\": \"rs0\",
 members: [
   { \"_id\": 0, host: \"mongo-cdj\"}
 ]
})"

echo "Seeding db"
docker compose up -d --build
docker exec -it backend-cdj node data/seed.js

docker compose down
echo "Completed initializing the CDJ"