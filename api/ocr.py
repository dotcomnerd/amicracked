import json
import os
import sys
import tempfile
from http.server import BaseHTTPRequestHandler
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    import Image

import pdf2image
import pytesseract


def debug_log(msg):
    print(f"[OCR DEBUG]: {msg}", file=sys.stderr, flush=True)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok', 'message': 'OCR API is running'}).encode('utf-8'))
        return

    def do_POST(self):
        debug_log("Received POST request.")
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            debug_log(f"Content-Length: {content_length}")
            if content_length == 0:
                debug_log("No file uploaded (zero Content-Length).")
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No file uploaded'}).encode('utf-8'))
                return

            post_data = self.rfile.read(content_length)
            debug_log(f"Read {len(post_data)} bytes from request body.")

            content_type = self.headers.get('Content-Type', '')
            debug_log(f"Content-Type: {content_type}")

            if 'multipart/form-data' in content_type:
                boundary = content_type.split('boundary=')[1]
                debug_log(f"Parsed boundary: {boundary}")
                parts = self._parse_multipart(post_data, boundary)
                debug_log(f"Parsed {len(parts)} parts in multipart data.")

                file_data = None
                filename = None

                for part in parts:
                    debug_log(f"Multipart headers: {part.get('headers', {})}")
                    if 'filename' in part.get('headers', {}):
                        file_data = part['data']
                        filename = part['headers'].get('filename', 'upload.pdf')
                        debug_log(f"Found file: {filename} with size {len(file_data)} bytes.")
                        break

                if not file_data:
                    debug_log("No file found in multipart request.")
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'No file found in request'}).encode('utf-8'))
                    return
            else:
                file_data = post_data
                filename = 'upload.pdf'
                debug_log(f"Non-multipart data, assuming file is {filename}. Size: {len(file_data)} bytes.")

            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(file_data)
                tmp_path = tmp_file.name
                debug_log(f"Wrote uploaded file to temporary path: {tmp_path}")

            try:
                debug_log("Converting PDF to images...")
                images = pdf2image.convert_from_path(tmp_path)
                debug_log(f"Extracted {len(images)} page(s) from PDF.")

                all_text = []
                for pg, img in enumerate(images):
                    debug_log(f"Performing OCR on page {pg + 1}...")
                    text = pytesseract.image_to_string(img)
                    debug_log(f"OCR complete for page {pg + 1}, {len(text)} characters extracted.")
                    all_text.append({
                        'page': pg + 1,
                        'text': text
                    })

                result = {
                    'success': True,
                    'pages': all_text,
                    'total_pages': len(images),
                    'full_text': '\n\n'.join([page['text'] for page in all_text])
                }

                debug_log(f"Returning success response with {len(all_text)} page(s).")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))

            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    debug_log(f"Temporary file {tmp_path} deleted.")

        except Exception as e:
            debug_log(f"Exception occurred: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        debug_log("Received OPTIONS request.")
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _parse_multipart(self, data: bytes, boundary: str) -> list:
        debug_log(f"Parsing multipart data with boundary {boundary}.")
        parts = []
        boundary_bytes = f'--{boundary}'.encode('utf-8')
        parts_data = data.split(boundary_bytes)

        for idx, part_data in enumerate(parts_data[1:-1]):
            if not part_data.strip():
                debug_log(f"Part {idx} is empty, skipping.")
                continue

            header_end = part_data.find(b'\r\n\r\n')
            if header_end == -1:
                debug_log(f"Part {idx} missing header/body separator, skipping.")
                continue

            headers_raw = part_data[:header_end].decode('utf-8', errors='ignore')
            body = part_data[header_end + 4:]

            headers = {}
            for line in headers_raw.split('\r\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    headers[key.strip().lower()] = value.strip()

            if 'content-disposition' in headers:
                disposition = headers['content-disposition']
                if 'filename=' in disposition:
                    filename_start = disposition.find('filename=')
                    filename = disposition[filename_start + 9:].strip('"')
                    headers['filename'] = filename
                    debug_log(f"Found filename in part {idx}: {filename}")

            parts.append({
                'headers': headers,
                'data': body.rstrip(b'\r\n')
            })
            debug_log(f"Added part {idx} with headers: {headers}")

        debug_log(f"Parsing multipart complete. Found {len(parts)} valid part(s).")
        return parts
