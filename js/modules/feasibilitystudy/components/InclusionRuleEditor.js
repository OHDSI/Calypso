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
		self.IndexRule = params.IndexRule;
	}
	
	var component =  {
		viewModel: InclusionRuleEditor,
		template: template
	};		

	ko.components.register('feasibility-inclusion-rule-editor', component);
	
	// return compoonent definition
	return component;
});