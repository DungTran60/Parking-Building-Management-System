#!/bin/bash

HOST=${1:-mysql}
PORT=${2:-3306}
USER=${3:-parking}
PASSWORD=${4:-parkingpassword}
TIMEOUT=${5:-60}

echo "Waiting for MySQL at $HOST:$PORT with timeout ${TIMEOUT}s..."

counter=0
while ! mysqladmin ping -h"$HOST" -u"$USER" -p"$PASSWORD" --silent; do
    if [ $counter -gt $TIMEOUT ]; then
        echo "MySQL failed to start within timeout!"
        exit 1
    fi
    counter=$((counter + 1))
    sleep 1
done

echo "MySQL is ready! Proceeding with application startup..."
exit 0
