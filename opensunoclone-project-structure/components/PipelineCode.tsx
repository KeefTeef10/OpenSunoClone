
import React from 'react';
import { CodeBlock } from './CodeBlock';

const pipelinePyCode = `
import torch
import torchaudio
import os
import time

# Import individual modules
from src.lyrics_gen import generate_lyrics
from src.music_gen import generate_instrumental
from src.vocals_gen import add_vocals
from src.stems import extract_stems

def create_song(prompt: str, duration: int = 60, weirdness: int = 0, output_format: str = 'wav') -> dict:
    """
    Orchestrates the end-to-end song generation process.
    
    This function sequences the lyrics, music, and vocal generation modules
    to produce a complete song from a single text prompt.
    
    Args:
        prompt: The creative prompt for the song (e.g., "upbeat pop about lost love").
        duration: The target duration of the song in seconds.
        weirdness: An integer (0-100) to vary the random seed for creative output.
        output_format: The desired output audio format (e.g., 'wav', 'mp3').
        
    Returns:
        A dictionary containing the path to the final song and its stems.
        
    Raises:
        RuntimeError: If any stage of the song generation process fails.
    """
    print("--- Starting Song Generation Pipeline ---")
    try:
        # --- 0. Set Random Seed for 'Weirdness' ---
        # Add a base seed for reproducibility and vary it with 'weirdness'
        seed = 42 + weirdness
        torch.manual_seed(seed)
        print(f"Using random seed: {seed}")

        # --- 1. Generate Lyrics ---
        print(f"[1/4] Generating lyrics for prompt: '{prompt}'...")
        lyrics = generate_lyrics(prompt, max_length=int(duration * 7))
        print("Lyrics generated successfully.")

        # --- 2. Generate Instrumental ---
        print(f"[2/4] Generating instrumental...")
        instrumental_path = generate_instrumental(prompt, duration=duration)
        print(f"Instrumental saved to: {instrumental_path}")

        # --- 3. Add Vocals and Mix ---
        print(f"[3/4] Synthesizing vocals and mixing track...")
        mixed_path = add_vocals(lyrics, instrumental_path)
        print(f"Vocals mixed successfully.")
        
        # --- 4. Final Polish, Save, and Extract Stems ---
        print("[4/4] Applying final touches and extracting stems...")
        waveform, sr = torchaudio.load(mixed_path)
        
        fade_out = torchaudio.functional.fade(waveform, fade_in_len=0, fade_out_len=sr * 2, fade_shape='linear')

        final_dir = "data/outputs"
        os.makedirs(final_dir, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        final_path = os.path.join(final_dir, f"song_{timestamp}.{output_format}")
        
        torchaudio.save(final_path, fade_out, sr)
        print(f"Final song saved to: {final_path}")
        
        stems = extract_stems(final_path)
        print("Stems extracted successfully.")
        
        print(f"--- Pipeline Complete ---")
        
        return {
            'song_path': final_path,
            'stems': stems
        }

    except (ValueError, FileNotFoundError, RuntimeError) as e:
        print(f"PIPELINE FAILED: {e}")
        raise RuntimeError(f"Create song error: {e}") from e

# Example for direct execution
if __name__ == "__main__":
    test_prompt = "upbeat pop about lost love"
    try:
        create_song(test_prompt, duration=15, weirdness=10)
    except RuntimeError as e:
        print(e)
`;

