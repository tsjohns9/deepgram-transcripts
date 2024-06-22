const fs = require('fs');
const { createClient } = require('@deepgram/sdk');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const findAndReplace = require('./findAndReplace');

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
		const outDir = 'outputs';
		if (!fs.existsSync(outDir)) {
			fs.mkdirSync(outDir);
		}
		const videoInfo = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
			dumpSingleJson: true,
		});
		console.log('videoInfo.title: ', videoInfo.title);
		const videoTitle = videoInfo.title.replace(/ /g, '_');
		const wavFile = path.join(outDir, `${videoTitle}.webm`);

		const r = await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
			audioFormat: 'wav',
			format: 'bestaudio/best',
			extractAudio: true,
			output: `${outDir}/${videoTitle}.%(ext)s`,
		});
		console.log('downloaded wav file result: ', r);

		readFiles();

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

const readFiles = function () {
	const files = fs.readdirSync('./outputs');
	console.log('Contents of directory:');
	files.forEach(file => {
		console.log(file);
	});
};
