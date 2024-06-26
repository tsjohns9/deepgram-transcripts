const fs = require('fs');
const { createClient } = require('@deepgram/sdk');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const findAndReplace = require('./findAndReplace');

const deepgram = createClient(process.env.DEEPGRAM_KEY);
const options = {
	language: 'en',
	model: 'nova-2',
	numerals: true,
	paragraphs: true,
	punctuate: true,
	smart_format: true,
	utterances: true,
};

module.exports = async function generateTranscript(videoUrl, videoId, updateTranscript) {
	try {
		const outDir = 'outputs';
		if (!fs.existsSync(outDir)) {
			fs.mkdirSync(outDir);
		}
		let video = videoUrl;
		if (videoId) {
			video = `https://www.youtube.com/watch?v=${videoId}`;
		}
		const videoInfo = await youtubedl(video, {
			dumpSingleJson: true,
		});
		console.log('videoInfo.title: ', videoInfo.title);
		const videoTitle = videoInfo.title.replace(/ /g, '_');
		const wavFile = path.join(outDir, `${videoTitle}.wav`);

		await youtubedl(video, {
			audioFormat: 'wav',
			format: 'bestaudio/best',
			extractAudio: true,
			output: `${outDir}/${videoTitle}.%(ext)s`,
		});

		console.log(`downloaded ${wavFile}`);
		console.log('generating transcript');

		const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
			fs.createReadStream(wavFile),
			options
		);
		if (error) {
			throw error;
		}

		const content = result.results.channels[0].alternatives[0].paragraphs.transcript;
		const originalTranscriptFile = '';
		const transcriptFile = `${outDir}/${videoTitle}.txt`;
		console.log('transcriptFile: ', transcriptFile);

		fs.writeFileSync(transcriptFile, content);
		if (updateTranscript) {
			console.log('running findAndReplace');
			findAndReplace(transcriptFile);
			originalTranscriptFile = `${outDir}/${videoTitle}-original.txt`;
			console.log('originalTranscriptFile: ', originalTranscriptFile);
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
