define(function (require, exports) {

	var ko = require('knockout');
	var CohortDefinition = require('cohortbuilder/CohortDefinition');
	var InclusionRule = require('./InclusionRule');

	function FeasibilityStudy(data) {
		
		var self = this;
		var data = data || {};

		self.id = ko.observable(data.id || null);
		self.name = ko.observable(data.name || null);
		self.description = ko.observable(data.description || null);
		self.phaseId = ko.observable(data.PhaseId || null);
		self.sampleSize = ko.observable(data.SampleSize || null);
		self.documentUrl = ko.observable(data.DocumentUrl || null);
		self.clinicalTrialsIdentifier = ko.observable(data.ClinicalTrialsIdentifier || null);
		
		self.indexRule = new CohortDefinition(data.indexRule);
		self.inclusionRules = ko.observableArray(data.inclusionRules && data.inclusionRules.map(function (inclusionRule) {
			return new InclusionRule(inclusionRule);
		}));
	}
	return FeasibilityStudy;
});