const testPipelinePyCode = `
import pytest
import os
import shutil
from unittest.mock import patch, MagicMock
from src.pipeline import create_song

# This is a unit test that mocks the expensive AI calls.
# It verifies that the pipeline correctly calls each module in sequence
# and handles the file paths correctly.

@patch('torch.manual_seed')
@patch('src.pipeline.generate_lyrics')
@patch('src.pipeline.generate_instrumental')
@patch('src.pipeline.add_vocals')
@patch('src.pipeline.extract_stems')
@patch('torchaudio.load')
@patch('torchaudio.save')
def test_pipeline_orchestration(
    mock_save, mock_load, mock_extract_stems, mock_add_vocals, mock_generate_instrumental, mock_generate_lyrics, mock_manual_seed
):
    """
    Tests the pipeline's orchestration logic without running the actual models.
    """
    # --- Setup Mocks ---
    mock_generate_lyrics.return_value = "Mocked lyrics."
    mock_generate_instrumental.return_value = "/mock/instrumental.wav"
    mock_add_vocals.return_value = "/mock/mixed.wav"
    mock_extract_stems.return_value = {
        'lows': '/mock/stems/lows.wav',
        'highs': '/mock/stems/highs.wav'
    }
    
    # Mock the waveform and its fade method
    mock_waveform = MagicMock()
    mock_fade_waveform = MagicMock()
    mock_waveform.fade.return_value = mock_fade_waveform
    mock_load.return_value = (mock_waveform, 44100)
    
    # --- Execute ---
    prompt = "upbeat pop song about testing"
    result = create_song(prompt, duration=10, weirdness=5, output_format='wav')
    
    # --- Assertions ---
    mock_manual_seed.assert_called_once_with(42 + 5)
    mock_generate_lyrics.assert_called_once_with(prompt, max_length=70)
    mock_generate_instrumental.assert_called_once_with(prompt, duration=10)
    mock_add_vocals.assert_called_once_with("Mocked lyrics.", "/mock/instrumental.wav")
    mock_load.assert_called_once_with("/mock/mixed.wav")
    mock_save.assert_called_once()
    mock_extract_stems.assert_called_once_with(mock_save.call_args[0][0]) # Check it's called with the final path
    
    assert 'song_path' in result
    assert result['song_path'].startswith("data/outputs/song_")
    assert result['stems']['lows'] == '/mock/stems/lows.wav'

@patch('src.pipeline.generate_lyrics', side_effect=RuntimeError("Model download failed"))
def test_pipeline_handles_lyrics_failure(mock_generate_lyrics):
    """Tests that the pipeline gracefully fails if a sub-module raises an error."""
    with pytest.raises(RuntimeError, match="Create song error: Model download failed"):
        create_song("any prompt")


# To run full integration test: pytest -m full_integration
@pytest.mark.full_integration
def test_full_pipeline_execution():
    """
    A full end-to-end integration test.
    WARNING: This test is extremely slow, downloads models, and uses significant resources.
    It should be run manually or on a dedicated CI runner.
    """
    prompt = "sad rock song about a broken computer"
    result = None
    created_files = []
    try:
        result = create_song(prompt, duration=5, weirdness=1)
        
        # Verify song path
        song_path = result['song_path']
        created_files.append(song_path)
        assert os.path.exists(song_path)
        
        # Verify stems
        assert 'lows' in result['stems']
        lows_path = result['stems']['lows']
        created_files.append(lows_path)
        assert os.path.exists(lows_path)
        
    finally:
        # Comprehensive cleanup
        for path in created_files:
            if os.path.exists(path):
                os.remove(path)
        # Clean up directories that might have been created by other modules
        if os.path.exists('data/outputs/instrumentals'):
             shutil.rmtree('data/outputs/instrumentals')
        if os.path.exists('data/outputs/lyrics'):
             shutil.rmtree('data/outputs/lyrics')
        if os.path.exists('data/outputs/mixed'):
             shutil.rmtree('data/outputs/mixed')
`;

export const PipelineCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 3: Integration Pipeline
            </h2>
            <p className="text-sm text-slate-400">
                The main script that orchestrates the end-to-end song generation process.
            </p>
        </div>
        <div className="bg-cyan-800/70 text-cyan-200 text-sm font-bold px-3 py-1 rounded-full">
            UPDATED
        </div>
      </div>
      

      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">src/pipeline.py</h3>
          <CodeBlock code={pipelinePyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">tests/test_pipeline.py</h3>
          <CodeBlock code={testPipelinePyCode.trim()} language="python" />
        </div>
      </div>
    </section>
  );
};
