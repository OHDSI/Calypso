define(function (require, exports) {

	var $ = require('jquery');
	var config = require('appConfig');
	
	function pruneJSON(key, value) {
		if (value === 0 || value) {
			return value;
		} else {
			return
		}
	}
	
	function getStudyList() {
		var promise = $.ajax({
			url: config.webAPIRoot + 'feasibility/'
		});
		return promise;
	}
	
	function saveStudy(study) {
		var savePromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (study.id || ""),
			method: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify(study),
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return savePromise;
	}
	
	function copyStudy(id) {
		var copyPromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (id || "") +"/copy",
			method: 'GET',
			contentType: 'application/json',
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return copyPromise;
	}	
	
	function deleteStudy(id) {
		var deletePromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (id || ""),
			method: 'DELETE',
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return deletePromise;
	}		
	
	function getStudy(id) {
		var loadPromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + id,
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return loadPromise;	
	}
	
	function generate(id, sourceKey) {
		var generatePromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (id || '-1') + '/generate/' + sourceKey,
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return generatePromise;
	}

	function getInfo(id) {
		var infoPromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (id || '-1') + '/info',
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return infoPromise;
	}
	
	function getReport(id, sourceKey) {
		var reportPromise = $.ajax({
			url: config.webAPIRoot + 'feasibility/' + (id || '-1') + '/report/' + sourceKey,
			error: function (error) {
				console.log("Error: " + error);
			}
		});
		return reportPromise;
	}	
	
	
	var api = {
		getStudyList: getStudyList,
		saveStudy: saveStudy,
		copyStudy: copyStudy,
		deleteStudy: deleteStudy,
		getStudy: getStudy,
		generate: generate,
		getInfo: getInfo,
		getReport: getReport
	}

	return api;
});