#!/bin/bash
echo "Starte Port-Forwards..."

kubectl port-forward svc/frontend-service 8080:80 > /dev/null 2>&1 &
FRONTEND_PID=$!

kubectl port-forward svc/calculator-api 3000:3000 > /dev/null 2>&1 &
API_PID=$!

echo "$FRONTEND_PID" > .dev-pids
echo "$API_PID" >> .dev-pids

echo "Frontend läuft auf http://localhost:8080 (PID $FRONTEND_PID)"
echo "Calculator API läuft auf http://localhost:3000 (PID $API_PID)"