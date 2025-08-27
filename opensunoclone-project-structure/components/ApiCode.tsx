
import React from 'react';
import { CodeBlock } from './CodeBlock';

const appPyCode = `
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys

# Add the 'src' directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.pipeline import create_song

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Rate Limiting ---
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["5 per minute"],
    storage_uri="memory://",
)

# --- Configuration ---
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'outputs'))
STEMS_DIR = os.path.join(OUTPUT_DIR, 'stems')
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(STEMS_DIR, exist_ok=True)

# --- API Routes ---
@app.route('/songs/<path:filename>')
def serve_song(filename):
    """Serves the main generated audio file."""
    return send_from_directory(OUTPUT_DIR, filename)

@app.route('/stems/<path:filename>')
def serve_stem(filename):
    """Serves a generated audio stem file."""
    return send_from_directory(STEMS_DIR, filename)

@app.route('/generate', methods=['POST'])
@limiter.limit("5 per minute")
def generate_song_endpoint():
    """
    API endpoint to generate a song and its stems from a text prompt.
    Accepts JSON: {"prompt": "...", "weirdness": 10}
    Returns JSON: {"song_url": "...", "stem_urls": {"lows": "...", "highs": "..."}}
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    if 'prompt' not in data:
        return jsonify({"error": "Missing 'prompt' in request body"}), 400

    prompt = data['prompt']
    weirdness = data.get('weirdness', 0)

    # --- Input Validation ---
    if not isinstance(prompt, str) or not (10 <= len(prompt.strip()) <= 200):
        return jsonify({"error": "Prompt must be a string between 10 and 200 characters"}), 400
    if not isinstance(weirdness, int) or not (0 <= weirdness <= 100):
        return jsonify({"error": "'weirdness' must be an integer between 0 and 100"}), 400

    try:
        # Call the main song generation pipeline
        result = create_song(prompt, duration=30, weirdness=weirdness)
        
        # Build response with public URLs
        song_filename = os.path.basename(result['song_path'])
        song_url = url_for('serve_song', filename=song_filename, _external=True)
        
        stem_urls = {}
        for name, path in result['stems'].items():
            stem_filename = os.path.basename(path)
            stem_urls[name] = url_for('serve_stem', filename=stem_filename, _external=True)

        return jsonify({
            "song_url": song_url,
            "stem_urls": stem_urls
        })

    except Exception as e:
        app.logger.error(f"Song generation failed: {e}")
        return jsonify({"error": "An internal error occurred during song generation."}), 500

# --- Main Entry Point ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
`;

const testAppPyCode = `
import pytest
import json
from unittest.mock import patch
from src.app import app as flask_app

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

@patch('src.app.create_song')
def test_generate_song_success(mock_create_song, client):
    """Test the /generate endpoint happy path with stems and weirdness."""
    mock_create_song.return_value = {
        'song_path': "data/outputs/song_mocked.wav",
        'stems': {
            'lows': "data/outputs/stems/lows_mocked.wav",
            'highs': "data/outputs/stems/highs_mocked.wav"
        }
    }
    
    response = client.post(
        '/generate',
        data=json.dumps({"prompt": "A valid test prompt", "weirdness": 10}),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'song_url' in data
    assert 'stem_urls' in data
    assert data['song_url'].endswith('/songs/song_mocked.wav')
    assert data['stem_urls']['lows'].endswith('/stems/lows_mocked.wav')
    mock_create_song.assert_called_once_with("A valid test prompt", duration=30, weirdness=10)

def test_generate_song_no_json(client):
    """Test sending a request without JSON content type."""
    response = client.post('/generate', data="this is not json")
    assert response.status_code == 400
    assert "Request must be JSON" in response.get_json()['error']

def test_generate_song_no_prompt(client):
    """Test request with missing 'prompt' key."""
    response = client.post('/generate', data=json.dumps({"weirdness": 5}), content_type='application/json')
    assert response.status_code == 400
    assert "Missing 'prompt'" in response.get_json()['error']

def test_generate_song_short_prompt(client):
    """Test request with a prompt that is too short."""
    response = client.post('/generate', data=json.dumps({"prompt": "short"}), content_type='application/json')
    assert response.status_code == 400
    assert "between 10 and 200" in response.get_json()['error']
    
def test_generate_song_long_prompt(client):
    """Test request with a prompt that is too long."""
    long_prompt = "a" * 201
    response = client.post('/generate', data=json.dumps({"prompt": long_prompt}), content_type='application/json')
    assert response.status_code == 400
    assert "between 10 and 200" in response.get_json()['error']

def test_generate_song_invalid_weirdness(client):
    """Test request with an invalid 'weirdness' parameter."""
    response = client.post('/generate', data=json.dumps({"prompt": "a valid prompt", "weirdness": "bad"}), content_type='application/json')
    assert response.status_code == 400
    assert "must be an integer" in response.get_json()['error']

@patch('src.app.create_song')
def test_generate_song_pipeline_error(mock_create_song, client):
    """Test how the API handles an exception from the pipeline."""
    mock_create_song.side_effect = RuntimeError("Model failed to load")
    
    response = client.post(
        '/generate',
        data=json.dumps({"prompt": "This prompt is valid but will fail"}),
        content_type='application/json'
    )
    
    assert response.status_code == 500
    assert "internal error" in response.get_json()['error']
`;

