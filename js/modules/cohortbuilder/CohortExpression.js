define(function (require, exports) {

	var ko = require('knockout');
	var CriteriaGroup = require('./CriteriaGroup');
	var ConceptSet = require('./InputTypes/ConceptSet');
	var PrimaryCriteria = require('./PrimaryCriteria');

	function CohortExpression(data) {
		var self = this;
		var data = data || {};

		self.PrimaryCriteria = ko.observable(new PrimaryCriteria(data.PrimaryCriteria));
		self.AdditionalCriteria = ko.observable(data.AdditionalCriteria && new CriteriaGroup(data.AdditionalCriteria));
		self.ConceptSets = ko.observableArray(data.ConceptSets && data.ConceptSets.map(function(d) { return new ConceptSet(d) }));
		self.ExpressionLimit =  { Type: ko.observable(data.ExpressionLimit && data.ExpressionLimit.Type || "All") }
		
	}
	return CohortExpression;
});