/**
 * This utility object contains a few function that is used in various placed, and is more generic functions.
 */


define(function(require, exports, module) {

	"use strict";
	/* jslint bitwise: true */
	/* jshint ignore:start */

	var 
		moment = require('bower/momentjs/moment');
		
		


	var utils = {
		"guid": function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},

		// Credits to 
		// http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
		"escape": function(s, forAttribute) {
			var r = ((forAttribute !== false) ? 
				new RegExp('[&<>\'"]', 'g') : 
				new RegExp('[&<>]', 'g'));
			var MAP = { '&': '&amp;',
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						"'": '&#39;'};
			var p = s.replace(r, function(c) {
				return MAP[c];
			});
			return p;
		},
		"getKeys": function(obj) {
			var list = [];
			if (typeof obj !== "object") {
				return list;
			}
			for(var key in obj) {
				if (obj.hasOwnProperty(key)) {
					list.push(key);
				}
			}
			return list;
		},
		"parseDate": function (input) {
			var x = input.substring(0, 19) + 'Z';
			// console.log("About to parse date " + input, x);
			return moment(x);
		},
		
	    // Normalize search term.
	    "normalizeST": function(searchTerm) {
	        var x = searchTerm.toLowerCase().replace(/[^a-zæøåA-ZÆØÅ ]/g, '');
	        if (x === '') {
	            return null;
	        }
	        return x;
	    },
	    "stok" : function(str) {
	        // console.log("STR", str);
	        if (str === null) {return true;}
	        if (str.length > 2) { return true; }
	        return false;
	    },
	    "quoteattr" : function(s, preserveCR) {
	        preserveCR = preserveCR ? '&#13;' : '\n';
	        return ('' + s) /* Forces the conversion to string. */
	            .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
	            .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
	            .replace(/"/g, '&quot;')
	            .replace(/</g, '&lt;')
	            .replace(/>/g, '&gt;')
	            /*
	            You may add other replacements here for HTML only 
	            (but it's not necessary).
	            Or for XML, only if the named entities are defined in its DTD.
	            */ 
	            .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
	            .replace(/[\r\n]/g, preserveCR);
	    }

	};



	return utils;
	/* jshint ignore:end */
});