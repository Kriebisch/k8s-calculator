#!/bin/bash
if [ -f .dev-pids ]; then
    echo "Beende Port-Forwards..."
    while read -r pid; do
        kill "$pid" 2>/dev/null
    done < .dev-pids
    rm .dev-pids
    echo "Fertig."
else
    echo "Keine laufenden Port-Forwards gefunden."
fi