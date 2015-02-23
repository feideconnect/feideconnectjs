define(function(require, exports, module) {

	var 
		JSO = require('bower/jso/src/jso'),
		$ = require('jquery');
		

	JSO.enablejQuery($);


	var FeideConnect = function(config) {

		var fcDev = {
			providerId: "feideconnect-dev",
			authorization: "https://auth.dev.feideconnect.no/oauth/authorization",
			token: "https://auth.dev.feideconnect.no/oauth/token",
			apis: {
				"auth": "https://auth.dev.feideconnect.no",
				"core": "http://api.dev.feideconnect.no:6543",
				"groups": "http://api.dev.feideconnect.no:7654"
			}
		};
		var fcPilot = {
			providerId: "feideconnect-pilot",
			authorization: "https://auth.feideconnect.no/oauth/authorization",
			token: "https://auth.dev.feideconnect.no/oauth/token",
			apis: {
				"auth": "https://auth.feideconnect.no",
				"core": "http://api.dev.feideconnect.no:6543",
				"groups": "http://api.dev.feideconnect.no:7654"
			}
		};
		var fcDevRunscope = {
			providerId: "feideconnect-dev",
			authorization: "https://auth.dev.feideconnect.no/oauth/authorization",
			apis: {
				"auth": "https://auth.dev.feideconnect.no",
				"core": "http://api.dev.feideconnect.no:6543",
				"groups": "http://api.dev.feideconnect.no:7654"
			}
		};

		var defaults = {
			"autologin": false
		};


		var selectedConfig = {};
		if (config.instance && config.instance === 'dev') {
			selectedConfig = fcDev;
		}
		if (config.instance && config.instance === 'pilot') {
			selectedConfig = fcPilot;
		}



		this.config = $.extend({}, selectedConfig, defaults, config);

		this.jso = new JSO(this.config);
		console.log("JSO LOAded", this.jso);
		this.jso.callback();


		this.callbacks = {
			"onStateChange": null
		};

		this.authState = null;
		this.userinfo = null;

		if (this.config.autologin) {
			this.authenticate();

		} else {
			this.check();
		}	


	};

	FeideConnect.prototype.getConfig = function() {

		return this.config;

	};


	FeideConnect.prototype.logout = function() {

		this.jso.wipeTokens();
		this.userinfo = null;
		this.setAuthState(false);

	};

	FeideConnect.prototype.authenticate = function() {

		var that = this;
		return this._request('auth', '/userinfo', null, ['userinfo']).then(function(res) {

			if  (res.audience !== that.config.client_id) {
				throw new Error('Wrong audience for this token.');
			}
			// console.error("Set userinfo");
			that.userinfo = res.user;
			that.setAuthState(true);

		});
	};

	FeideConnect.prototype.getUserInfo = function() {
		return this._request('auth', '/userinfo', null, ['userinfo']);
	};


	FeideConnect.prototype.psOrgs = function(callback) {
		var path = "peoplesearch/orgs";
		return this._request('core', '/peoplesearch/orgs', null, ['peoplesearch'], callback);		
	};

	FeideConnect.prototype.psSearch = function(realm, query, callback) {
		var path = "/peoplesearch/search/" + realm + "/" + encodeURI(query);
		return this._request('core', path, null, ['peoplesearch'], callback);		
	};

	
	FeideConnect.prototype.clientsList = function(callback) {
		var path = "/clientadm/clients/";
		return this._request('core', path, null, ['clientadmin'], callback);		
	};

	FeideConnect.prototype.clientsByScope = function(scope, callback) {
		var path = "/clientadm/clients/?scope=" + encodeURIComponent(scope);
		return this._request('core', path, null, ['clientadmin'], callback);		
	};
	

	FeideConnect.prototype.clientsRegister = function(obj, callback) {
		var path = "/clientadm/clients/";
		return this._requestObj('POST', 'core', path, null, ['clientadmin'], obj, callback);
	};

	FeideConnect.prototype.clientsUpdate = function(obj, callback) {
		var path = "/clientadm/clients/" + obj.id;
		return this._requestObj('PATCH', 'core', path, null, ['clientadmin'], obj, callback);
	};
	FeideConnect.prototype.clientsDelete = function(clientid, callback) {
		var path = "/clientadm/clients/" + clientid;
		return this._requestObj('DELETE', 'core', path, null, ['clientadmin'], null, callback);
	};

	FeideConnect.prototype.clientsUpdateLogo = function(id, obj, callback) {
		var path = "/clientadm/clients/" + id + "/logo";
		var contenttype = obj.contenttype;
		console.log("File content type: " + contenttype);
		contenttype = "image/jpeg";
		return this._requestBinary('POST', 'core', path, null, ['clientadmin'], obj, contenttype, callback);

	};

	FeideConnect.prototype.apigkList = function(callback) {
		var path = "/apigkadm/apigks/";
		return this._request('core', path, null, ['apigkadmin'], callback);			
	};

	FeideConnect.prototype.apigkPublicList = function(callback) {
		var path = "/apigkadm/public";
		return this._requestPublic('core', path, callback);

	};

	FeideConnect.prototype.apigkRegister = function(obj, callback) {
		var path = "/apigkadm/apigks/";
		return this._requestObj('POST', 'core', path, null, ['apigkadmin'], obj, callback);
	};
	FeideConnect.prototype.apigkUpdate = function(obj, callback) {
		var path = "/apigkadm/apigks/" + obj.id;
		// delete obj.id;
		// var x = {name: obj.name};
		return this._requestObj('PATCH', 'core', path, null, ['apigkadmin'], obj, callback);	
	};
	FeideConnect.prototype.apigkDelete = function(id, callback) {
		var path = "/apigkadm/apigks/" + id;
		return this._requestObj('DELETE', 'core', path, null, ['apigkadmin'], null, callback);
	};
	FeideConnect.prototype.apigkUpdateLogo = function(id, obj, callback) {
		var path = "/apigkadm/apigks/" + id + "/logo";
		var contenttype = obj.contenttype;
		console.log("File content type: " + contenttype);
		contenttype = "image/jpeg";
		return this._requestBinary('POST', 'core', path, null, ['apigkadmin'], obj, contenttype, callback);
	};
	FeideConnect.prototype.apigkCheck = function(id, callback) {
		var path = "/apigkadm/apigks/" + id + "/exists";
		return this._request('core', path, null, ['apigkadmin'], callback);	
	};

	FeideConnect.prototype.apigkClientRequests = function(callback) {
		var owner = this.userinfo.userid;
		var path = "/apigkadm/apigks/owners/" + owner + "/clients/";
		return this._request('core', path, null, ['apigkadmin'], callback);	
	};


	FeideConnect.prototype.getGroups = function(callback) {
		var path = "/adhocgroups/";
		return this._request('core', path, null, ['adhocgroupadmin'], callback);
	};

	FeideConnect.prototype.updateGroup = function(groupid, data, callback) {
		var path = "/adhocgroups/" + groupid;
		return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};

	FeideConnect.prototype.addGroup = function(data, callback) {
		var path = "/adhocgroups/";
		return this._requestObj("POST", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};

	FeideConnect.prototype.delGroup = function(groupid, callback) {
		var path = "/adhocgroups/" + groupid;
		return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], null, callback);
	};

	FeideConnect.prototype.getGroupMembers = function(groupid, callback) {
		var path = "/adhocgroups/" + groupid + "/members";
		return this._request('core', path, null, ['adhocgroupadmin'], callback);
	};

	FeideConnect.prototype.addGroupMember = function(groupid, token, type, callback) {
		var data = [{"token": token, "type": type}];
		var path = "/adhocgroups/" + groupid + "/members";
		return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};

	FeideConnect.prototype.delGroupMember = function(groupid, userid, callback) {
		var data = [userid];
		var path = "/adhocgroups/" + groupid + "/members";
		return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};

	FeideConnect.prototype.getGroupMemberships = function(callback) {
		var path = "/adhocgroups/memberships";
		return this._request('core', path, null, ['adhocgroupadmin'], callback);
	};

	FeideConnect.prototype.confirmGroupMembership = function(groupid, callback) {
		var path = "/adhocgroups/memberships";
		var data = [groupid];
		return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};

	FeideConnect.prototype.leaveGroup = function(groupid, callback) {
		var path = "/adhocgroups/memberships";
		var data = [groupid];
		return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], data, callback);
	};



	FeideConnect.prototype.vootGroupsList = function(callback) {
		var path = "/groups/me/groups";
		return this._request('groups', path, null, ['groups'], callback);
	};
	FeideConnect.prototype.vootGroupsPublicList = function(callback) {
		var path = "/groups/groups";
		return this._request('groups', path, null, ['groups'], callback);
	};
	FeideConnect.prototype.vootGrouptypes = function(callback) {
		var path = "/groups/grouptypes";
		return this._request('groups', path, null, ['groups'], callback);
	};


	FeideConnect.prototype.authorizationsList = function(callback) {
		var path = "/authorizations/";
		return this._request('core', path, null, ['authzinfo'], callback);	
	};

	FeideConnect.prototype.authorizationsDelete = function(id, callback) {
		var path = "/authorizations/" + id;
		return this._requestObj("DELETE", 'core', path, null, ['authzinfo'], null, callback);
	};


	FeideConnect.prototype.setAuthState = function(ns) {

		if (this.authState === ns) return;

		this.authState = ns;
		if (typeof this.callbacks.onStateChange === 'function') {
			this.callbacks.onStateChange(this.authState, this.userinfo);
		}

	};

	FeideConnect.prototype.onStateChange = function(callback) {
		this.callbacks.onStateChange = callback;
	};




	FeideConnect.prototype._requestBinary = function(method, instance, endpoint, request, require, data, contentType, callback) {

		var that = this;
		var url = this.config.apis[instance] + endpoint;
		console.log("About to perform a JSO OAuth request to " + instance + " [" + url + "]");

		var headers = {};

		return new Promise(function(resolve, reject) {
			that.jso.ajax({
				url: url,
				type: method,
				data: data,
				contentType: contentType,
				processData: false,
				headers: headers,
				oauth: {
					scopes: {
						request: request,
						require: require
					}
				},
				success: function(data) {
					if (typeof callback === 'function') callback(data);
					resolve(data);
				},
				error: function(jqXHR, text, error) {
					var str = 'HTTP status (' + error + '), JSO error on [' + endpoint + '] ' + text + '';
					if (jqXHR.hasOwnProperty("responseText") && typeof jqXHR.responseText === 'string') {
						try {
							var xmsg = JSON.parse(jqXHR.responseText);
							if (xmsg.hasOwnProperty("message")) {
								str = xmsg.message + " \n(" + str + ")";
							}
						} catch(err) {}
					}
					reject(new Error(str));
				}
			});
		});


	};


	FeideConnect.prototype._requestObj = function(method, instance, endpoint, request, require, data, callback) {

		var that = this;
		var url = this.config.apis[instance] + endpoint;
		console.log("About to perform a JSO OAuth request to " + instance + " [" + url + "]");

		return new Promise(function(resolve, reject) {
			that.jso.ajax({
				url: url,
				type: method,
				data: JSON.stringify(data, undefined, 2),
				contentType: 'application/json; charset=UTF-8',
				oauth: {
					scopes: {
						request: request,
						require: require
					}
				},
				dataType: 'json',
				success: function(data) {
					if (typeof callback === 'function') callback(data);
					resolve(data);
				},
				error: function(jqXHR, text, error) {
					var str = 'HTTP status (' + error + '), JSO error on [' + endpoint + '] ' + text + '';
					if (jqXHR.hasOwnProperty("responseText") && typeof jqXHR.responseText === 'string') {
						try {
							var xmsg = JSON.parse(jqXHR.responseText);
							if (xmsg.hasOwnProperty("message")) {
								str = xmsg.message + " \n(" + str + ")";
							}
						} catch(err) {}
					}
					reject(new Error(str));
				}
			});
		});
	};


	FeideConnect.prototype._customRequest = function(url, request, require, callback) {
		var that = this;
		console.log("About to perform a JSO OAuth request to [" + url + "]");
		return new Promise(function(resolve, reject) {
			that.jso.ajax({
				url: url,
				oauth: {
					scopes: {
						request: request,
						require: require
					}
				},
				dataType: 'json',
				success: function(data) {
					if (typeof callback === 'function') callback(data);
					resolve(data);
				},
				error: function(jqXHR, text, error) {
					var str = 'HTTP status (' + error + '), JSO error on [' + endpoint + '] ' + text + '';
					if (jqXHR.hasOwnProperty("responseText") && typeof jqXHR.responseText === 'string') {
						try {
							var xmsg = JSON.parse(jqXHR.responseText);
							if (xmsg.hasOwnProperty("message")) {
								str = xmsg.message + " \n(" + str + ")";
							}
						} catch(err) {}
					}
					reject(new Error(str));
				}
			});

		});
	};



	FeideConnect.prototype._request = function(instance, endpoint, request, require, callback) {

		var that = this;
		var url = this.config.apis[instance] + endpoint;
		console.log("About to perform a JSO OAuth request to " + instance + " [" + url + "]");
		return new Promise(function(resolve, reject) {
			that.jso.ajax({
				url: url,
				oauth: {
					scopes: {
						request: request,
						require: require
					}
				},
				dataType: 'json',
				success: function(data) {
					if (typeof callback === 'function') callback(data);
					resolve(data);
				},
				error: function(jqXHR, text, error) {
					var str = 'HTTP status (' + error + '), JSO error on [' + endpoint + '] ' + text + '';
					if (jqXHR.hasOwnProperty("responseText") && typeof jqXHR.responseText === 'string') {
						try {
							var xmsg = JSON.parse(jqXHR.responseText);
							if (xmsg.hasOwnProperty("message")) {
								str = xmsg.message + " \n(" + str + ")";
							}
						} catch(err) {}
					}
					reject(new Error(str));
				}
			});

		});

	};

	FeideConnect.prototype._requestPublic = function(instance, endpoint, callback) {

		var that = this;
		var url = this.config.apis[instance] + endpoint;
		console.log("About to perform a public request to " + instance + " [" + url + "]");
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: url,
				dataType: 'json',
				success: function(data) {
					if (typeof callback === 'function') callback(data);
					resolve(data);
				},
				error: function(jqXHR, text, error) {
					var str = 'HTTP status (' + error + '), JSO error on [' + endpoint + '] ' + text + '';
					if (jqXHR.hasOwnProperty("responseText") && typeof jqXHR.responseText === 'string') {
						try {
							var xmsg = JSON.parse(jqXHR.responseText);
							if (xmsg.hasOwnProperty("message")) {
								str = xmsg.message + " \n(" + str + ")";
							}
						} catch(err) {}
					}
					reject(new Error(str));
				}
			});
		});
	};




	FeideConnect.prototype.check = function() {

		console.log("JSO LOAded", this.jso);
		var token = this.jso.checkToken({
			"scopes": {
				"require": ["userinfo"]
			}
		});

		if (token) {
			console.log("Check for token YES");
			this.authenticate();
		} else {
			console.log("Check for token NO");
		}


	};


	exports.FeideConnect = FeideConnect;

});
