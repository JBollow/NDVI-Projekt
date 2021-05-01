#!/bin/bash
cd /home/pi/NDVI-Projekt

npm start &
echo "Start NPM"
python3 server.py &
echo "Start PY" 