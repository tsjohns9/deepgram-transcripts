require('dotenv').config();
const fs = require('fs');
const { program } = require('commander');
const { createClient } = require('@deepgram/sdk');
const youtubedl = require('youtube-dl-exec');
const progressEstimator = require('progress-estimator');

const findAndReplace = require('./findAndReplace');

program
	.option('--videoId <id>', 'The YouTube video ID')
	.option('--fileName <name>', 'The name to use for the .wav file and the transcript');

program.parse();
const { videoId, fileName } = program.opts();
if (!videoId || !fileName) {
	console.error('Error: Please provide both --videoId and --fileName.');
	program.help(); // Display usage information
}

const estimator = progressEstimator({ log: false });

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

async function main() {
	try {
		const wavFile = `${outDir}/${fileName}.wav`;
		const p1 = youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
			extractAudio: true,
			audioFormat: 'wav',
			output: wavFile,
		});
		await estimator(p1, `downloading ${videoId}`);
		console.log(`downloaded ${wavFile}`);

		const p2 = deepgram.listen.prerecorded.transcribeFile(fs.createReadStream(wavFile), options);
		const { result, error } = await estimator(p2, 'downloading transcript from deepgram');
		if (error) {
			throw error;
		}

		const content = result.results.channels[0].alternatives[0].paragraphs.transcript;
		const originalTranscript = `${outDir}/${fileName}-original.txt`;
		const transcript = `${outDir}/${fileName}.txt`;

		fs.writeFileSync(originalTranscript, content);
		fs.copyFileSync(originalTranscript, transcript);
		findAndReplace(transcript);

		console.log(`Saved transcript to ${fileName}.txt`);
	} catch (error) {
		console.error(error.message);
	}
}

main();
