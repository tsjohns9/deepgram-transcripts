import argparse
import os
import sys

import yt_dlp
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    FileSource,
    PrerecordedOptions,
)
from dotenv import load_dotenv

load_dotenv()


def download_yt_audio(video_id, output_path):
    ydl_opts = {
        "format": "bestaudio/best",
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ],
        "extractaudio": True,
        "audioformat": "wav",
        "outtmpl": f"{output_path}.%(ext)s",
        "verbose": True,
    }
    url = f"https://www.youtube.com/watch?v={video_id}"
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


def main(deepgram_key, video_id):
    out_dir = "outputs"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    config = DeepgramClientOptions()
    deepgram = DeepgramClient(deepgram_key, config)

    options = PrerecordedOptions(
        language="en",
        model="nova-2",
        paragraphs=True,
        punctuate=True,
        smart_format=True,
        utterances=True,
    )

    output_file = os.path.join(out_dir, f"{video_id}")
    download_yt_audio(video_id, output_file)

    with open(f"{output_file}.webm", "rb") as file:
        buffer_data = file.read()

    print("downloading transcript")
    payload: FileSource = {"buffer": buffer_data, "mimetype": "audio/wav"}
    response = deepgram.listen.prerecorded.v("1").transcribe_file(
        payload, options, timeout=1200
    )
    content = response["results"]["channels"][0]["alternatives"][0]["paragraphs"][
        "transcript"
    ]

    transcript_file = f"{output_file}.txt"

    with open(transcript_file, "w") as f:
        f.write(content)

    print(f"Saved transcript to {transcript_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YouTube video transcription tool")
    parser.add_argument("--video_id", required=True, help="The YouTube video ID")
    args = parser.parse_args()

    deepgram_key = os.getenv("DEEPGRAM_KEY")
    if not deepgram_key:
        raise Exception("DEEPGRAM_KEY not found in environment variables")

    try:
        main(deepgram_key, args.video_id)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
