require('dotenv').config();
const { program } = require('commander');
const generateTranscript = require('./transcript');

program
	.option('--videoId <id>', 'The YouTube video ID')
	.option('--updateTranscript [value]', 'Set to true to modify the transcript', false);

program.parse();
const { videoId, updateTranscript } = program.opts();
if (!videoId) {
	console.error('Error: videoId is required');
	program.help();
}

generateTranscript(videoId, updateTranscript);
