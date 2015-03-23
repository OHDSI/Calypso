define(['knockout',
				'text!./InclusionRuleEditorTemplate.html', 
				'cohortbuilder/components/CriteriaGroup', 
				'bindings/jqAutosizeBinding'], 
function (
ko,
template) {

	function InclusionRuleEditor(params) {
		var self = this;
		self.InclusionRule = params.InclusionRule;
		self.IndexRule = ko.utils.unwrapObservable(params.IndexRule);
	}
	
	var component =  {
		viewModel: InclusionRuleEditor,
		template: template
	};		

	ko.components.register('inclusion-rule-editor', component);
	
	// return compoonent definition
	return component;
});