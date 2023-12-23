const fs = require('fs');

const replacements = {
	'. Like, ': '. ',
	'. Right? ': '. ',
	'. Right?': '. ',
	'. Right. ': '. ',
	'. Right.': '. ',
	"battle's": 'battle is',
	"couldn't": 'could not',
	"didn't": 'did not',
	"doesn't": 'does not',
	"don't": 'do not',
	"God's": 'God is',
	gotta: 'got to',
	"haven't": 'have not',
	"he's": 'he is',
	"here's": 'here is',
	i: 'I',
	"I'd": 'I would',
	"I'll": 'I will',
	"I've": 'I have',
	"isn't": 'is not',
	"It'd": 'It would',
	"It'll": 'It will',
	"it's": 'it is',
	"let's": 'let us',
	"one's": 'one is',
	"she's": 'she is',
	"that'd": 'that would',
	"that's": 'that is',
	"there'd": 'there would',
	"there'll": 'there will',
	"there's": 'there is',
	"they'll": 'they will',
	"they're": 'they are',
	"they've": 'they have',
	"wasn't": 'was not',
	"we'll": 'we will',
	"we're": 'we are',
	"we've": 'we have',
	"weren't": 'were not',
	"what's": 'what is',
	"who's": 'who is',
	"won't": 'will not',
	"wouldn't": 'would not',
	"you'd": 'you would',
	"You'd": 'You would',
	"you'll": 'you will',
	"you're": 'you are',
	"you've": 'you have',
	'1st': 'first',
	'2nd': 'second',
	'3rd': 'third',
	gonna: 'going to',
	kinda: 'kind of',
	wanna: 'want to',
};

const capitalizeWords = ['lord', 'god', 'holy spirit', 'christ', 'jesus', 'satan', 'devil'];

const filename = 'revelation-6.txt';

fs.readFile(filename, 'utf8', (err, data) => {
	if (err) {
		console.error('Error reading the file:', err);
		return;
	}
	data = capitalizeSentence(data);
	data = removeRight(data);
	data = removeRepeatedWordsAndContractions(data);
	data = capitalizeAfterAnd(data);
	data = capitalizeAfterBut(data);
	data = capitalizeAfterSo(data);
	data = lowercaseAfterComma(data);
	// data = capitalizeSentence2(data);

	// Iterate over the replacements and perform substitution
	for (const oldPhrase in replacements) {
		const newPhrase = replacements[oldPhrase];
		const escapedOldPhrase = escapeRegExp(oldPhrase);
		const pattern = new RegExp(escapedOldPhrase, 'gi');

		// Perform the substitution with preserved capitalization
		data = data.replace(pattern, matched => {
			// Preserve the original capitalization of the matched phrase
			return matchCase(matched, newPhrase);
		});
	}

	// Capitalize specific words
	capitalizeWords.forEach(word => {
		const escapedWord = escapeRegExp(word);
		const pattern = new RegExp(`\\b${escapedWord}\\b`, 'g');
		data = data.replace(pattern, matched => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		});
	});

	// Write the modified content back to the same file
	fs.writeFile(filename, data, 'utf8', err => {
		if (err) {
			console.error('Error writing to the file:', err);
			return;
		}
		console.log('Replacements and removal of repeated words completed. File updated successfully.');
	});
});

// Function to escape special characters in a regular expression pattern
function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to match the case of the source string in the target string
function matchCase(source, target) {
	if (source === source.toUpperCase()) {
		return target.toUpperCase();
	} else if (source === source.toLowerCase()) {
		return target.toLowerCase();
	} else if (/^[A-Z][a-z']+$/.test(source)) {
		// Match title case and words with apostrophes
		return target.charAt(0).toUpperCase() + target.slice(1);
	}
	// If the capitalization is mixed or unknown, use the replacement as is
	return target;
}

// Function to remove repeated words and contractions while preserving spaces and new lines
function removeRepeatedWordsAndContractions(text) {
	return text.replace(/(\b[\w']+\b)(?:(?=\s*[\w'])\s*\1)+/gi, '$1');
}

// Capitalize the word after "And" at the beginning of a sentence
function capitalizeAfterAnd(inputString) {
	inputString = inputString.replace(/\. And,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	inputString = inputString.replace(/\? And,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	// Match the word after "And" at the beginning of a line or after a new line
	return inputString.replace(
		/(\n|^)\s*And\s+(\w+)/g,
		(match, newline, group) => `\n\n${group.charAt(0).toUpperCase()}${group.slice(1)}`
	);
}

// Capitalize the word after "But" at the beginning of a sentence
function capitalizeAfterBut(inputString) {
	inputString = inputString.replace(/\. But,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	inputString = inputString.replace(/\? But,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	// Match the word after "But" at the beginning of a line or after a new line
	return inputString.replace(
		/(\n|^)\s*But\s+(\w+)/g,
		(match, newline, group) => `\n\n${group.charAt(0).toUpperCase()}${group.slice(1)}`
	);
}

// Capitalize the word after "So" at the beginning of a sentence
function capitalizeAfterSo(inputString) {
	inputString = inputString.replace(/\. So,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	inputString = inputString.replace(/\? So,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	// Match the word after "So" at the beginning of a line or after a new line
	return inputString.replace(
		/(\n|^)\s*So\s+(\w+)/g,
		(match, newline, group) => `\n\n${group.charAt(0).toUpperCase()}${group.slice(1)}`
	);
}

// Match "Right? " at the beginning of a new line
function removeRight(inputString) {
	return inputString.replace(/^Right\?\s+/gm, '');
}

function capitalizeSentence(inputString) {
	return inputString.replace(/(?:^|\.\s|\n)([a-z]+)/g, (match, word) => {
		return match.charAt(0) + word.charAt(0).toUpperCase() + word.slice(1);
	});
}

// Lowercase a word that follows a comma, exclude "I"
function lowercaseAfterComma(inputString) {
	return inputString.replace(
		/,\s([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g,
		(match, group) => `, ${group.toLowerCase()}`
	);
}

// Match a period followed by a space and a word that is not capitalized
// function capitalizeSentence2(inputString) {
// 	return inputString.replace(/\. (\b[a-z])/g, (match, group) => `. ${group.toUpperCase()}`);
// }