const readmeMdCode = `
# OpenSunoClone

OpenSunoClone is a production-ready, text-to-music generator that transforms text prompts into complete songs with lyrics, vocals, instrumentals, and separated audio stems.

## Features

- **End-to-End Music Generation**: From a single text prompt to a complete audio file and its stems.
- **Modular Architecture**: Separate modules for lyrics, music, vocals, and stem separation.
- **AI-Powered**: Utilizes transformer models like GPT-2 for lyrics and SpeechT5 for vocals.
- **Creative Controls**: Includes a 'weirdness' parameter to vary the creative output.
- **Flask API**: A simple, robust API for generating songs, complete with input validation and rate limiting.
- **Production Ready**: Includes a comprehensive test suite, clear documentation, and a structured project layout.

## Installation

(Steps remain the same)

## Usage

### Running the API Server

\`\`\`bash
python src/app.py
\`\`\`
The API will be available at \`http://localhost:5000\`.

### Generating a Song via API

Send a POST request to the \`/generate\` endpoint.

#### Example using \`curl\`:

\`\`\`bash
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "folk song about a lonely robot", "weirdness": 20}' \\
  http://localhost:5000/generate
\`\`\`

#### Success Response

The API will return a JSON object with URLs for the song and its stems:

\`\`\`json
{
  "song_url": "http://localhost:5000/songs/song_20240101_123000.wav",
  "stem_urls": {
    "lows": "http://localhost:5000/stems/lows_20240101_123000.wav",
    "highs": "http://localhost:5000/stems/highs_20240101_123000.wav"
  }
}
\`\`\`

## API Documentation

### POST \`/generate\`

Generates a new song and its stems based on the provided prompt.

-   **Request Body**: \`application/json\`
    \`\`\`json
    {
      "prompt": "<Your song description>",
      "weirdness": 10
    }
    \`\`\`
-   **Parameters**:
    -   \`prompt\` (string, required): A creative description. Length: 10-200 characters.
    -   \`weirdness\` (integer, optional): A number from 0-100 to vary the output. Defaults to 0.

-   **Responses**:
    -   **200 OK**: Song generated successfully.
    -   **400 Bad Request**: Invalid input.
    -   **429 Too Many Requests**: API rate limit exceeded.
    -   **500 Internal Server Error**: An error occurred during the pipeline.
`;

export const ApiCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 4: API & Application Layer
            </h2>
            <p className="text-sm text-slate-400">
                A Flask-based web API to serve the song generation pipeline.
            </p>
        </div>
        <div className="bg-cyan-800/70 text-cyan-200 text-sm font-bold px-3 py-1 rounded-full">
            UPDATED
        </div>
      </div>
      

      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">src/app.py</h3>
          <CodeBlock code={appPyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">tests/test_app.py</h3>
          <CodeBlock code={testAppPyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">README.md</h3>
          <CodeBlock code={readmeMdCode.trim()} language="markdown" />
        </div>
      </div>
    </section>
  );
};
