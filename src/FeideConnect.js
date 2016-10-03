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
			"apigkadm": "https://api.dataporten.no/apigkadm",
			"clientadm": "https://api.dataporten.no/clientadm",
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
			if (!("clientadm" in this.config.apis)) {
				this.config.apis.clientadm = this.config.apis.core + '/clientadm';
			}
			if (!("apigkadm" in this.config.apis)) {
				this.config.apis.clientadm = this.config.apis.core + '/apigkadm';
			}
		},

		"logout": function() {
			this._super();
			var url = this.config.apis.auth + '/logout';
			window.location = url;
		},

		"getUserInfo": function() {
			return this._request('auth', '/userinfo');
		},


		"psOrgs": function() {
			var path = "peoplesearch/orgs";
			return this._request('core', '/peoplesearch/orgs');
		},

		"psSearch": function(realm, query) {
			var path = "/peoplesearch/search/" + realm + "/" + encodeURI(query);
			return this._request('core', path);
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

		"orgLDAPStatus": function(orgid) {
			var path = '/orgs/' + orgid + '/ldap_status';
			return this._request('core', path);
		},

		"getMandatoryClients": function(orgid) {
			var path = "/orgs/" + orgid + "/mandatory_clients/";
			return this._request('core', path);
		},

		"setMandatoryClient": function(orgid, clientid) {
			var path = "/orgs/" + orgid + "/mandatory_clients/" + clientid;
			return this._requestObj('PUT', 'core', path, null);
		},

		"removeMandatoryClient": function(orgid, clientid) {
			var path = "/orgs/" + orgid + "/mandatory_clients/" + clientid;
			return this._requestObj('DELETE', 'core', path, null);
		},

		"orgServiceAdd": function(orgid, service) {
			var path = "/orgs/" + orgid + "/services/" + service;
			return this._requestObj('PUT', 'core', path, null);
		},

		"orgServiceRemove": function(orgid, service) {
			var path = "/orgs/" + orgid + "/services/" + service;
			return this._requestObj('DELETE', 'core', path, null);
		},

		"getClientPolicy": function(id) {
			var path = "/policy";
			return this._request('clientadm', path);
		},

		"getOrgTargetedAPIs": function(orgid) {
			var path = '/realmclients/targetrealm/' + orgid + '/';
			return this._request('clientadm', path);
		},

		"updateOrgAuthorizations": function(realm, clientid, data) {
			var path = '/clients/' + clientid + '/orgauthorization/' + realm;
			return this._requestObj("PATCH", 'clientadm', path, data);
		},

		"getClient": function(id) {
			var path = "/clients/" + id;
			return this._request('clientadm', path);
		},

		"getClientStats": function(id, params) {
			var path = "/clients/" + id + '/logins_stats/' + FeideConnect.buildQuery(params);
			return this._request('clientadm', path);
		},

		"clientsList": function() {
			var path = "/clients/";
			return this._request('clientadm', path);
		},

		"clientsByScope": function(scope) {
			var path = "/clients/?scope=" + encodeURIComponent(scope);
			return this._request('clientadm', path);
		},

		"clientsByOrg": function(orgid) {
			var path = "/clients/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('clientadm', path);
		},

		"clientsRegister": function(obj) {
			var path = "/clients/";
			return this._requestObj('POST', 'clientadm', path, obj);
		},

		"clientsUpdate": function(obj) {
			var path = "/clients/" + obj.id;
			return this._requestObj('PATCH', 'clientadm', path, obj);
		},

		"clientsAuthorizeAPIGKscopes": function(id, obj) {
			var path = "/clients/" + id + "/gkscopes";
			return this._requestObj('PATCH', 'clientadm', path, obj);
		},

		"clientsDelete": function(clientid) {
			var path = "/clients/" + clientid;
			return this._requestObj('DELETE', 'clientadm', path, null);
		},

		"clientsUpdateLogo": function(id, obj) {
			var path = "/clients/" + id + "/logo";
			var contenttype = "image/jpeg";
			if (obj.type) {
				contenttype = obj.type;
			}
			return this._requestBinary('POST', 'clientadm', path, obj, contenttype);
		},

		"clientsPublicList": function() {
			var path = "/public/";
			return this._requestPublic('clientadm', path);
		},

		"getAPIGK": function(id) {
			var path = "/apigks/" + id;
			return this._request('apigkadm', path);
		},

		"apigkList": function() {
			var path = "/apigks/";
			return this._request('apigkadm', path);
		},

		"apigkListByOrg": function(orgid) {
			var path = "/apigks/";
			if (orgid !== null) {
				path += "?organization=" + encodeURIComponent(orgid);
			}
			return this._request('apigkadm', path);
		},

		"apigkPublicList": function() {
			var path = "/public";
			return this._requestPublic('apigkadm', path);
		},

		"apigkRegister": function(obj) {
			var path = "/apigks/";
			return this._requestObj('POST', 'apigkadm', path, obj);
		},

		"apigkUpdate": function(obj) {
			var path = "/apigks/" + obj.id;
			// delete obj.id;
			// var x = {name: obj.name};
			return this._requestObj('PATCH', 'apigkadm', path, obj);
		},

		"apigkDelete": function(id) {
			var path = "/apigks/" + id;
			return this._requestObj('DELETE', 'apigkadm', path, null);
		},

		"apigkUpdateLogo": function(id, obj) {
			var path = "/apigks/" + id + "/logo";
			var contenttype = obj.contenttype;
			console.log("File content type: " + contenttype);
			contenttype = "image/jpeg";
			return this._requestBinary('POST', 'apigkadm', path, obj, contenttype);
		},

		"apigkCheck": function(id) {
			var path = "/apigks/" + id + "/exists";
			return this._request('apigkadm', path);
		},

		"apigkClientRequests": function() {
			var owner = 'me';
			var path = "/apigks/owners/" + owner + "/clients/";
			return this._request('apigkadm', path);
		},

		"apigkClientRequestsByOrg": function(orgid) {
			var path = "/apigks/orgs/" + orgid + "/clients/";
			return this._request('apigkadm', path);
		},

		"getGroups": function() {
			var path = "/adhocgroups/";
			return this._request('core', path);
		},

		"getGroup": function(id) {
			var path = "/adhocgroups/" + id;
			return this._request('core', path);
		},

		"getGroupInvited": function(id, token) {
			var path = "/adhocgroups/" + id + '?invitation_token=' + encodeURIComponent(token);
			return this._request('core', path);
		},

		"getGroupDetails": function(id) {
			var path = "/adhocgroups/" + id + "/details";
			return this._request('core', path);
		},

		"updateGroup": function(groupid, data) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("PATCH", 'core', path, data);
		},

		"addGroup": function(data) {
			var path = "/adhocgroups/";
			return this._requestObj("POST", 'core', path, data);
		},

		"delGroup": function(groupid) {
			var path = "/adhocgroups/" + groupid;
			return this._requestObj("DELETE", 'core', path, null);
		},

		"getGroupMembers": function(groupid) {
			var path = "/adhocgroups/" + groupid + "/members";
			return this._request('core', path);
		},

		"addGroupMember": function(groupid, token, type) {
			var data = [{
				"token": token,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, data);
		},

		"updateGroupMember": function(groupid, userid, type) {
			var data = [{
				"id": userid,
				"type": type
			}];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("PATCH", 'core', path, data);
		},

		"delGroupMember": function(groupid, userid) {
			var data = [userid];
			var path = "/adhocgroups/" + groupid + "/members";
			return this._requestObj("DELETE", 'core', path, data);
		},

		"getGroupMemberships": function() {
			var path = "/adhocgroups/memberships";
			return this._request('core', path);
		},

		"confirmGroupMembership": function(groupid) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("PATCH", 'core', path, data);
		},

		"joinGroupFromInvitation": function(groupid, token) {
			var path = "/adhocgroups/" + groupid + "/invitation";
			var data = {
				"invitation_token": token
			};
			return this._requestObj("POST", 'core', path, data);
		},

		"leaveGroup": function(groupid) {
			var path = "/adhocgroups/memberships";
			var data = [groupid];
			return this._requestObj("DELETE", 'core', path, data);
		},

		"vootGroupsList": function() {
			var path = "/groups/me/groups";
			return this._request('groups', path);
		},

		"vootGroupsPublicList": function() {
			var path = "/groups/groups";
			return this._request('groups', path);
		},

		"vootGrouptypes": function() {
			var path = "/groups/grouptypes";
			return this._request('groups', path);
		},

		"authorizationsList": function() {
			var path = "/authorizations/";
			return this._request('core', path);
		},

		"authorizationsDelete": function(id) {
			var path = "/authorizations/" + id;
			return this._requestObj("DELETE", 'core', path, null);
		},

		"resources_owned": function() {
			var path = "/authorizations/resources_owned";
			return this._request('core', path);
		},

		"withdrawconsent": function() {
			var path = "/authorizations/consent_withdrawn";
			return this._requestObj("POST", 'core', path, null);
		},

		"getMyMandatoryClients": function(orgid) {
			var path = '/authorizations/mandatory_clients/';
			return this._request('core', path);
		},

		/*
		 * Section on implementing OAuth based requests...
		 */

		"_request": function(instance, endpoint, inOptions) {
			var options = inOptions || {};
			options.url = this.config.apis[instance] + endpoint;
			if (this.config.debug) {
				console.log("About to perform a JSO OAuth request to " + instance + " [" + options.url + "]");
			}

			return this.jso.request(options);
		},

		"_requestObj": function(method, instance, endpoint, data, inOptions) {
			var options = inOptions || {};
			options.type = method;
			options.data = JSON.stringify(data, undefined, 2);
			options.contentType = 'application/json; charset=UTF-8';
			return this._request(instance, endpoint, options);
		},

		"_requestBinary": function(method, instance, endpoint, data, contentType, inOptions) {

			var options = inOptions || {};
			options.type = method;
			options.data = data;
			options.contentType = contentType;
			options.processData = false;
			return this._request(instance, endpoint, options);
		},

		"_requestPublic": function(instance, endpoint) {

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
	};

	exports.FeideConnect = FeideConnect;

});
