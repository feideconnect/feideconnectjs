module.exports = function(grunt) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bower: grunt.file.readJSON('bower.json'),
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg', 'bower'],

				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json', 'bower.json'],

				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',

				push: true,
				pushTo: 'origin',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
				globalReplace: false,
				prereleaseName: false,
				regExp: false
			}
		},
	});



	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-bump');

	// Default task(s).
	grunt.registerTask('default', []);

};