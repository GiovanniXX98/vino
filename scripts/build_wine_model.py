import json
import os
import subprocess

# Percorsi dei file
JSON_PATH = "client/src/data/wineContext.json"
MODELFILE_PATH = "Modelfile"
BASE_MODEL = "deepseek-r1:1.5b"
TARGET_MODEL = "wine-expert"

def build_model():
    print(f"--- Affinamento Modello Ollama: {TARGET_MODEL} ---")
    
    # 1. Caricamento conoscenza dai documenti (JSON)
    if not os.path.exists(JSON_PATH):
        print(f"Errore: File {JSON_PATH} non trovato. Esegui prima l'ingestione!")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    personality = data.get("personality", "Un aiutante enologo empatico e cordiale.")
    document_context = data.get("document_context", "")
    
    # 2. Generazione del Modelfile con regole di lingua e personalità
    modelfile_content = f"""
FROM {BASE_MODEL}

# Impostazioni chatbot
PARAMETER temperature 0.7
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"

# Personalità, Conoscenza e Regole Linguistiche
SYSTEM \"\"\"
{personality}

Dati specialistici sui tuoi documenti di vino (Usa questi per le risposte tecniche):
{document_context}

REGOLE COMPORTAMENTALI (MANDATORIE):
1. LINGUA: Rispondi **esclusivamente** in lingua italiana. 
2. ECCEZIONE TECNICA: Se utilizzi termini tecnici vinicoli o enologici in inglese (es. 'tannins', 'late harvest', 'cold stabilization'), puoi integrare spiegazioni o risposte bilingue, ma la struttura portante deve rimanere in italiano.
3. EMPATIA: Sii sempre un aiutante empatico, gentile e pronto a incoraggiare l'utente nel suo apprendimento.
4. COERENZA: Se non trovi l'informazione nei dati forniti, ammettilo garbatamente e offri assistenza generale basata sulla tua natura di enologo.
\"\"\"
"""
    
    with open(MODELFILE_PATH, "w", encoding="utf-8") as f:
        f.write(modelfile_content)
    
    print(f"Modelfile aggiornato in {MODELFILE_PATH}")

    # 3. Aggiornamento del modello
    print(f"Esecuzione: ollama create {TARGET_MODEL} -f {MODELFILE_PATH}...")
    try:
        result = subprocess.run(["ollama", "create", TARGET_MODEL, "-f", MODELFILE_PATH], 
                              capture_output=True, text=True, check=True)
        print("Successo! Personalità e regole lingua aggiornate.")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Errore durante l'aggiornamento: {e.stderr}")
    
    # Rimosso il blocco finally per lasciare il Modelfile a disposizione dell'utente

if __name__ == "__main__":
    build_model()
