#!/bin/sh
forever stop /root/socket.io-server/index.js
forever start -l /root/socket.io-server/logs/ws_server.log --append /root/socket.io-server/index.js