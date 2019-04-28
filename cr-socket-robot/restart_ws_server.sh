#!/bin/sh
forever stop /root/cr-socket-robot/index.js
forever start -l /root/cr-socket-robot/logs/ws_server.log --append /root/cr-socket-robot/index.js