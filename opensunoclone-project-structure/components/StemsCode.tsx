
import React from 'react';
import { CodeBlock } from './CodeBlock';

const stemsPyCode = `
import torch
import torchaudio
import os
import time

def extract_stems(song_path: str, num_components: int = 2) -> dict[str, str]:
    """
    Extracts basic audio stems (lows and highs) from a song file.

    This is a corrected and functional version based on the user's provided logic,
    using simple frequency filtering to separate the audio into two components.

    Args:
        song_path: The file path to the input song (.wav).
        num_components: The number of components to extract (currently supports 2).

    Returns:
        A dictionary mapping stem names to their file paths.
        e.g., {'lows': 'path/to/lows.wav', 'highs': 'path/to/highs.wav'}

    Raises:
        FileNotFoundError: If the input song file does not exist.
        RuntimeError: For other processing errors.
    """
    if not os.path.exists(song_path):
        raise FileNotFoundError(f"Song file not found at: {song_path}")

    try:
        waveform, sample_rate = torchaudio.load(song_path)

        # Prevent processing of extremely short audio clips
        if waveform.shape[-1] < 2:
            raise ValueError("Audio waveform is too short to process for stems.")

        # Define filter parameters for separation
        cutoff_freq = 300  # A common frequency to separate bass/drums from vocals/synths

        # High-pass filter for 'highs' stem (vocals, cymbals)
        highs_waveform = torchaudio.functional.highpass_biquad(
            waveform, sample_rate, cutoff_freq=cutoff_freq
        )

        # Low-pass filter for 'lows' stem (bass, drums)
        lows_waveform = torchaudio.functional.lowpass_biquad(
            waveform, sample_rate, cutoff_freq=cutoff_freq
        )
        
        # --- Save Stems ---
        output_dir = os.path.join("data", "outputs", "stems")
        os.makedirs(output_dir, exist_ok=True)
        
        base_name = os.path.splitext(os.path.basename(song_path))[0]
        
        stems_paths = {}

        # Save the 'highs' stem
        highs_path = os.path.join(output_dir, f"{base_name}_highs.wav")
        torchaudio.save(highs_path, highs_waveform, sample_rate)
        stems_paths['highs'] = highs_path
        
        # Save the 'lows' stem
        lows_path = os.path.join(output_dir, f"{base_name}_lows.wav")
        torchaudio.save(lows_path, lows_waveform, sample_rate)
        stems_paths['lows'] = lows_path
        
        return stems_paths

    except Exception as e:
        # Wrap original exception for better debugging
        raise RuntimeError(f"Stem extraction error: {e}") from e

# Example for direct execution
if __name__ == "__main__":
    print("This module is intended to be called by the main pipeline.")
`;

const testStemsPyCode = `
import pytest
import os
import torch
import torchaudio
from src.stems import extract_stems

@pytest.fixture(scope="module")
def dummy_song():
    """
    Creates a temporary dummy song file with mixed frequencies for testing.
    """
    sample_rate = 44100
    duration = 3
    t = torch.linspace(0., duration, steps=int(duration * sample_rate))
    
    # Mix a low frequency (100Hz) and a high frequency (1000Hz)
    low_freq_wave = torch.sin(2 * torch.pi * 100 * t)
    high_freq_wave = 0.5 * torch.sin(2 * torch.pi * 1000 * t)
    waveform = (low_freq_wave + high_freq_wave).unsqueeze(0)
    
    filepath = "dummy_song_for_stem_test.wav"
    torchaudio.save(filepath, waveform, sample_rate)
    
    yield filepath
    
    # Teardown
    if os.path.exists(filepath):
        os.remove(filepath)

def test_extract_stems(dummy_song):
    """
    Tests the stem extraction process.
    """
    stem_paths = {}
    try:
        # 1. Run the function
        stem_paths = extract_stems(dummy_song)
        
        # 2. Assert correct output structure
        assert isinstance(stem_paths, dict)
        assert 'lows' in stem_paths
        assert 'highs' in stem_paths
        
        # 3. Assert files were created
        lows_path = stem_paths['lows']
        highs_path = stem_paths['highs']
        assert os.path.exists(lows_path)
        assert os.path.exists(highs_path)
        
        # 4. Assert files contain valid audio data
        lows_waveform, _ = torchaudio.load(lows_path)
        highs_waveform, _ = torchaudio.load(highs_path)
        assert lows_waveform.numel() > 0
        assert highs_waveform.numel() > 0
        
    finally:
        # 5. Clean up generated stem files
        for path in stem_paths.values():
            if path and os.path.exists(path):
                os.remove(path)

def test_extract_stems_file_not_found():
    """
    Tests that the function raises FileNotFoundError for a non-existent song.
    """
    with pytest.raises(FileNotFoundError):
        extract_stems("non_existent_song.wav")
`;

export const StemsCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 5: Advanced Features (Stems)
            </h2>
            <p className="text-sm text-slate-400">
                Implementation of stem separation using audio filtering.
            </p>
        </div>
        <div className="bg-cyan-800/70 text-cyan-200 text-sm font-bold px-3 py-1 rounded-full">
            UPDATED
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">src/stems.py</h3>
          <CodeBlock code={stemsPyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">tests/test_stems.py</h3>
          <CodeBlock code={testStemsPyCode.trim()} language="python" />
        </div>
      </div>
    </section>
  );
};
