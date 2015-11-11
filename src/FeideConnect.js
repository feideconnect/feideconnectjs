define(function(require, exports, module) {

	"use strict";

	var
		JSO = require('bower/jso/src/jso'),
		OpenIDAuthentication = require('bower/jso/src/Authentication/OpenIDAuthentication'),
		$ = require('jquery');



	var fcDev1 = {
		providerId: "feideconnect-dev1",
		authorization: "https://auth.dev.feideconnect.no/oauth/authorization",
		token: "https://auth.dev.feideconnect.no/oauth/token",
		apis: {
			"auth": "https://auth.dev.feideconnect.no",
			"core": "https://api.dev.feideconnect.no",
			"groups": "https://groups-api.dev.feideconnect.no"
		},

		"debug": false
	};
	var fcDev2 = {
		providerId: "feideconnect-dev1",
		authorization: "https://auth.feideconnect.no/oauth/authorization",
		token: "https://auth.feideconnect.no/oauth/token",
		apis: {
			"auth": "https://auth.feideconnect.no",
			"core": "https://api.dev.feideconnect.no",
			"groups": "https://groups-api.feideconnect.no"
		},

		"debug": false
	};
	var fcDev = {
		providerId: "feideconnect-dev",
		authorization: "https://auth.dev.feideconnect.no/oauth/authorization",
		token: "https://auth.dev.feideconnect.no/oauth/token",
		apis: {
			"auth": "https://auth.dev.feideconnect.no",
			"core": "https://api.feideconnect.no",
			"groups": "https://groups-api.dev.feideconnect.no"
		},
		"debug": false,
		userInfo: "https://auth.dev.feideconnect.no/userinfo"
	};
	var fcPilot = {
		providerId: "feideconnect-pilot",
		authorization: "https://auth.feideconnect.no/oauth/authorization",
		token: "https://auth.feideconnect.no/oauth/token",
		apis: {
			"auth": "https://auth.feideconnect.no",
			"core": "https://api.feideconnect.no",
			"groups": "https://groups-api.feideconnect.no"
		},
		userInfo: "https://auth.feideconnect.no/userinfo"
	};



	var FeideConnect = OpenIDAuthentication.extend({
		"init": function(config) {
			var defaults = {
				"debug": false
			};

			var that = this;


			var selectedConfig = {};
			if (config.instance && config.instance === 'dev1') {
				selectedConfig = fcDev1;
			}
			if (config.instance && config.instance === 'dev2') {
				selectedConfig = fcDev2;
			}
			if (config.instance && config.instance === 'dev') {
				selectedConfig = fcDev;
			}
			if (config.instance && config.instance === 'pilot') {
				selectedConfig = fcPilot;
			}



			var xconfig = $.extend({}, selectedConfig, defaults, config);

			this._super(xconfig);
		},

		"logout": function() {
			this._super();
			var url = this.config.apis.auth + '/logout';
			window.location = url;
		},

		"getUserInfo": function() {
			return this._request('auth', '/userinfo', null, ['userinfo']);
		},


		"psOrgs": function(callback) {
			var path = "peoplesearch/orgs";
			return this._request('core', '/peoplesearch/orgs', null, ['peoplesearch'], callback);
		},

		"psSearch": function(realm, query, callback) {
			var path = "/peoplesearch/search/" + realm + "/" + encodeURI(query);
			return this._request('core', path, null, ['peoplesearch'], callback);
		},


		// TODO : Check what scope is really required.
		"getMandatoryClients": function(orgid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/";
			return this._request('core', path, null, ['orgadmin'], callback);
		},
		"setMandatoryClient": function(orgid, clientid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/";
			var obj = clientid;
			return this._requestObj('POST', 'core', path, null, ['orgadmin'], obj, callback);
		},
		"removeMandatoryClient": function(orgid, clientid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/" + clientid;
			return this._requestObj('DELETE', 'core', path, null, ['orgadmin'], null, callback);
		},



		"getOrgTargetedAPIs": function(orgid) {
			var path = '/clientadm/realmclients/targetrealm/' + orgid + '/';
			return this._request('core', path, null, ['orgadmin']);
		},

		"updateOrgAuthorizations": function(realm, clientid, data) {
			var path = '/clientadm/clients/' + clientid + '/orgauthorization/' + realm;
			return this._requestObj("PATCH", 'core', path, null, ['orgadmin'], data);
		},



		"getClient": function(id, callback) {
			var path = "/clientadm/clients/" + id;
			return this._request('core', path, null, ['clientadmin'], callback);
		},


		"clientsList": function(callback) {
			var path = "/clientadm/clients/";
			return this._request('core', path, null, ['clientadmin'], callback);
		},

		"clientsByScope": function(scope, callback) {
			var path = "/clientadm/clients/?scope=" + encodeURIComponent(scope);
			return this._request('core', path, null, ['clientadmin'], callback);
		},

		"clientsByOrg": function(orgid, callback) {
			var path = "/clientadm/clients/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('core', path, null, ['clientadmin'], callback);
		},

		"clientsRegister": function(obj, callback) {
			var path = "/clientadm/clients/";
			return this._requestObj('POST', 'core', path, null, ['clientadmin'], obj, callback);
		},

		"clientsUpdate": function(obj, callback) {
			var path = "/clientadm/clients/" + obj.id;
			return this._requestObj('PATCH', 'core', path, null, ['clientadmin'], obj, callback);
		},

		"clientsAuthorizeAPIGKscopes": function(id, obj, callback) {
			var path = "/clientadm/clients/" + id + "/gkscopes";
			return this._requestObj('PATCH', 'core', path, null, ['clientadmin'], obj, callback);
		},

		"clientsDelete": function(clientid, callback) {
			var path = "/clientadm/clients/" + clientid;
			return this._requestObj('DELETE', 'core', path, null, ['clientadmin'], null, callback);
		},

		"clientsUpdateLogo": function(id, obj) {
			var path = "/clientadm/clients/" + id + "/logo";
			var contenttype = "image/jpeg";
			if (obj.type) {
				contenttype = obj.type;
			}
			return this._requestBinary('POST', 'core', path, null, ['clientadmin'], obj, contenttype);
		},

		"clientsPublicList": function(callback) {
			var path = "/clientadm/public/";
			return this._requestPublic('core', path, callback);
		},

		"apigkList": function(callback) {
			var path = "/apigkadm/apigks/";
			return this._request('core', path, null, ['apigkadmin'], callback);
		},

		"apigkListByOrg": function(orgid, callback) {
			var path = "/apigkadm/apigks/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('core', path, null, ['clientadmin'], callback);
		},

		"apigkPublicList": function(callback) {
			var path = "/apigkadm/public";
			return this._requestPublic('core', path, callback);

		},

		"apigkRegister": function(obj, callback) {
			var path = "/apigkadm/apigks/";
			return this._requestObj('POST', 'core', path, null, ['apigkadmin'], obj, callback);
		},
		"apigkUpdate": function(obj, callback) {
			var path = "/apigkadm/apigks/" + obj.id;
			// delete obj.id;
			// var x = {name: obj.name};
			return this._requestObj('PATCH', 'core', path, null, ['apigkadmin'], obj, callback);
		},
		"apigkDelete": function(id, callback) {
			var path = "/apigkadm/apigks/" + id;
			return this._requestObj('DELETE', 'core', path, null, ['apigkadmin'], null, callback);
		},
		"apigkUpdateLogo": function(id, obj, callback) {
			var path = "/apigkadm/apigks/" + id + "/logo";
			var contenttype = obj.contenttype;
			console.log("File content type: " + contenttype);
			contenttype = "image/jpeg";
			return this._requestBinary('POST', 'core', path, null, ['apigkadmin'], obj, contenttype, callback);
		},
		"apigkCheck": function(id, callback) {
			var path = "/apigkadm/apigks/" + id + "/exists";
			return this._request('core', path, null, ['apigkadmin'], callback);
		},

		"apigkClientRequests": function(callback) {
			var owner = 'me';
			var path = "/apigkadm/apigks/owners/" + owner + "/clients/";
			return this._request('core', path, null, ['apigkadmin'], callback);
		},

		"apigkClientRequestsByOrg": function(orgid, callback) {
			var path = "/apigkadm/apigks/orgs/" + orgid + "/clients/";
			return this._request('core', path, null, ['apigkadmin'], callback);
		},

		"getGroups": function(callback) {
			var path = "/adhocgroups/";
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"getGroup": function(id, callback) {
			var path = "/adhocgroups/" + id;
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"getGroupInvited": function(id, token, callback) {
			var path = "/adhocgroups/" + id + '?invitation_token=' + encodeURIComponent(token);
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"getGroupDetails": function(id, callback) {
			var path = "/adhocgroups/" + id + "/details";
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"updateGroup": function(groupid, data, callback) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"addGroup": function(data, callback) {
			var path = "/adhocgroups/";
			return this._requestObj("POST", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"delGroup": function(groupid, callback) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], null, callback);
		},

		"getGroupMembers": function(groupid, callback) {
			var path = "/adhocgroups/" + groupid + "/members";
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"addGroupMember": function(groupid, token, type, callback) {
			var data = [{
				"token": token,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"updateGroupMember": function(groupid, userid, type, callback) {
			var data = [{
				"id": userid,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"delGroupMember": function(groupid, userid, callback) {
			var data = [userid];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"getGroupMemberships": function(callback) {
			var path = "/adhocgroups/memberships";
			return this._request('core', path, null, ['adhocgroupadmin'], callback);
		},

		"confirmGroupMembership": function(groupid, callback) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("PATCH", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},


		"joinGroupFromInvitation": function(groupid, token, callback) {
			var path = "/adhocgroups/" + groupid + "/invitation";
			var data = {
				"invitation_token": token
			};
			return this._requestObj("POST", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"leaveGroup": function(groupid, callback) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("DELETE", 'core', path, null, ['adhocgroupadmin'], data, callback);
		},

		"vootGroupsList": function(callback) {
			var path = "/groups/me/groups";
			return this._request('groups', path, null, ['groups'], callback);
		},
		"vootGroupsPublicList": function(callback) {
			var path = "/groups/groups";
			return this._request('groups', path, null, ['groups'], callback);
		},
		"vootGrouptypes": function(callback) {
			var path = "/groups/grouptypes";
			return this._request('groups', path, null, ['groups'], callback);
		},


		"authorizationsList": function(callback) {
			var path = "/authorizations/";
			return this._request('core', path, null, ['authzinfo'], callback);
		},

		"authorizationsDelete": function(id, callback) {
			var path = "/authorizations/" + id;
			return this._requestObj("DELETE", 'core', path, null, ['authzinfo'], null, callback);

		},

		"resources_owned": function() {
			var path = "/authorizations/resources_owned";
			return this._request('core', path, null, ['authzinfo']);
		},


		"withdrawconsent": function() {
			var path = "/authorizations/consent_withdrawn";
			return this._requestObj("POST", 'core', path, null, ['authzinfo'], null);
		},



		/*
		 * Section on implementing OAUth based requests...
		 */



		"_request": function(instance, endpoint, request, require, callback, inOptions) {
			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			if (this.config.debug) {
				console.log("About to perform a JSO OAuth request to " + instance + " [" + options.url + "]");
			}

			return this.jso.request(options);
		},


		"_requestObj": function(method, instance, endpoint, request, require, data, callback, inOptions) {
			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			options.type = method;
			options.data = JSON.stringify(data, undefined, 2);
			options.contentType = 'application/json; charset=UTF-8';
			if (this.config.debug) {
				console.log("About to perform a JSO OAuth request to " + instance + " [" + options.url + "]");
			}
			return this.jso.request(options);
		},



		// this._requestBinary('POST', 'core', path, null, ['clientadmin'], obj, contenttype);
		"_requestBinary": function(method, instance, endpoint, request, require, data, contentType, callback, inOptions) {

			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			options.type = method;
			options.data = data;
			options.contentType = contentType;
			options.processData = false;
			// console.log("About to perform a JSO OAuth request to " + instance, options);
			return this.jso.request(options);
		},



		"_customRequest": function(url, request, require, callback) {
			var that = this;
			console.log("About to perform a JSO OAuth request to [" + url + "]");

			return this.jso.ajax({
				url: url,
				oauth: {
					scopes: {
						request: request,
						require: require
					}
				},
				dataType: 'json'
			});
		},



		"_requestPublic": function(instance, endpoint, callback) {

			var that = this;
			var url = this.config.apis[instance] + endpoint;
			if (this.config.debug) {
				console.log("About to perform a public request to " + instance + " [" + url + "]");
			}
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: url,
					dataType: 'json',
					success: function(data) {
						if (typeof callback === 'function') {
							callback(data);
						}
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
							} catch (err) {}
						}
						reject(new Error(str));
					}
				});
			});
		}

	});



	exports.FeideConnect = FeideConnect;

});