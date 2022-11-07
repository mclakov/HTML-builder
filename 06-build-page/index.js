// 1. Импорт всех требуемых модулей
const fs = require('fs');
const path = require('path');
const {rm, mkdir, readdir, stat, copyFile, readFile, writeFile} = require('fs/promises');
const {join} = require('path');
const pathToStyle = join(__dirname, 'styles');
const pathToDist = join(__dirname, 'project-dist/');
const assets = join(__dirname, 'assets');
const pathToComponents = join(__dirname, 'components');

// 2. Прочтение и сохранение в переменной файла-шаблона
// 3. Нахождение всех имён тегов в файле шаблона
// 4. Замена шаблонных тегов содержимым файлов-компонентов
// 5. Запись изменённого шаблона в файл **index.html** в папке **project-dist**
const createHtml = async () => {
	const template = await readFile(join(__dirname, 'template.html'), 'utf8');
	const components = await readdir(pathToComponents);
	let dataHtml = template;
	for await (let component of components) {
		let file = join(pathToComponents, component);
		const stats = await stat(file);
		if (stats.isFile() && path.parse(file).ext === '.html') {
			const componentData = await readFile(file, 'utf8');
			dataHtml = dataHtml.replace(`{{${path.parse(file).name}}}`, componentData);
		}
	}
	await writeFile(join(pathToDist, 'index.html'), dataHtml);
};

// 6. Использовать скрипт написанный в задании **05-merge-styles** для создания файла **style.css**
const mergeStyles = async () => {
	fs.readdir(pathToDist, err2 => {
		if (err2) throw err2;
		fs.writeFile(join(pathToDist, 'style.css'), '', err1 => {
			if (err1) throw err1;
		});
	});

	fs.readdir(pathToStyle, (err, files) => {
		if (err) throw err;
		files.map(elem => {
			let pathToFile = join(pathToStyle, elem);
			fs.stat(pathToFile, (err, stats) => {
				if (err) throw err;
				if (stats.isFile() && path.parse(pathToFile).ext === '.css') {
					fs.readFile(pathToFile, 'utf8', (err, data) => {
						if (err) throw err;
						fs.readdir(pathToDist, err2 => {
							if (err2) throw err2;
							fs.appendFile(join(pathToDist, 'style.css'), data, err1 => {
								if (err1) throw err1;
							});
						});
					});
				}
			});
		});
	});
};

// 7. Использовать скрипт из задания **04-copy-directory** для переноса папки **assets** в папку project-dist
const copyAssets = async () => {
	const pathToAssets = await mkdir(join(pathToDist, 'assets'), {recursive: true});
	const initAssets = await readdir(assets, {withFileTypes: true});
	for await (const assetFile of initAssets) {
		let file = join(assets, assetFile.name);
		if (assetFile.isFile()) {
			await copyFile(join(assets, assetFile.name), join(pathToAssets, assetFile.name));
		} else if (assetFile.isDirectory()) {
			const pathToAssetsFolder = await mkdir(join(pathToAssets, assetFile.name), {recursive: true});
			const initAssetsFolder = await readdir(file);

			for await (const initAssetsFile of initAssetsFolder) {
				await copyFile(
					join(assets, assetFile.name, initAssetsFile),
					join(pathToAssetsFolder, initAssetsFile)
				);
			}
		}
	}
};

const buildPage = async () => {
	await rm(pathToDist, {recursive: true, force: true});
	await mkdir(pathToDist, {recursive: true});
	await createHtml();
	await mergeStyles();
	await copyAssets();
};

buildPage();