
import React from 'react';
import { CodeBlock } from './CodeBlock';

const musicGenPyCode = `
import torch
import torchaudio
import time
import os
from src.lyrics_gen import parse_prompt

def generate_instrumental(description: str, duration: int = 15, sample_rate: int = 44100) -> str:
    """
    Generates a simple instrumental WAV file based on a prompt.
    
    This implementation uses basic waveform synthesis and relies on 'parse_prompt'
    to extract genre and mood for conditioning the audio output.
    
    Args:
        description: A string prompt, e.g., "upbeat jazz song about city life".
        duration: The length of the audio in seconds.
        sample_rate: The sample rate for the output audio.
        
    Returns:
        The file path to the generated .wav file.
        
    Raises:
        RuntimeError: If instrumental generation fails.
    """
    try:
        genre, mood, _ = parse_prompt(description)
        
        # Time tensor for waveform generation
        t = torch.linspace(0., duration, steps=int(duration * sample_rate))
        
        # --- Simple waveform synthesis based on genre/mood ---
        freq = 440.0 if mood.lower() == "upbeat" else 220.0
        
        if genre.lower() == "jazz":
            # Add a simple harmonic (a fifth) for a 'jazzy' feel
            waveform = torch.sin(2 * torch.pi * freq * t) + 0.5 * torch.sin(2 * torch.pi * (freq * 1.5) * t)
        else:
            # Default is a simple sine wave
            waveform = torch.sin(2 * torch.pi * freq * t)
            
        # --- Post-Processing ---
        # Normalize to prevent clipping, ensuring a max amplitude of 0.8
        if torch.max(torch.abs(waveform)) > 0:
            waveform = waveform / torch.max(torch.abs(waveform)) * 0.8
        
        # Ensure waveform is 2D (Channels, Time) for saving
        if waveform.dim() == 1:
            waveform = waveform.unsqueeze(0)
            
        # --- Save File ---
        output_dir = "data/outputs/instrumentals"
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(output_dir, f"instrumental_{timestamp}.wav")
        
        torchaudio.save(output_path, waveform, sample_rate)
        
        return output_path
        
    except ValueError as ve:
        # Propagate prompt parsing errors
        raise ve
    except Exception as e:
        raise RuntimeError(f"Instrumental generation error: {e}")

# Example for direct execution
if __name__ == "__main__":
    test_prompt = "upbeat jazz song about city life"
    try:
        filepath = generate_instrumental(test_prompt)
        print("--- Generated Instrumental ---")
        print(f"Audio saved to: {filepath}")
    except (ValueError, RuntimeError) as e:
        print(f"Error: {e}")
`;

const testMusicPyCode = `
import pytest
import os
import torchaudio
from src.music_gen import generate_instrumental

def test_instrumental_generation_and_playback():
    """
    Tests that an instrumental can be generated from a valid prompt,
    saved, and reloaded correctly. This is an integration test.
    """
    # Use a prompt that matches the format expected by 'parse_prompt'
    description = "upbeat jazz song about testing"
    filepath = None
    try:
        # 1. Generate the instrumental file
        filepath = generate_instrumental(description, duration=2)
        
        # 2. Verify the file was created
        assert os.path.exists(filepath), "Instrumental file was not created."
        
        # 3. Verify the file can be loaded as audio
        waveform, sample_rate = torchaudio.load(filepath)
        
        # 4. Check that the loaded audio is not empty and has correct shape
        assert waveform.numel() > 0, "Generated waveform is empty."
        assert sample_rate == 44100, "Sample rate does not match."
        assert waveform.dim() == 2, "Waveform should have 2 dimensions (channels, time)."

    finally:
        # 5. Clean up the generated file
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

def test_instrumental_generation_invalid_prompt():
    """
    Tests that 'generate_instrumental' raises a ValueError when given
    a prompt that 'parse_prompt' cannot handle.
    """
    with pytest.raises(ValueError, match="Invalid prompt format"):
        generate_instrumental("this is not a valid prompt")
`;

export const MusicGenCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 2: Music Generation Module
            </h2>
            <p className="text-sm text-slate-400">
                Implementation of instrumental generation using prompt-driven waveform synthesis.
            </p>
        </div>
        <div className="bg-cyan-800/70 text-cyan-200 text-sm font-bold px-3 py-1 rounded-full">
            COMPLETE
        </div>
      </div>
      

      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">src/music_gen.py</h3>
          <CodeBlock code={musicGenPyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">tests/test_music.py</h3>
          <CodeBlock code={testMusicPyCode.trim()} language="python" />
        </div>
      </div>
    </section>
  );
};
