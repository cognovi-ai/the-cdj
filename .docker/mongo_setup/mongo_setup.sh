#!/bin/bash
sleep 10

mongosh --host ${HOST}:${PORT} <<EOF
  var cfg = {
    "_id": "${REPL_ID}",
    "members": [
      {
        "_id": 0,
        "host": "${HOST}:${PORT}",
      }
    ]
  };
  rs.initiate(cfg);
EOF