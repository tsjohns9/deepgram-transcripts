# 1. Change VIDEO_ID to use new video
# 2. Download .wav file. File will be named $VIDEO_ID.wav
# 3. Get transcribed text. File will be $VIDEO_ID.txt
export API_KEY=85b20971b3a90c8a2974e7d3ddbb655b19120950
export VIDEO_ID=9gkjcxlH7J8
export FILE_NAME="revelation-7"

# This command takes about 20 minutes
youtube-dl $VIDEO_ID --extract-audio --audio-format wav -o $FILE_NAME.wav

curl https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&paragraphs=true&utterances=true&language=en&model=nova-2 \
    -H "Authorization: Token $API_KEY" \
    -H "Content-Type: audio/wav" \
    --data-binary @${FILE_NAME}.wav > "$FILE_NAME.json"

jq -r '.results.channels[0].alternatives[0].paragraphs.transcript' $FILE_NAME.json > $FILE_NAME.txt

cp $FILE_NAME.txt $FILE_NAME-original.txt

# | jq '.results.channels[0].alternatives[0].transcript' > "$FILE_NAME.txt"
# | jq '.results.channels[0].alternatives[0].paragraphs.transcript' > "$FILE_NAME.txt"