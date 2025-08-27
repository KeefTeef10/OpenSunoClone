
import React from 'react';
import { CodeBlock } from './CodeBlock';

const vocalsGenPyCode = `
import torch
import torchaudio
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import os
import time

# --- Model and Processor Initialization (loaded once for efficiency) ---
try:
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {DEVICE}")

    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(DEVICE)
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(DEVICE)
    
    # Load default speaker embeddings
    embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
    speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0).to(DEVICE)
except Exception as e:
    print(f"Warning: Could not load SpeechT5 models. Vocal generation will fail. Error: {e}")
    processor, model, vocoder, speaker_embeddings = None, None, None, None

def add_vocals(lyrics: str, instrumental_path: str) -> str:
    """
    Synthesizes vocals from lyrics, mixes them with an instrumental, and saves the output.
    
    Args:
        lyrics: The text lyrics to be synthesized into speech.
        instrumental_path: The file path to the instrumental .wav file.
        
    Returns:
        The file path to the final mixed .wav file.
        
    Raises:
        RuntimeError: If vocal synthesis or mixing fails.
        ValueError: If inputs are invalid (e.g., empty lyrics).
        FileNotFoundError: If the instrumental file does not exist.
    """
    if not all([processor, model, vocoder, speaker_embeddings]):
        raise RuntimeError("SpeechT5 models are not loaded. Cannot generate vocals.")
        
    if not lyrics.strip():
        raise ValueError("Input lyrics cannot be empty.")
        
    if not os.path.exists(instrumental_path):
        raise FileNotFoundError(f"Instrumental file not found at: {instrumental_path}")

    try:
        # 1. Synthesize Vocals
        inputs = processor(text=lyrics, return_tensors="pt").to(DEVICE)
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
        
        # Vocals are at 16kHz. Resample to a standard music rate (44.1kHz).
        TARGET_SR = 44100
        resampler = torchaudio.transforms.Resample(orig_freq=16000, new_freq=TARGET_SR)
        vocals_waveform = resampler(speech.cpu().unsqueeze(0))

        # 2. Load Instrumental
        instrumental_waveform, sr = torchaudio.load(instrumental_path)
        if sr != TARGET_SR:
            # Ensure instrumental is at the target sample rate
            instrumental_resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=TARGET_SR)
            instrumental_waveform = instrumental_resampler(instrumental_waveform)

        # 3. Align and Mix Audio by padding the shorter track
        len_vox = vocals_waveform.shape[1]
        len_inst = instrumental_waveform.shape[1]
        
        if len_vox > len_inst:
            padding = torch.zeros((instrumental_waveform.shape[0], len_vox - len_inst))
            instrumental_waveform = torch.cat([instrumental_waveform, padding], dim=1)
        else:
            padding = torch.zeros((vocals_waveform.shape[0], len_inst - len_vox))
            vocals_waveform = torch.cat([vocals_waveform, padding], dim=1)

        # Normalize volumes before mixing to prevent clipping, using a 60/40 vocal/instrumental ratio
        vocals_waveform = (vocals_waveform / torch.max(torch.abs(vocals_waveform))) * 0.6
        instrumental_waveform = (instrumental_waveform / torch.max(torch.abs(instrumental_waveform))) * 0.4
        
        mixed_waveform = vocals_waveform + instrumental_waveform
        
        # Final normalization to ensure the mixed track does not clip
        mixed_waveform = (mixed_waveform / torch.max(torch.abs(mixed_waveform))) * 0.9

        # 4. Save Output
        output_dir = "data/outputs/mixed"
        os.makedirs(output_dir, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(output_dir, f"mixed_{timestamp}.wav")
        
        torchaudio.save(output_path, mixed_waveform, TARGET_SR)
        
        return output_path
        
    except Exception as e:
        raise RuntimeError(f"Vocal synthesis and mixing failed: {e}")

# Example for direct execution
if __name__ == "__main__":
    from src.music_gen import generate_instrumental
    
    test_lyrics = "Testing the new vocal mixing logic."
    print("Generating a test instrumental...")
    try:
        instrumental_file = generate_instrumental("upbeat pop song about testing", duration=5)
        print(f"Instrumental created: {instrumental_file}")
        
        print("Adding vocals...")
        mixed_file = add_vocals(test_lyrics, instrumental_file)
        print(f"--- Mixed Audio Generated ---")
        print(f"Final audio saved to: {mixed_file}")
    except (ValueError, RuntimeError, FileNotFoundError) as e:
        print(f"Error: {e}")
`;

const testVocalsPyCode = `
import pytest
import os
import torch
import torchaudio
from src.vocals_gen import add_vocals

@pytest.fixture(scope="module")
def dummy_instrumental():
    """
    Creates a temporary dummy instrumental .wav file for testing.
    This fixture has a 'module' scope, so it runs once per test module.
    """
    sample_rate = 44100
    duration = 5
    freq = 440
    t = torch.linspace(0., duration, steps=int(duration * sample_rate))
    waveform = torch.sin(2 * torch.pi * freq * t).unsqueeze(0)
    
    filepath = "dummy_instrumental_for_test.wav"
    torchaudio.save(filepath, waveform, sample_rate)
    
    yield filepath  # Provide the filepath to the tests
    
    # Teardown: clean up the file after all tests in the module are done
    if os.path.exists(filepath):
        os.remove(filepath)

def test_add_vocals_and_mixing(dummy_instrumental):
    """
    Integration test for adding vocals to an instrumental track.
    This test is slow as it involves loading large models.
    """
    lyrics = "This is a test of the vocal synthesis system."
    output_path = None
    try:
        # 1. Run the function
        output_path = add_vocals(lyrics, dummy_instrumental)
        
        # 2. Assert file creation
        assert os.path.exists(output_path)
        
        # 3. Assert file content is valid
        waveform, sr = torchaudio.load(output_path)
        assert sr == 44100
        assert waveform.numel() > 0
        
    finally:
        # 4. Clean up the generated mixed file
        if output_path and os.path.exists(output_path):
            os.remove(output_path)

def test_add_vocals_empty_lyrics(dummy_instrumental):
    """
    Tests that the function raises a ValueError for empty or whitespace lyrics.
    """
    with pytest.raises(ValueError, match="Input lyrics cannot be empty"):
        add_vocals("   ", dummy_instrumental)

def test_add_vocals_missing_instrumental():
    """
    Tests that the function raises a FileNotFoundError for a non-existent instrumental.
    """
    with pytest.raises(FileNotFoundError):
        add_vocals("Some lyrics", "non_existent_file.wav")
`;

export const VocalsGenCode: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
      <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
        <div>
           <h2 className="text-2xl font-semibold text-white">
            Phase 2: Vocals Generation Module
            </h2>
            <p className="text-sm text-slate-400">
                Implementation of vocal synthesis and audio mixing.
            </p>
        </div>
        <div className="bg-cyan-800/70 text-cyan-200 text-sm font-bold px-3 py-1 rounded-full">
            COMPLETE
        </div>
      </div>
      

      <div className="space-y-8">
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">src/vocals_gen.py</h3>
          <CodeBlock code={vocalsGenPyCode.trim()} language="python" />
        </div>
        <div>
          <h3 className="font-mono text-cyan-400 mb-2 text-lg">tests/test_vocals.py</h3>
          <CodeBlock code={testVocalsPyCode.trim()} language="python" />
        </div>
      </div>
    </section>
  );
};
