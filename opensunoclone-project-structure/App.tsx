
import React from 'react';
import { FileTree } from './components/FileTree';
import { CodeBlock } from './components/CodeBlock';
import type { TreeNode } from './types';
import { SunoAnalysis } from './components/SunoAnalysis';
import { LyricsGenCode } from './components/LyricsGenCode';
import { MusicGenCode } from './components/MusicGenCode';
import { VocalsGenCode } from './components/VocalsGenCode';
import { PipelineCode } from './components/PipelineCode';
import { DeploymentSection } from './components/DeploymentSection';
import { ApiCode } from './components/ApiCode';
import { StemsCode } from './components/StemsCode';
import { FinalPhaseCode } from './components/FinalPhaseCode';

const projectStructure: TreeNode = {
  name: 'OpenSunoClone',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: '__init__.py', type: 'file', fileType: 'python' },
        { name: 'lyrics_gen.py', type: 'file', fileType: 'python' },
        { name: 'music_gen.py', type: 'file', fileType: 'python' },
        { name: 'vocals_gen.py', type: 'file', fileType: 'python' },
        { name: 'pipeline.py', type: 'file', fileType: 'python' },
        { name: 'app.py', type: 'file', fileType: 'python' },
        { name: 'stems.py', type: 'file', fileType: 'python' },
      ],
    },
    { name: 'models', type: 'folder', children: [{ name: '.gitkeep', type: 'file' }] },
    {
      name: 'data',
      type: 'folder',
      children: [
        { name: 'inputs', type: 'folder', children: [{ name: 'initial_prompt.txt', type: 'file', fileType: 'text' }] },
        {
          name: 'outputs',
          type: 'folder',
          children: [
            { name: 'lyrics', type: 'folder', children: [{ name: '.gitkeep', type: 'file' }] },
            { name: 'instrumentals', type: 'folder', children: [{ name: '.gitkeep', type: 'file' }] },
            { name: 'mixed', type: 'folder', children: [{ name: '.gitkeep', type: 'file' }] },
            { name: 'stems', type: 'folder', children: [{ name: '.gitkeep', type: 'file' }] },
          ],
        },
      ],
    },
    {
      name: 'tests',
      type: 'folder',
      children: [
        { name: '__init__.py', type: 'file', fileType: 'python' },
        { name: 'test_lyrics.py', type: 'file', fileType: 'python' },
        { name: 'test_music.py', type: 'file', fileType: 'python' },
        { name: 'test_vocals.py', type: 'file', fileType: 'python' },
        { name: 'test_pipeline.py', type: 'file', fileType: 'python' },
        { name: 'test_app.py', type: 'file', fileType: 'python' },
        { name: 'test_stems.py', type: 'file', fileType: 'python' },
      ],
    },
    {
      name: 'docs',
      type: 'folder',
      children: [
        { name: 'README.md', type: 'file', fileType: 'markdown' },
        { name: 'usage.md', type: 'file', fileType: 'markdown' },
        { name: 'feedback.md', type: 'file', fileType: 'markdown' },
        { name: 'evolution.md', type: 'file', fileType: 'markdown' },
      ],
    },
    {
      name: 'scripts',
      type: 'folder',
      children: [
        { name: 'setup.sh', type: 'file', fileType: 'shell' },
        { name: 'deploy.sh', type: 'file', fileType: 'shell' },
        { name: 'collect_feedback.py', type: 'file', fileType: 'python' },
      ],
    },
    { name: '.gitignore', type: 'file', fileType: 'git' },
    { name: 'requirements.txt', type: 'file', fileType: 'text' },
    { name: 'setup.py', type: 'file', fileType: 'python' },
  ],
};

const gitignoreContent = `
/env/
/data/outputs/*
__pycache__/
*.pyc
*.pyo
*.pyd
.pytest_cache/
*.wav
*.mp3
`;

const initialPromptContent = `upbeat jazz about city life`;

const requirementsContent = `
# Core AI Libraries
torch
transformers
torchaudio
datasets # For speaker embeddings

# Web Framework & API
flask
flask-cors
flask-limiter

# Testing
pytest
pytest-cov # For test coverage
requests # For feedback script

# For sentiment analysis (optional, in feedback script)
# textblob
`;

const feedbackMdContent = `
# User Feedback Collection

This document tracks simulated user feedback for improving the model's realism.

## Song: "Adventure Rock"
- **Prompt:** energetic rock song about adventure
- **Realism Rating (1-10):** 6
- **Comments:** The vocals sound clear but a bit robotic. The melody is simple but fits the rock theme. The mix is decent, but the vocals could be a little louder.

## Song: "City Jazz"
- **Prompt:** upbeat jazz about city life
- **Realism Rating (1-10):** 7
- **Comments:** The jazz instrumental is nice. The vocals are a bit monotonous for a jazz song, but the timing is good. I'd like to see more vocal inflection.
`;


const initGitCommands = [
  {
    command: 'git init -b main',
    description: 'Initialize a new Git repository with "main" as the default branch.',
  },
  {
    command: 'git add .',
    description: 'Stage all the newly created files and folders for the first commit.',
  },
  {
    command: 'git commit -m "Initial project structure for OpenSunoClone"',
    description: 'Commit the staged files with a descriptive message.',
  },
  {
    command: 'git remote add origin https://github.com/YOUR_USERNAME/OpenSunoClone.git',
    description: 'Connect your local repository to the remote one on GitHub (replace with your URL).',
  },
  {
    command: 'git push -u origin main',
    description: 'Push your local commits to the remote repository and set it as the upstream branch.',
  },
];

