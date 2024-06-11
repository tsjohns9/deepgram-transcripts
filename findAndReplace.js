const fs = require('fs');

const replacements = {
	' 1 ': ' one ',
	' 10 ': ' ten ',
	' 2 ': ' two ',
	' 3 ': ' three ',
	' 4 ': ' four ',
	' 5 ': ' five ',
	' 6 ': ' six ',
	' 7 ': ' seven ',
	' 8 ': ' eight ',
	' 9 ': ' nine ',
	'? Right? ': '? ',
	'. Right? ': '. ',
	'. Right?': '. ',
	'. Right. ': '. ',
	'. Right.': '. ',
	', Right?': '.',
	'10th': 'tenth',
	'1st': 'first',
	'2nd': 'second',
	'3rd': 'third',
	'4th': 'fourth',
	'5th': 'fifth',
	'6th': 'sixth',
	'7th': 'seventh',
	'8th': 'eighth',
	'9th': 'ninth',
	"couldn't": 'could not',
	"didn't": 'did not',
	"doesn't": 'does not',
	"don't": 'do not',
	"hasn't": 'has not',
	"haven't": 'have not',
	"he'll": 'he will',
	"he's": 'he is',
	"here's": 'here is',
	"I'd": 'I would',
	"I'll": 'I will',
	"I've": 'I have',
	"isn't": 'is not',
	"It'd": 'It would',
	"It'll": 'It will',
	"it's": 'it is',
	"let's": 'let us',
	"nothing's": 'nothing is',
	"one's": 'one is',
	"she's": 'she is',
	"that'd": 'that would',
	"that'll": 'that will',
	"that's": 'that is',
	"there'd": 'there would',
	"there'll": 'there will',
	"there's": 'there is',
	"they'd": 'they would',
	"they'll": 'they will',
	"they're": 'they are',
	"they've": 'they have',
	"wasn't": 'was not',
	"we'd": 'We would',
	"we'll": 'we will',
	"we're": 'we are',
	"we've": 'we have',
	"weren't": 'were not',
	"what's": 'what is',
	"who'd": 'who would',
	"who's": 'who is',
	"who've": 'who have',
	"won't": 'will not',
	"wouldn't": 'would not',
	"you'd": 'you would',
	"you'll": 'you will',
	"you're": 'you are',
	"you've": 'you have',
	gonna: 'going to',
	gotta: 'got to',
	i: 'I',
	kinda: 'kind of',
	wanna: 'want to',
};

const capitalizeWords = [
	'christ',
	'dan',
	'david',
	'devil',
	'god',
	'holy spirit',
	'israel',
	'israelites',
	'jehovah',
	'jesus',
	'lord',
	'moses',
	'samson',
	'samuel',
	'satan',
	'saul',
	'solomon',
	'yahweh',
];

const findAndReplace = fileName => {
	fs.readFile(fileName, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the file:', err);
			return;
		}
		data = capitalizeSentence(data);
		data = removeRight(data);
		data = capitalizeAfterBut(data);
		data = capitalizeAfterAnd(data);
		data = capitalizeAfterSo(data);
		data = capitalizeAfterLike(data);
		data = lowercaseAfterComma(data);

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

		data = removeRepeatedWords(data);

		// Capitalize specific words
		capitalizeWords.forEach(word => {
			const escapedWord = escapeRegExp(word);
			const pattern = new RegExp(`\\b${escapedWord}\\b`, 'g');
			data = data.replace(pattern, matched => {
				return word.charAt(0).toUpperCase() + word.slice(1);
			});
		});

		// Write the modified content back to the same file
		fs.writeFile(fileName, data, 'utf8', err => {
			if (err) {
				console.error('Error writing to the file:', err);
				return;
			}
			console.log(
				'Replacements and removal of repeated words completed. File updated successfully.'
			);
		});
	});
};

// Function to escape special characters in a regular expression pattern
function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to match the case of the source string in the target string
function matchCase(source, target) {
	// Return target as is if source is numeric
	if (!isNaN(source)) {
		return target;
	} else if (source === source.toUpperCase()) {
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

// remove immediately repeated word sequences
function removeRepeatedWords(text) {
	return text.replace(/(\b(?:\w+\b\s*)+)(?=\1)/gi, '');
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

// Capitalize the word after "Like" at the beginning of a sentence
function capitalizeAfterLike(inputString) {
	inputString = inputString.replace(/\. Like,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	inputString = inputString.replace(/\? Like,? (\w+)/g, (match, word) => {
		return '. ' + word.charAt(0).toUpperCase() + word.slice(1);
	});

	// Match the word after "Like" at the beginning of a line or after a new line
	return inputString.replace(
		/(\n|^)\s*Like\s+(\w+)/g,
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

module.exports = findAndReplace;
