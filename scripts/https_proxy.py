import http.server
import ssl
import urllib.request
import json
import socketserver
import threading

# Configurazione
PROXIES = [
    {"listen_port": 11435, "target_url": "http://localhost:11434", "name": "Ollama"},
    {"listen_port": 3001, "target_url": "http://localhost:3000", "name": "Node Server (API)"}
]

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Silenzia i log normali per non intasare la console
        pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def handle_request(self, method):
        # Determina a quale target inviare in base alla porta su cui abbiamo ricevuto la richiesta
        listen_port = self.server.server_address[1]
        proxy_config = next((p for p in PROXIES if p["listen_port"] == listen_port), None)
        
        if not proxy_config:
            self.send_response(404)
            self.end_headers()
            return

        target_url = proxy_config["target_url"]
        
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else None

        # Copia gli header originali (tranne host e content-length che vengono gestiti da urllib)
        headers = {k: v for k, v in self.headers.items() if k.lower() not in ['host', 'content-length']}
        
        try:
            req = urllib.request.Request(
                f"{target_url}{self.path}",
                data=post_data,
                headers=headers,
                method=method
            )
            with urllib.request.urlopen(req) as response:
                res_data = response.read()
                self.send_response(response.status)
                
                # Copia gli header di risposta
                for k, v in response.getheaders():
                    if k.lower() not in ['transfer-encoding', 'content-encoding', 'access-control-allow-origin']:
                        self.send_header(k, v)
                
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(res_data)
        except Exception as e:
            print(f"Errore Proxy ({proxy_config['name']}): {e}")
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_POST(self):
        self.handle_request('POST')

    def do_GET(self):
        # Splash page per accettare il certificato
        if self.path == "/":
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b"<h1>HTTPS Proxy Attivo</h1><p>Se vedi questa pagina, il certificato e' stato accettato. Chiudi e torna al sito.</p>")
        else:
            self.handle_request('GET')

def start_proxy(config):
    port = config["listen_port"]
    name = config["name"]
    print(f"Avvio HTTPS Proxy per {name} su porta {port} -> {config['target_url']}")
    
    httpd = http.server.HTTPServer(('0.0.0.0', port), ProxyHandler)
    
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile='scripts/cert.pem', keyfile='scripts/key.pem')
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    httpd.serve_forever()

if __name__ == "__main__":
    threads = []
    for proxy in PROXIES:
        t = threading.Thread(target=start_proxy, args=(proxy,), daemon=True)
        t.start()
        threads.append(t)
    
    print("\nTutti i proxy sono attivi. Premi Ctrl+C per fermare.")
    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nArresto proxy...")
