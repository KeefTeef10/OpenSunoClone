
import React from 'react';

interface SunoAnalysisProps {
  currentPhase: number;
}

export const SunoAnalysis: React.FC<SunoAnalysisProps> = ({ currentPhase }) => {
    const phases = [
        { number: 1, text: "Project Setup & Initialization." },
        { number: 2, text: "Core Logic Development (Lyrics, Music, Vocals)." },
        { number: 3, text: "Integration & Pipeline Construction." },
        { number: 4, text: "API & Application Layer (Flask)." },
        { number: 5, text: "Advanced Features (Stems & Control)." },
        { number: 6, text: "Final Testing & Deployment." },
    ];
    
    return (
        <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-1 text-white border-b border-slate-600 pb-2">
                Project Build Plan: OpenSunoClone
            </h2>
            <p className="text-sm text-slate-500 mb-4">A step-by-step guide to building a text-to-music generator.</p>

            <div className="space-y-6 text-slate-300">
                <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-slate-400">
                    As an expert in Python AI projects, I want to build an application called OpenSunoClone, a text-to-music generator mimicking Suno AI’s functionality, which transforms text prompts into songs with lyrics, vocals, and instrumentals.
                </blockquote>

                <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">Core Objective</h3>
                    <p>
                        The project must use only pre-installed libraries (torch, transformers, torchaudio, flask, pytest) in a standard Python 3.12 environment, ensuring production-level reliability with executable, tested code and no placeholder data. It will be tested using real-time user prompts (e.g., "energetic rock song about adventure").
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">Development & Deployment Ecosystem</h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><span className="font-semibold text-white">Version Control:</span> GitHub</li>
                        <li><span className="font-semibold text-white">Demo Landing Page:</span> Carrd.co</li>
                        <li><span className="font-semibold text-white">AI Code Optimization:</span> Lovable.dev</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">Build Process via Sequential Prompting</h3>
                    <p>
                        The build process is designed to be executed as a sequence of self-contained phases using a conversational AI model (like in Google AI Studio). Each prompt corresponds to a specific development stage, from setup to deployment.
                    </p>
                    <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-semibold text-white mb-2">Process Flow:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                           {phases.map(phase => {
                                const isActive = phase.number === currentPhase && currentPhase <= phases.length;
                                const isComplete = phase.number < currentPhase;
                                let phaseClasses = '';
                                if (isActive) {
                                    phaseClasses = 'font-bold text-cyan-300';
                                } else if (isComplete) {
                                    phaseClasses = 'text-slate-400 line-through';
                                }
                                
                                // Special case for when all phases are complete
                                const allDone = currentPhase > phases.length;
                                if (allDone) {
                                    phaseClasses = 'text-slate-400 line-through';
                                }

                                return (
                                  <li key={phase.number} className={phaseClasses}>
                                    <span className={`font-mono px-2 py-1 rounded text-sm ${isActive ? 'bg-cyan-800/70 text-cyan-200' : (isComplete || allDone) ? 'bg-slate-700/50' : 'bg-slate-700'}`}>
                                      Prompt {phase.number}:
                                    </span>
                                    <span className="ml-2">{phase.text}</span>
                                  </li>
                                );
                            })}
                        </ol>
                         <p className="mt-3 text-sm text-slate-400">
                           After each phase is completed, the user would present the next prompt in the sequence to continue the build. This ensures a modular, verifiable, and iterative development cycle.
                        </p>
                    </div>
                </div>

                 <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">Continuous Improvement</h3>
                    <p>
                        The project emphasizes a robust feedback loop for continuous improvement, with dedicated documentation (`feedback.md`) and scripts (`collect_feedback.py`) to gather and integrate user feedback.
                    </p>
                </div>
            </div>
        </section>
    );
};
