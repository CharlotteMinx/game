
const pug = require('pug')
const fs = require('fs')
const beauty = require('html-formatter')

const use_folder = process.argv[2] || './'
console.log(`compiling .pug files in ${use_folder}`)

// read filenames in directory
fs.readdir(use_folder, (err, files) => {

	if (err) { console.log(err); return; }

	// how filenames and paths are processed 
	path = (file) => use_folder + '/' + file
	trimExt = (file) => file.split('.')[0]

	// process each file
	files.forEach((file) => {

		if (!file.endsWith('.pug')) return; // skip if not pug file

		console.log(`... compiling ${file}`)

		// render html from pug code in file
		let html = pug.renderFile(path(file))
		html = beauty.render(html)  // beautify
		let new_filename = trimExt(file) + '.html'

		// write the new file
		fs.writeFile(new_filename, html, (err, data) => {
			if (err) console.log(err);
			else     console.log(`    Success!`)
		})
	})
	
})
