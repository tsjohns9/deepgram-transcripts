const fs = require('fs');
const { createClient } = require('@deepgram/sdk');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const findAndReplace = require('./findAndReplace');

const outDir = 'outputs';
if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir);
}

const deepgram = createClient(process.env.DEEPGRAM_KEY);
const options = {
	smart_format: true,
	punctuate: true,
	paragraphs: true,
	utterances: true,
	language: 'en',
	model: 'nova-2',
};

module.exports = async function generateTranscript(videoId, updateTranscript) {
	try {
		const videoInfo = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
			dumpSingleJson: true,
		});
		console.log('videoInfo.title: ', videoInfo.title);
		const videoTitle = videoInfo.title.replace(/ /g, '_');
		const wavFile = path.join(outDir, `${videoTitle}.wav`);
		console.log('wavFile: ', wavFile);

		await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
			audioFormat: 'wav',
			extractAudio: true,
			output: wavFile,
		});

		console.log(`downloaded ${wavFile}`);

		const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
			fs.createReadStream(wavFile),
			options
		);
		if (error) {
			throw error;
		}

		const content = result.results.channels[0].alternatives[0].paragraphs.transcript;
		const originalTranscriptFile = `${outDir}/${videoTitle}-original.txt`;
		console.log('originalTranscriptFile: ', originalTranscriptFile);
		const transcriptFile = `${outDir}/${videoTitle}.txt`;
		console.log('transcriptFile: ', transcriptFile);

		fs.writeFileSync(transcriptFile, content);
		if (updateTranscript) {
			console.log('running findAndReplace');
			findAndReplace(transcriptFile);
			fs.copyFileSync(transcriptFile, originalTranscriptFile);
		}

		console.log(`saved transcript to ${videoTitle}.txt`);
		return {
			videoTitle: videoInfo.title,
			transcriptFile,
			originalTranscriptFile,
		};
	} catch (error) {
		console.error('transcript.js', error.message);
	}
};