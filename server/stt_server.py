from __future__ import annotations

import io
import json
import os
import wave
from typing import Optional

from flask import Flask, jsonify, request

try:
    from vosk import Model, KaldiRecognizer
except ImportError:  # pragma: no cover
    Model = None
    KaldiRecognizer = None

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "vosk-model-el-gr")

MODEL = None
if Model is not None and os.path.isdir(MODEL_PATH):
    try:
        MODEL = Model(MODEL_PATH)
    except Exception as exc:  # pragma: no cover
        print(f"Unable to load Vosk model: {exc}")
        MODEL = None


@app.get("/healthz")
def healthz():
    return jsonify({
        "ok": True,
        "model_ready": MODEL is not None,
        "model_path": MODEL_PATH,
        "service": "pic-duel-stt"
    })


@app.post("/api/stt")
def api_stt():
    demo_text = request.form.get("demo_text") or request.args.get("demo_text") or request.get_json(silent=True, force=True).get("demo_text") if request.is_json else None
    if MODEL is None:
        if demo_text:
            return jsonify({"ok": True, "transcript": demo_text})
        return jsonify({
            "ok": False,
            "error": "Model not loaded",
            "message": "Download a Vosk Greek model into server/models/vosk-model-el-gr and restart the server."
        }), 503

    audio_file = request.files.get("audio")
    if audio_file is None:
        return jsonify({"ok": False, "error": "Missing audio file"}), 400

    try:
        wav_bytes = audio_file.read()
        if not wav_bytes:
            return jsonify({"ok": False, "error": "Empty audio file"}), 400

        wav_io = io.BytesIO(wav_bytes)
        with wave.open(wav_io, "rb") as wf:
            if wf.getnchannels() != 1:
                return jsonify({"ok": False, "error": "Expected mono WAV audio"}), 400
            if wf.getsampwidth() != 2:
                return jsonify({"ok": False, "error": "Expected 16-bit WAV audio"}), 400
            if wf.getframerate() < 8000:
                return jsonify({"ok": False, "error": "Audio sample rate too low"}), 400

            recognizer = KaldiRecognizer(MODEL, wf.getframerate())
            recognizer.SetWords(True)

            while True:
                data = wf.readframes(4000)
                if not data:
                    break
                recognizer.AcceptWaveform(data)

            result = json.loads(recognizer.FinalResult())
            transcript = (result.get("text") or "").strip()

        return jsonify({
            "ok": True,
            "transcript": transcript,
            "debug": result
        })

    except Exception as exc:  # pragma: no cover
        return jsonify({
            "ok": False,
            "error": "STT failed",
            "message": str(exc)
        }), 500


@app.post("/api/mock-transcript")
def api_mock_transcript():
    payload = request.get_json(force=True, silent=True) or {}
    text = str(payload.get("text") or "").strip()
    if not text:
        raw = request.get_data(as_text=True)
        try:
            payload = json.loads(raw) if raw else {}
            text = str(payload.get("text") or "").strip()
        except Exception:
            text = ""
    if not text:
        return jsonify({"ok": False, "error": "Missing text"}), 400
    return jsonify({"ok": True, "transcript": text})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
