#!/bin/bash

# Script per configurare Ollama per l'accesso sulla rete locale (WiFi)
# Questo script imposta le variabili d'ambiente necessarie e suggerisce come riavviare il servizio.

export OLLAMA_HOST="0.0.0.0"
export OLLAMA_ORIGINS="*"

echo "----------------------------------------------------------"
echo "Configurazione Ollama per Rete Locale"
echo "----------------------------------------------------------"
echo "Indirizzo Host impostato su: $OLLAMA_HOST"
echo "Origini CORS impostate su: $OLLAMA_ORIGINS"
echo ""
echo "Per rendere queste modifiche permanenti su Linux (Systemd):"
echo "1. Esegui: sudo systemctl edit ollama.service"
echo "2. Aggiungi queste righe nella sezione [Service]:"
echo "   Environment=\"OLLAMA_HOST=0.0.0.0\""
echo "   Environment=\"OLLAMA_ORIGINS=*\""
echo "3. Salva e chiudi l'editor."
echo "4. Esegui: sudo systemctl daemon-reload"
echo "5. Esegui: sudo systemctl restart ollama"
echo ""
echo "Oppure esegui temporaneamente Ollama con:"
echo "OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS=* ollama serve"
echo "----------------------------------------------------------"
