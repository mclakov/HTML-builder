const fs = require('fs');
const path = require('path');
const pathToFiles = path.join(__dirname, 'files');
const pathToCopyFiles = path.join(__dirname, 'files-copy/');


fs.mkdir(pathToCopyFiles, {recursive: true},err => {
	if (err) throw err;
});

fs.readdir(pathToCopyFiles, (err, files) => {
	if (err) throw err;
	files.map(elem => {
		fs.unlink(path.join(pathToCopyFiles, elem), err => {
			if (err) throw err;
		});
	});
});

fs.readdir(pathToFiles, (err, files) => {
	if (err) throw err;
	files.map(elem => {
		fs.copyFile(path.join(pathToFiles, elem), path.join(pathToCopyFiles, elem), err => {
			if (err) throw err;
		});
	});
});