const phase2LyricsGitCommands = [
  {
    command: 'git add src/lyrics_gen.py tests/test_lyrics.py',
    description: 'Stage the implemented lyrics module and its unit tests.',
  },
  {
    command: 'git commit -m "feat(lyrics): implement core lyrics generation"',
    description: 'Commit the new feature with a conventional commit message.',
  },
];

const phase2MusicGitCommands = [
    {
        command: 'git add src/music_gen.py tests/test_music.py',
        description: 'Stage the new instrumental generation module and its tests.',
    },
    {
        command: 'git commit -m "feat(music): implement foundational music generation"',
        description: 'Commit the new music generation feature.',
    }
];

const phase2VocalsGitCommands = [
    {
        command: 'git add src/vocals_gen.py tests/test_vocals.py docs/feedback.md',
        description: 'Stage the vocal synthesis module, its tests, and feedback doc.',
    },
    {
        command: 'git commit -m "feat(vocals): implement vocal synthesis and mixing"',
        description: 'Commit the new vocal generation feature.',
    }
];

const phase3PipelineGitCommands = [
    {
        command: 'git add src/pipeline.py tests/test_pipeline.py',
        description: 'Stage the end-to-end pipeline and its integration tests.',
    },
    {
        command: 'git commit -m "feat(pipeline): implement full E2E song generation"',
        description: 'Commit the complete pipeline feature.',
    }
];

const phase4ApiGitCommands = [
    {
        command: 'git add src/app.py tests/test_app.py README.md requirements.txt',
        description: 'Stage the Flask API, its tests, and updated documentation.',
    },
    {
        command: 'git commit -m "feat(api): implement Flask API for song generation"',
        description: 'Commit the new API interface feature.',
    }
];

const phase5StemsGitCommands = [
    {
        command: 'git add src/stems.py tests/test_stems.py src/pipeline.py tests/test_pipeline.py src/app.py tests/test_app.py README.md',
        description: 'Stage the new stems module, its tests, and updates to the pipeline, API, and docs.',
    },
    {
        command: 'git commit -m "feat(stems): implement stem separation and weirdness control"',
        description: 'Commit the new advanced features.',
    }
];

const phase6FinalGitCommands = [
    {
        command: 'git add docs/usage.md scripts/ tests/',
        description: 'Stage the final documentation, utility scripts, and enhanced tests.',
    },
    {
        command: 'git commit -m "docs(usage): add comprehensive usage and contribution guide\n\nfeat(scripts): add setup, deploy, and feedback scripts\n\n- Add docs/usage.md with API examples and troubleshooting.\n- Add scripts for setup, deployment, and feedback simulation.\n- Enhance test coverage across all modules."',
        description: 'Commit the final project assets with a detailed message.',
    }
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">OpenSunoClone</h1>
            <p className="mt-2 text-lg text-slate-400">A Production-Ready Text-to-Music Generator Project</p>
        </header>

        <main className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
                    <h2 className="text-2xl font-semibold mb-4 text-white border-b border-slate-600 pb-2">Directory Structure</h2>
                    <div className="p-4 bg-slate-900 rounded-md">
                       <FileTree node={projectStructure} />
                    </div>
                </section>

                <div className="flex flex-col gap-8">
                    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-slate-600 pb-2">Git Workflow</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 1: Initialization</h3>
                                <div className="space-y-4">
                                    {initGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 2: Core Logic (Lyrics)</h3>
                                <div className="space-y-4">
                                    {phase2LyricsGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 2: Core Logic (Music)</h3>
                                <div className="space-y-4">
                                    {phase2MusicGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 2: Core Logic (Vocals)</h3>
                                <div className="space-y-4">
                                    {phase2VocalsGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 3: Integration (Pipeline)</h3>
                                <div className="space-y-4">
                                    {phase3PipelineGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 4: API Layer</h3>
                                <div className="space-y-4">
                                    {phase4ApiGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 5: Advanced Features</h3>
                                <div className="space-y-4">
                                    {phase5StemsGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-700"></div>
                             <div>
                                <h3 className="font-semibold text-slate-300 mb-3">Phase 6: Finalization</h3>
                                <div className="space-y-4">
                                    {phase6FinalGitCommands.map((item, index) => (
                                        <div key={index}>
                                            <CodeBlock code={item.command} language="bash" />
                                            <p className="text-sm text-slate-400 mt-1 pl-2 whitespace-pre-wrap">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-slate-600 pb-2">Example Files</h2>
                         <div className="space-y-6">
                            <div>
                                <h3 className="font-mono text-cyan-400 mb-2">.gitignore</h3>
                                <CodeBlock code={gitignoreContent.trim()} language="git" />
                            </div>
                            <div>
                                <h3 className="font-mono text-cyan-400 mb-2">data/inputs/initial_prompt.txt</h3>
                                <CodeBlock code={initialPromptContent.trim()} language="text" />
                            </div>
                             <div>
                                <h3 className="font-mono text-cyan-400 mb-2">requirements.txt</h3>
                                <CodeBlock code={requirementsContent.trim()} language="text" />
                            </div>
                             <div>
                                <h3 className="font-mono text-cyan-400 mb-2">docs/feedback.md</h3>
                                <CodeBlock code={feedbackMdContent.trim()} language="markdown" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <SunoAnalysis currentPhase={6} />
            <LyricsGenCode />
            <MusicGenCode />
            <VocalsGenCode />
            <PipelineCode />
            <StemsCode />
            <ApiCode />
            <FinalPhaseCode />
            <DeploymentSection />
        </main>
      </div>
    </div>
  );
};

export default App;
