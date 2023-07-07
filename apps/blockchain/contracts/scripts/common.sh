#!/bin/bash

# Load .env file in the current directory.
load_env() {
    if [ -z "$1" ]; then
        echo "No env file provided"
        exit 1
    fi

    fpath="$1"

    if [ -f "$fpath" ]; then
        export $(cat "$fpath" | xargs) 
    else
        echo "No .env file found"
        exit 1
    fi
}
