"""
transcribe-audio.py  v3 — sans ffmpeg système (utilise imageio_ffmpeg)
═══════════════════════════════════════════════════════════════════════
Transcrit les pistes 61–69 avec Whisper.

Pas besoin d'avoir ffmpeg dans le PATH Windows :
  imageio_ffmpeg embarque son propre binaire ffmpeg multi-plateforme.

Installation (une seule fois) :
  pip install openai-whisper imageio-ffmpeg

Usage :
  cd ~/Desktop/Site_pro/codeexp/apps/api
  python transcribe-audio.py

Résultat → apps/api/transcriptions-61-69.json
═══════════════════════════════════════════════════════════════════════
"""

import json, sys, warnings, subprocess, tempfile, os
from pathlib import Path

warnings.filterwarnings("ignore")

AUDIO_DIR  = Path(__file__).parent / "audio-tiptop2"
OUTPUT     = Path(__file__).parent / "transcriptions-61-69.json"
TRACKS     = list(range(61, 70))
WHISPER_SR = 16000   # fréquence attendue par Whisper

# ── Imports ──────────────────────────────────────────────────────────

try:
    import whisper
except ImportError:
    print("❌  Whisper manquant. Installez-le :")
    print("    pip install openai-whisper imageio-ffmpeg")
    sys.exit(1)

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"✅  imageio_ffmpeg trouvé → {FFMPEG_EXE}")
    USE_IMAGEIO = True
except ImportError:
    USE_IMAGEIO = False
    print("⚠️  imageio_ffmpeg non disponible → essai avec torchaudio puis ffmpeg système")

try:
    import torch
    import torchaudio
    import torchaudio.functional as F_audio
    USE_TORCHAUDIO = True
    print("✅  torchaudio disponible")
except ImportError:
    USE_TORCHAUDIO = False

import numpy as np


# ── Chargement audio ─────────────────────────────────────────────────

def load_via_imageio_ffmpeg(path: str) -> np.ndarray:
    """
    Utilise le binaire ffmpeg embarqué par imageio_ffmpeg.
    Aucune dépendance système requise (fonctionne sur Windows sans ffmpeg dans PATH).
    """
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", path,
        "-f", "f32le",
        "-acodec", "pcm_f32le",
        "-ar", str(WHISPER_SR),
        "-ac", "1",
        "-"                      # sortie sur stdout
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if result.returncode != 0 or len(result.stdout) == 0:
        raise RuntimeError(f"imageio_ffmpeg n'a pas pu décoder : {path}")
    return np.frombuffer(result.stdout, dtype=np.float32)


def load_via_torchaudio(path: str) -> np.ndarray:
    """Fallback : torchaudio (nécessite un backend MP3 sur Windows)."""
    waveform, sr = torchaudio.load(path)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    if sr != WHISPER_SR:
        waveform = F_audio.resample(waveform, sr, WHISPER_SR)
    return waveform.squeeze().numpy().astype(np.float32)


def load_via_ffmpeg_wav(path: str) -> np.ndarray:
    """
    Fallback final : convertit en WAV temporaire via ffmpeg système,
    puis charge avec le module wave de la bibliothèque standard Python.
    """
    import wave
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", path,
             "-ar", str(WHISPER_SR), "-ac", "1", tmp_path],
            check=True, capture_output=True
        )
        with wave.open(tmp_path, "rb") as wf:
            raw = wf.readframes(wf.getnframes())
        return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def load_audio(path: str) -> np.ndarray:
    """Essaie les méthodes dans l'ordre : imageio_ffmpeg → torchaudio → ffmpeg système."""
    if USE_IMAGEIO:
        return load_via_imageio_ffmpeg(path)
    if USE_TORCHAUDIO:
        try:
            return load_via_torchaudio(path)
        except Exception as e:
            print(f"     ⚠️  torchaudio échoué ({e}), essai ffmpeg système…")
    return load_via_ffmpeg_wav(path)


# ── Transcription ────────────────────────────────────────────────────

def transcribe_track(model, path: str) -> dict:
    """Transcrit un fichier audio et retourne texte + segments horodatés."""
    audio_array = load_audio(path)
    result = model.transcribe(audio_array, language="fr", verbose=False)
    text = result["text"].strip()
    segs = [
        {
            "start": round(s["start"], 1),
            "end":   round(s["end"],   1),
            "text":  s["text"].strip(),
        }
        for s in result.get("segments", [])
    ]
    return {"text": text, "segments": segs}


# ── Programme principal ───────────────────────────────────────────────

def main():
    print("\n🔊 Chargement du modèle Whisper 'small'…")
    model = whisper.load_model("small")
    print("✅  Modèle chargé.\n")

    results = {}

    for n in TRACKS:
        # Cherche le fichier MP3 de la piste (plusieurs nommages possibles)
        candidates = (
            list(AUDIO_DIR.glob(f"{n} *.mp3")) +
            list(AUDIO_DIR.glob(f"{n}.mp3"))   +
            list(AUDIO_DIR.glob(f"{n}*.mp3"))
        )
        if not candidates:
            print(f"  ⚠️  Piste {n} introuvable dans {AUDIO_DIR}")
            results[str(n)] = {"error": "fichier introuvable"}
            continue

        path = str(candidates[0])
        print(f"  🎧 Piste {n} : {candidates[0].name}")

        try:
            data = transcribe_track(model, path)
            results[str(n)] = data
            preview = data["text"][:200] + ("…" if len(data["text"]) > 200 else "")
            print(f"     → {preview}\n")
        except Exception as e:
            import traceback
            print(f"  ❌ Erreur piste {n} : {e}")
            traceback.print_exc()
            results[str(n)] = {"error": str(e)}

    # Sauvegarde JSON
    OUTPUT.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\n✅  Transcriptions sauvegardées → {OUTPUT}")
    print("   📋 Copiez-collez le contenu de ce fichier dans le chat Claude.")

    # Résumé
    print("\n─── Résumé ───")
    for n in TRACKS:
        r = results.get(str(n), {})
        if "error" in r:
            print(f"  Piste {n} : ❌ {r['error']}")
        else:
            words = len(r.get("text", "").split())
            print(f"  Piste {n} : ✅ {words} mots transcrits")


if __name__ == "__main__":
    main()
