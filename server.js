require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const generateTranscript = require('./transcript');

const app = express();

app.use(bodyParser.json());

async function sendEmail(to, subject, text, ...attachmentPaths) {
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
		text: text,
		to: to,
	};
	console.log('sending transcript to ', to);
	await transporter.sendMail(mailOptions);
}

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/transcript', async (req, res) => {
	const { video, email } = req.query;
	if (!video || !email) {
		return res
			.status(400)
			.send({ message: `missing video or email parameter. video: ${video} email: ${email}` });
	}
	res.status(200).send('Ok');
	console.log('received request:', video, email);
	try {
		const { videoTitle, transcriptFile, originalTranscriptFile } = await generateTranscript(
			video,
			false
		);

		const files = [transcriptFile];
		if (originalTranscriptFile) {
			files.push(originalTranscriptFile);
		}

		await sendEmail(
			email,
			`Transcript for ${videoTitle}`,
			`Transcript for ${videoTitle}`,
			...files
		);
		fs.rm('./outputs', { recursive: true });
		fs.mkdirSync('./outputs', { recursive: true });
		console.log('files removed');
		console.log('------ done');
	} catch (e) {
		console.error(`request failed: ${e}`);
		return;
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
