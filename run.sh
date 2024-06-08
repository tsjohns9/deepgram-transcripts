# 1. Change VIDEO_ID to use new video
# 2. Download .wav file. File will be named $VIDEO_ID.wav
# 3. Get transcribed text. File will be $VIDEO_ID.txt
export API_KEY="KEY"
export VIDEO_ID="V3YYnMT4ouE"
export FILE_NAME="samson-9"

# This command takes about 20 minutes
youtube-dl $VIDEO_ID --extract-audio --audio-format wav -o $FILE_NAME.wav

curl https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&paragraphs=true&utterances=true&language=en&model=nova-2 \
    -H "Authorization: Token $API_KEY" \
    -H "Content-Type: audio/wav" \
    --data-binary @${FILE_NAME}.wav > "$FILE_NAME.json"

jq -r '.results.channels[0].alternatives[0].paragraphs.transcript' $FILE_NAME.json > $FILE_NAME.txt

cp $FILE_NAME.txt $FILE_NAME-original.txt

sed -i "" "s/const filename = '[^']*';/const filename = '${FILE_NAME}.txt';/" "findAndReplace.js"

node ./findAndReplace.js

# | jq '.results.channels[0].alternatives[0].transcript' > "$FILE_NAME.txt"
# | jq '.results.channels[0].alternatives[0].paragraphs.transcript' > "$FILE_NAME.txt"
