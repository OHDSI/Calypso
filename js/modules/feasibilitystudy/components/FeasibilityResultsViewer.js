define(['knockout',
				'jquery',
				'text!./FeasibilityResultsViewerTemplate.html',
				'webapi/FeasibilityAPI',
				'databindings/eventListenerBinding',
				'circe',
				'./FeasibilityReportViewer'
			 ],
	function (
		ko,
		$,
		template,
		feasibilityAPI) {

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
				self.selectedSource(null);
				if (source.info()) {
					feasibilityAPI.getReport(source.info().id.studyId, source.source.sourceKey).then(function(report) {
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
