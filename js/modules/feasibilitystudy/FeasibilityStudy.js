define(function (require, exports) {

	var ko = require('knockout');
	var CohortExpression = require('cohortbuilder/CohortExpression');
	var InclusionRule = require('./InclusionRule');

	function FeasibilityStudy(data) {
		
		var self = this;
		var data = data || {};

		self.id = ko.observable(data.id || null);
		self.name = ko.observable(data.name || null);
		self.description = ko.observable(data.description || null);
		self.indexCohortId = ko.observable(data.indexCohortId || null);
		self.matchingCohortId = ko.observable(data.matchingCohortId || null);
		
		self.indexRule = ko.observable(new CohortExpression(data.indexRule));
		self.indexDescription = ko.observable(data.indexDescription || null);
		self.inclusionRules = ko.observableArray(data.inclusionRules && data.inclusionRules.map(function (inclusionRule) {
			return new InclusionRule(inclusionRule);
		}));
	}
	return FeasibilityStudy;
});