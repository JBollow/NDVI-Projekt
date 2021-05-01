#!/bin/bash
sleep 30s && cd /home/pi/NDVI-Projekt && npm start && python3 server.py &
exit 0