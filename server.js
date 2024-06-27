require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const generateTranscript = require('./transcript');

const app = express();

app.use(bodyParser.json());

async function sendEmail(to, subject, ...attachmentPaths) {
	const attachments = attachmentPaths.map(filePath => ({
		filename: path.basename(filePath),
		path: filePath,
	}));
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
	const mailOptions = {
		attachments,
		from: process.env.EMAIL_USER,
		subject: subject,
		text: subject,
		to: to,
	};
	console.log('sending transcript to ', to);
	await transporter.sendMail(mailOptions);
}

app.get('/', (_, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/transcript', async (req, res) => {
	const { video, email, updateTranscript = false } = req.body;
	if (!video || !email) {
		return res
			.status(400)
			.send({ message: `missing video or email parameter. video: ${video} email: ${email}` });
	}
	res.status(200).send({ status: 'Ok' });
	const decodedVideoUrl = decodeURIComponent(video);
	const decodedEmail = decodeURIComponent(email);
	console.log('received request:', decodedVideoUrl, decodedEmail);
	try {
		const { videoTitle, transcriptFile, originalTranscriptFile } = await generateTranscript(
			decodedVideoUrl,
			'',
			updateTranscript
		);

		const files = [transcriptFile];
		if (originalTranscriptFile) {
			files.push(originalTranscriptFile);
		}

		await sendEmail(decodedEmail, `Transcript for ${videoTitle}`, ...files);
		fs.rmSync('./outputs', { recursive: true });
		fs.mkdirSync('./outputs', { recursive: true });
		console.log('files removed');
		console.log('------ done');
	} catch (e) {
		console.error(`request failed: ${e}`);
		await sendEmail(decodedEmail, `Failed to generate transcript`);
		return;
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
