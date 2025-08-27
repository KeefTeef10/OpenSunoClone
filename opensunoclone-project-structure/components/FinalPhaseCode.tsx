
import React from 'react';
import { CodeBlock } from './CodeBlock';

const usageMdCode = `
# OpenSunoClone: Usage Guide

This guide provides detailed instructions on how to install, use, and contribute to the OpenSunoClone project.

## 1. Installation

### Prerequisites
- Python 3.10+
- \`pip\` and \`venv\`
- Git

### Setup
1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/YOUR_USERNAME/OpenSunoClone.git
    cd OpenSunoClone
    \`\`\`

2.  **Run the setup script:**
    This script will create a virtual environment and install all required dependencies.
    \`\`\`bash
    bash scripts/setup.sh
    \`\`\`

3.  **Activate the virtual environment:**
    \`\`\`bash
    source env/bin/activate
    \`\`\`

## 2. Running the Application

### Start the API Server
Execute the main Flask application file:
\`\`\`bash
python src/app.py
\`\`\`
The server will start on \`http://localhost:5000\`. The first run may be slow as it needs to download the pre-trained AI models.

### Running Tests
To ensure everything is working correctly, run the comprehensive test suite:
\`\`\`bash
pytest
\`\`\`
To get a test coverage report:
\`\`\`bash
pytest --cov=src
\`\`\`

## 3. API Usage

The primary way to interact with the application is through its REST API.

### Endpoint: \`POST /generate\`

This endpoint generates a song from a text prompt.

-   **URL**: \`http://localhost:5000/generate\`
-   **Method**: \`POST\`
-   **Headers**: \`Content-Type: application/json\`
-   **Body (JSON)**:
    -   \`prompt\` (string, required): A descriptive prompt for the song. Must be between 10 and 200 characters.
    -   \`weirdness\` (integer, optional): A value from 0 to 100 to control the creativity/randomness of the output. Defaults to 0.

#### Example with \`curl\`

\`\`\`bash
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "a sad, slow blues song about a rainy Monday", "weirdness": 15}' \\
  http://localhost:5000/generate
\`\`\`

#### Success Response (200 OK)

\`\`\`json
{
  "song_url": "http://localhost:5000/songs/song_20240520_103000.wav",
  "stem_urls": {
    "highs": "http://localhost:5000/stems/song_20240520_103000_highs.wav",
    "lows": "http://localhost:5000/stems/song_20240520_103000_lows.wav"
  }
}
\`\`\`

## 4. Troubleshooting

-   **Model Download Errors**: If you encounter errors during the first run, ensure you have a stable internet connection. Models are cached after the first download.
-   **CUDA/GPU Issues**: The application automatically detects and uses a GPU if available. If you have CUDA issues, ensure your PyTorch installation matches your NVIDIA driver version. You can force CPU usage by setting an environment variable: \`CUDA_VISIBLE_DEVICES="" python src/app.py\`.
-   **File Not Found Errors**: Make sure you are running the scripts from the root directory of the project.

## 5. Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  **Fork the repository** on GitHub.
2.  **Create a new branch** for your feature: \`git checkout -b feat/my-new-feature\`.
3.  **Make your changes** and add/update tests accordingly.
4.  **Ensure all tests pass**: \`pytest\`.
5.  **Commit your changes** with a conventional commit message.
6.  **Push to your branch** and open a Pull Request.
`;

const setupShCode = `
#!/bin/bash
# This script sets up the development environment for OpenSunoClone.

echo "--- Setting up Python virtual environment ---"

# Check if python3 is available
if ! command -v python3 &> /dev/null
then
    echo "python3 could not be found. Please install Python 3.10+."
    exit
fi

# Create a virtual environment in the 'env' directory
python3 -m venv env

# Activate the virtual environment
source env/bin/activate

echo "--- Installing dependencies from requirements.txt ---"
pip install -r requirements.txt

echo "--- Setup complete! ---"
echo "To activate the environment, run: source env/bin/activate"
`;

const deployShCode = `
#!/bin/bash
# This is a conceptual script for deploying the OpenSunoClone Flask API.
# A production deployment would require a more robust setup (e.g., Docker, Gunicorn, Nginx).

echo "--- Starting OpenSunoClone Production Server (Conceptual) ---"

# Activate the virtual environment
source env/bin/activate

# Use Gunicorn as a production-grade WSGI server
# -w 4: Use 4 worker processes
# -b 0.0.0.0:8000: Bind to all network interfaces on port 8000
# src.app:app: The application instance 'app' in the 'src/app.py' module
gunicorn -w 4 -b 0.0.0.0:8000 src.app:app

echo "--- Server is running via Gunicorn ---"

# --- Example Dockerfile ---
#
# FROM python:3.12-slim
#
# WORKDIR /app
#
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
#
# COPY . .
#
# # Expose the port Gunicorn will run on
# EXPOSE 8000
#
# # Command to run the application
# CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "src.app:app"]
`;

const feedbackPyCode = `
import requests
import os
import json

# --- Configuration (replace with your details) ---
GITHUB_REPO = "YOUR_USERNAME/OpenSunoClone"
GITHUB_TOKEN = os.environ.get("GITHUB_API_TOKEN") # Optional: for higher rate limits

def collect_feedback():
    """
    A simplified feedback collector that fetches the titles of open issues
    from the project's GitHub repository.

    This script replaces the previous version that included sentiment analysis,
    providing a more direct and streamlined way to gather user feedback.
    """
    print(f"--- Collecting feedback from GitHub repo: {GITHUB_REPO} ---")
    
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        issues = response.json()
        
        if not issues:
            print("No open issues found to analyze.")
            return

        print(f"Found {len(issues)} open issues. Feedback summary:")
        
        feedback_summary = [
            {"issue": f"#{issue['number']}", "title": issue['title']} for issue in issues
        ]
        
        print(json.dumps(feedback_summary, indent=2))
        print("\\n--- Feedback collection complete ---")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from GitHub: {e}")
        print("Please ensure the repository name is correct and you have an internet connection.")

if __name__ == "__main__":
    collect_feedback()
`;

export const FinalPhaseCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 6: Final Documentation & Scripts
            </h2>
            <p className="text-sm text-slate-400">
                Finalizing the project with usage guides, utility scripts, and enhanced tests.
            </p>
        </div>
        <div className="bg-green-800/70 text-green-200 text-sm font-bold px-3 py-1 rounded-full">
            PROJECT COMPLETE
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">docs/usage.md</h3>
          <CodeBlock code={usageMdCode.trim()} language="markdown" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">scripts/setup.sh</h3>
          <CodeBlock code={setupShCode.trim()} language="shell" />
        </div>
         <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">scripts/deploy.sh (Conceptual)</h3>
          <CodeBlock code={deployShCode.trim()} language="shell" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">scripts/collect_feedback.py</h3>
          <CodeBlock code={feedbackPyCode.trim()} language="python" />
        </div>
      </div>
    </section>
  );
};
