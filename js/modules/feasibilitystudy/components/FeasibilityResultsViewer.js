define(['knockout',
				'jquery',
				'text!./FeasibilityResultsViewerTemplate.html',
				'webapi/FeasibilityAPI',
				'./GenerateComponentSmall',
				'databindings/eventListenerBinding',
				'./FeasibilityReportViewer'
			 ],
	function (
		ko,
		$,
		template,
		feasibilityAPI,
		generateComponentSmall) {

		ko.components.register('generate-component-small', generateComponentSmall);
	
		var x;

		function FeasibilityResultsViewer(params) {
			var self = this;
			
			self.sources = params.sources;
			self.dirtyFlag = params.dirtyFlag;
			self.selectedSource = ko.observable();
			self.selectedReport = ko.observable();
			
			// viewmodel behaviors
			
			self.selectSource = function(source)
			{
				if (source.info()) {
					self.selectedSource(null);
					feasibilityAPI.getReport(source.info().generationInfo.id.studyId, source.source.sourceKey).then(function(report) {
						self.selectedSource(source);
						self.selectedReport(report);
					});
				}
			}
		}

		var component = {
			viewModel: FeasibilityResultsViewer,
			template: template
		};

		ko.components.register('feasibility-results-viewer', component);

		// return compoonent definition
		return component;
	});
