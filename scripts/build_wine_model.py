import json
import os
import subprocess

# Percorsi dei file
JSON_PATH = "client/src/data/wineContext.json"
MODELFILE_PATH = "Modelfile_wine_expert"
BASE_MODEL = "deepseek-r1:1.5b"
TARGET_MODEL = "wine-expert"

def build_model():
    print(f"--- Creazione Modello Ollama: {TARGET_MODEL} ---")
    
    # 1. Caricamento conoscenza dai documenti (JSON)
    if not os.path.exists(JSON_PATH):
        print(f"Errore: File {JSON_PATH} non trovato. Esegui prima l'ingestione!")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    personality = data.get("personality", "Un esperto enologo professionale.")
    document_context = data.get("document_context", "")
    
    # 2. Generazione del Modelfile
    modelfile_content = f"""
FROM {BASE_MODEL}

# Impostazioni chatbot
PARAMETER temperature 0.7
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"

# Personalità e Conoscenza
SYSTEM \"\"\"
{personality}

Dati specialistici sui tuoi documenti di vino:
{document_context}

REGOLE COMPORTAMENTALI:
- Rispondi sempre in italiano.
- Sii estremamente tecnico se richiesto, basandoti sui dati sopra.
- Se non conosci la risposta nei dati forniti, dillo chiaramente.
- Non inventare fatti non presenti nel contesto documentale.
\"\"\"
"""
    
    with open(MODELFILE_PATH, "w", encoding="utf-8") as f:
        f.write(modelfile_content)
    
    print(f"Modelfile generato in {MODELFILE_PATH}")

    # 3. Esecuzione del comando Ollama per creare il modello
    print(f"Esecuzione: ollama create {TARGET_MODEL} -f {MODELFILE_PATH}...")
    try:
        result = subprocess.run(["ollama", "create", TARGET_MODEL, "-f", MODELFILE_PATH], 
                              capture_output=True, text=True, check=True)
        print("Successo! Modello creato correttamente.")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Errore durante la creazione del modello: {e.stderr}")
    finally:
        # Pulizia
        if os.path.exists(MODELFILE_PATH):
            os.remove(MODELFILE_PATH)

if __name__ == "__main__":
    build_model()
