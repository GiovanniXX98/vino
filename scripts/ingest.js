const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '../knowledge_docs');
const CONTEXT_FILE = path.join(__dirname, '../client/src/data/wineContext.json');

function ingest() {
  console.log('--- Avvio Ingestione Documenti (RAG easy) ---');
  
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR);
    console.log('Creato cartella knowledge_docs. Inserisci qui i tuoi file .txt');
    return;
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.txt'));
  let fullContext = "";

  files.forEach(file => {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    fullContext += `\n--- DOCUMENTO: ${file} ---\n${content}\n`;
    console.log(`Letto: ${file}`);
  });

  if (fullContext === "") {
    console.log('Nessun file .txt trovato in knowledge_docs/.');
    return;
  }

  // Carica il file JSON esistente
  let contextData = {};
  if (fs.existsSync(CONTEXT_FILE)) {
    contextData = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
  }

  // Aggiorna il campo document_context
  contextData.document_context = fullContext;

  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(contextData, null, 2));
  console.log('--- Successo! wineContext.json aggiornato con i tuoi documenti ---');
}

ingest();
