#!/bin/bash

docker exec -it mongo-cdj mongosh --eval "rs.initiate({
 \"_id\": \"rs0\",
 members: [
   { \"_id\": 0, host: \"mongo-cdj\"}
 ]
})"

docker exec -it backend-cdj node data/seed.js
