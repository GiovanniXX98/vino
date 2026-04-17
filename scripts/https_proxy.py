import http.server
import ssl
import urllib.request
import json

# Configurazione
LISTEN_PORT = 11435
OLLAMA_URL = "http://localhost:11434"

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Gestione CORS Preflight
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Inoltra la richiesta a Ollama
        try:
            req = urllib.request.Request(
                f"{OLLAMA_URL}{self.path}",
                data=post_data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req) as response:
                res_data = response.read()
                self.send_response(response.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(res_data)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_GET(self):
        # Semplice splash page per accettare il certificato
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"<h1>HTTPS Proxy per Ollama Attivo</h1><p>Se vedi questa pagina, il certificato e' stato accettato correttamente.</p>")

print(f"Avvio HTTPS Proxy sulla porta {LISTEN_PORT}...")
httpd = http.server.HTTPServer(('0.0.0.0', LISTEN_PORT), ProxyHandler)

# Configura SSL
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='scripts/cert.pem', keyfile='scripts/key.pem')

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer interrotto.")
    httpd.server_close()
