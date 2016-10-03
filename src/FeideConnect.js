define(function(require, exports, module) {

	"use strict";

	var
		JSO = require('bower/jso/src/jso'),
		OpenIDAuthentication = require('bower/jso/src/Authentication/OpenIDAuthentication'),
		$ = require('jquery');


	var fcDataporten = {
		providerId: "dataporten-prod",
		authorization: "https://auth.dataporten.no/oauth/authorization",
		token: "https://auth.dataporten.no/oauth/token",
		apis: {
			"auth": "https://auth.dataporten.no",
			"core": "https://api.dataporten.no",
			"groups": "https://groups-api.dataporten.no"
		},
		userInfo: "https://auth.dataporten.no/userinfo",
		"debug": false
	};


	var FeideConnect = OpenIDAuthentication.extend({
		"init": function(config) {
			var defaults = {
				"debug": false
			};

			var that = this;


			var selectedConfig = {};

			if (config.instance && config.instance === 'dataporten') {
				selectedConfig = fcDataporten;
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
			return this._request('auth', '/userinfo');
		},


		"psOrgs": function(callback) {
			var path = "peoplesearch/orgs";
			return this._request('core', '/peoplesearch/orgs', callback);
		},

		"psSearch": function(realm, query, callback) {
			var path = "/peoplesearch/search/" + realm + "/" + encodeURI(query);
			return this._request('core', path, callback);
		},




		"getOrgs": function(inFilters) {
			var path = "/orgs/";
			var filters = inFilters || {};
			if (!$.isEmptyObject(filters)) {
				path = path + '?' + $.param(filters);
			}
			return this._requestPublic('core', path);
		},
		
		"getOrg": function(orgid) {
			var path = "/orgs/" + orgid;
			return this._requestPublic('core', path);
		},

		"updateOrg": function(orgid, data) {
			var path = "/orgs/" + orgid;
			return this._requestObj("PATCH", 'core', path, data);
		},

		"orgUpdateLogo": function(orgid, obj) {
			var path = "/orgs/" + orgid + '/logo';
			var contenttype = "image/png";
			// alert("UPDATE LOGO");
			if (obj.type) {
				contenttype = obj.type;
			}
			return this._requestBinary('POST', 'core', path, obj, contenttype);
		},

		"getMandatoryClients": function(orgid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/";
			return this._request('core', path, callback);
		},
		"setMandatoryClient": function(orgid, clientid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/" + clientid;
			return this._requestObj('PUT', 'core', path, null, callback);
		},
		"removeMandatoryClient": function(orgid, clientid, callback) {
			var path = "/orgs/" + orgid + "/mandatory_clients/" + clientid;
			return this._requestObj('DELETE', 'core', path, null, callback);
		},

		"orgServiceAdd": function(orgid, service) {
			var path = "/orgs/" + orgid + "/services/" + service;
			return this._requestObj('PUT', 'core', path, null);
		},
		"orgServiceRemove": function(orgid, service) {
			var path = "/orgs/" + orgid + "/services/" + service;
			return this._requestObj('DELETE', 'core', path, null);
		},


		"getClientPolicy": function(id, callback) {
			var path = "/clientadm/policy";
			return this._request('core', path, callback);
		},

		"getOrgTargetedAPIs": function(orgid) {
			var path = '/clientadm/realmclients/targetrealm/' + orgid + '/';
			return this._request('core', path);
		},

		"updateOrgAuthorizations": function(realm, clientid, data) {
			var path = '/clientadm/clients/' + clientid + '/orgauthorization/' + realm;
			return this._requestObj("PATCH", 'core', path, data);
		},

		"getClient": function(id, callback) {
			var path = "/clientadm/clients/" + id;
			return this._request('core', path, callback);
		},

		"getClientStats": function(id, params) {
			var path = "/clientadm/clients/" + id + '/logins_stats/' + FeideConnect.buildQuery(params);
			return this._request('core', path, undefined, {});
		},


		"getMyMandatoryClients": function(orgid) {
			var path = '/authorizations/mandatory_clients/';
			return this._request('core', path);
		},

		"clientsList": function(callback) {
			var path = "/clientadm/clients/";
			return this._request('core', path, callback);
		},

		"clientsByScope": function(scope, callback) {
			var path = "/clientadm/clients/?scope=" + encodeURIComponent(scope);
			return this._request('core', path, callback);
		},

		"clientsByOrg": function(orgid, callback) {
			var path = "/clientadm/clients/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('core', path, callback);
		},

		"clientsRegister": function(obj, callback) {
			var path = "/clientadm/clients/";
			return this._requestObj('POST', 'core', path, obj, callback);
		},

		"clientsUpdate": function(obj, callback) {
			var path = "/clientadm/clients/" + obj.id;
			return this._requestObj('PATCH', 'core', path, obj, callback);
		},

		"clientsAuthorizeAPIGKscopes": function(id, obj, callback) {
			var path = "/clientadm/clients/" + id + "/gkscopes";
			return this._requestObj('PATCH', 'core', path, obj, callback);
		},

		"clientsDelete": function(clientid, callback) {
			var path = "/clientadm/clients/" + clientid;
			return this._requestObj('DELETE', 'core', path, null, callback);
		},

		"clientsUpdateLogo": function(id, obj) {
			var path = "/clientadm/clients/" + id + "/logo";
			var contenttype = "image/jpeg";
			if (obj.type) {
				contenttype = obj.type;
			}
			return this._requestBinary('POST', 'core', path, obj, contenttype);
		},

		"clientsPublicList": function(callback) {
			var path = "/clientadm/public/";
			return this._requestPublic('core', path, callback);
		},


		"getAPIGK": function(id, callback) {
			var path = "/apigkadm/apigks/" + id;
			return this._request('core', path, callback);
		},

		"apigkList": function(callback) {
			var path = "/apigkadm/apigks/";
			return this._request('core', path, callback);
		},

		"apigkListByOrg": function(orgid, callback) {
			var path = "/apigkadm/apigks/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('core', path, callback);
		},

		"apigkPublicList": function(callback) {
			var path = "/apigkadm/public";
			return this._requestPublic('core', path, callback);

		},

		"apigkRegister": function(obj, callback) {
			var path = "/apigkadm/apigks/";
			return this._requestObj('POST', 'core', path, obj, callback);
		},
		"apigkUpdate": function(obj, callback) {
			var path = "/apigkadm/apigks/" + obj.id;
			// delete obj.id;
			// var x = {name: obj.name};
			return this._requestObj('PATCH', 'core', path, obj, callback);
		},
		"apigkDelete": function(id, callback) {
			var path = "/apigkadm/apigks/" + id;
			return this._requestObj('DELETE', 'core', path, null, callback);
		},
		"apigkUpdateLogo": function(id, obj, callback) {
			var path = "/apigkadm/apigks/" + id + "/logo";
			var contenttype = obj.contenttype;
			console.log("File content type: " + contenttype);
			contenttype = "image/jpeg";
			return this._requestBinary('POST', 'core', path, obj, contenttype, callback);
		},
		"apigkCheck": function(id, callback) {
			var path = "/apigkadm/apigks/" + id + "/exists";
			return this._request('core', path, callback);
		},

		"apigkClientRequests": function(callback) {
			var owner = 'me';
			var path = "/apigkadm/apigks/owners/" + owner + "/clients/";
			return this._request('core', path, callback);
		},

		"apigkClientRequestsByOrg": function(orgid, callback) {
			var path = "/apigkadm/apigks/orgs/" + orgid + "/clients/";
			return this._request('core', path, callback);
		},

		"getGroups": function(callback) {
			var path = "/adhocgroups/";
			return this._request('core', path, callback);
		},

		"getGroup": function(id, callback) {
			var path = "/adhocgroups/" + id;
			return this._request('core', path, callback);
		},

		"getGroupInvited": function(id, token, callback) {
			var path = "/adhocgroups/" + id + '?invitation_token=' + encodeURIComponent(token);
			return this._request('core', path, callback);
		},

		"getGroupDetails": function(id, callback) {
			var path = "/adhocgroups/" + id + "/details";
			return this._request('core', path, callback);
		},

		"updateGroup": function(groupid, data, callback) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("PATCH", 'core', path, data, callback);
		},

		"addGroup": function(data, callback) {
			var path = "/adhocgroups/";
			return this._requestObj("POST", 'core', path, data, callback);
		},

		"delGroup": function(groupid, callback) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("DELETE", 'core', path, null, callback);
		},

		"getGroupMembers": function(groupid, callback) {
			var path = "/adhocgroups/" + groupid + "/members";
			return this._request('core', path, callback);
		},

		"addGroupMember": function(groupid, token, type, callback) {
			var data = [{
				"token": token,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, data, callback);
		},

		"updateGroupMember": function(groupid, userid, type, callback) {
			var data = [{
				"id": userid,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, data, callback);
		},

		"delGroupMember": function(groupid, userid, callback) {
			var data = [userid];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("DELETE", 'core', path, data, callback);
		},

		"getGroupMemberships": function(callback) {
			var path = "/adhocgroups/memberships";
			return this._request('core', path, callback);
		},

		"confirmGroupMembership": function(groupid, callback) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("PATCH", 'core', path, data, callback);
		},


		"joinGroupFromInvitation": function(groupid, token, callback) {
			var path = "/adhocgroups/" + groupid + "/invitation";
			var data = {
				"invitation_token": token
			};
			return this._requestObj("POST", 'core', path, data, callback);
		},

		"leaveGroup": function(groupid, callback) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("DELETE", 'core', path, data, callback);
		},

		"vootGroupsList": function(callback) {
			var path = "/groups/me/groups";
			return this._request('groups', path, callback);
		},
		"vootGroupsPublicList": function(callback) {
			var path = "/groups/groups";
			return this._request('groups', path, callback);
		},
		"vootGrouptypes": function(callback) {
			var path = "/groups/grouptypes";
			return this._request('groups', path, callback);
		},


		"authorizationsList": function(callback) {
			var path = "/authorizations/";
			return this._request('core', path, callback);
		},

		"authorizationsDelete": function(id, callback) {
			var path = "/authorizations/" + id;
			return this._requestObj("DELETE", 'core', path, null, callback);

		},

		"resources_owned": function() {
			var path = "/authorizations/resources_owned";
			return this._request('core', path);
		},


		"withdrawconsent": function() {
			var path = "/authorizations/consent_withdrawn";
			return this._requestObj("POST", 'core', path, null);
		},



		/*
		 * Section on implementing OAuth based requests...
		 */

		"_request": function(instance, endpoint, callback, inOptions) {
			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			if (this.config.debug) {
				console.log("About to perform a JSO OAuth request to " + instance + " [" + options.url + "]");
			}

			return this.jso.request(options);
		},


		"_requestObj": function(method, instance, endpoint, data, callback, inOptions) {
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



		"_requestBinary": function(method, instance, endpoint, data, contentType, callback, inOptions) {

			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			options.type = method;
			options.data = data;
			options.contentType = contentType;
			options.processData = false;
			// console.log("About to perform a JSO OAuth request to " + instance, options);
			return this.jso.request(options);
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

	FeideConnect.buildQuery = function(params) {
		if (params === null) {
			return '';
		}
		if (typeof params === 'undefined') {
			return '';
		}

		var pl = [];
		for(var key in params) {
			pl.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
		}
		return '?' + pl.join('&');
	}

	exports.FeideConnect = FeideConnect;

});
