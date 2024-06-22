require('dotenv').config();
const path = require('path');

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const generateTranscript = require('./transcript');

const app = express();

app.use(bodyParser.json());

async function sendEmail(to, subject, text, ...attachmentPaths) {
	// const attachments = attachmentPaths.map(filePath => ({
	// 	filename: path.basename(filePath),
	// 	path: filePath,
	// }));
	// const transporter = nodemailer.createTransport({
	// 	service: 'gmail',
	// 	auth: {
	// 		user: process.env.EMAIL_USER,
	// 		pass: process.env.EMAIL_PASS,
	// 	},
	// });
	// const mailOptions = {
	// 	attachments,
	// 	from: process.env.EMAIL_USER,
	// 	subject: subject,
	// 	text: text,
	// 	to: to,
	// };
	// await transporter.sendMail(mailOptions);
}

app.get('/', (req, res) => {
	const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deepgram Transcripts</title>
    </head>
    <body>
      <p>Generate a Trancript</p>
    </body>
    </html>
  `;

	res.send(htmlContent);
});

app.get('/transcript', async (req, res) => {
	const { video, email } = req.query;
	if (!video || !email) {
		return res
			.status(400)
			.send({ message: `missing video or email parameter. video: ${video} email: ${email}` });
	}
	res.status(200).send();

	console.log('received request:', video, email);
	try {
		const { videoTitle, transcriptFile, originalTranscriptFile } = await generateTranscript(
			video,
			false
		);

		await sendEmail(
			email,
			`Transcript for ${videoTitle}`,
			`Transcript for ${videoTitle}`,
			transcriptFile,
			originalTranscriptFile
		);
	} catch (e) {
		console.error(`request failed: ${e}`);
		return;
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
