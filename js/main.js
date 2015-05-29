requirejs.config({
	baseUrl: "js",
	packages: [
		{
			name: "databindings",
			location: "//rawgit.com/OHDSI/Circe/multihomed/js/modules/databindings"
		},
		{
			name: "circe",
			location: "//rawgit.com/OHDSI/Circe/multihomed/js/modules/circe"
		}
	],	
	config: {
		text: {
			useXhr: function (url, protocol, hostname, port) {
				return true;
			}
		}
	},
	paths: {
		// application configuration
		"appConfig" : "config",
		// 3rd party libs
		"jquery": "http://cdn.rawgit.com/jquery/jquery/1.11.2/dist/jquery.min",
		"jquery-ui": "jqueryui/jquery-ui.min",
		"d3": "http://cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min",
		"knockout": "http://cdn.rawgit.com/knockout/knockout/v3.3.0/dist/knockout",
		"databindings/knockout.selectOnFocus": "http://cdn.rawgit.com/One-com/knockout-select-on-focus/v0.1.5/lib/knockout.selectOnFocus",
		"datatables": "jqueryui/jquery.dataTables.min",
		// OHDSI components
		"cohortbuilder": "http://rawgit.com/OHDSI/Circe/multihomed/js/modules/cohortbuilder",
		"conceptsetbuilder": "http://rawgit.com/OHDSI/Circe/multihomed/js/modules/conceptsetbuilder",
		"feasibilitystudy": "modules/feasibilitystudy",
		"webapi" : "http://rawgit.com/OHDSI/Circe/multihomed/js/modules/WebAPIProvider",
		
		"vocabularyprovider": "http://rawgit.com/OHDSI/Circe/multihomed/js/modules/WebAPIProvider/VocabularyProvider",
		// plugins
		"text": "requirejs/plugins/text",
		"css": "requirejs/plugins/css",
		"json": "requirejs/plugins/json",
		"ColVis": "jqueryui/dataTables.colVis.min"
	},
	map: {
		"*": {
			"webapi/FeasibilityAPI" : "modules/WebAPIProvider/FeasibilityAPI",
		}
	},
	deps: ['jquery',
				 'jquery-ui',
				 'jqueryui/jquery.ui.autocomplete.scroll',
				 'css!jqueryui/jquery.dataTables.css',
				 'css!jqueryui/dataTables.colVis.css'
				]
});

require(['jquery','knockout', 'app', ], function ($, ko, App) {
	var calypsoApp = new App();
	ko.applyBindings(calypsoApp, document.getElementById('wrapper'));
	calypsoApp.refreshList().then(function (){
		calypsoApp.selectedView("list");
	});

	$(window).bind('beforeunload', function () {
			if (calypsoApp.selectedStudy() &&  calypsoApp.dirtyFlag() && calypsoApp.dirtyFlag().isDirty())
					return "Changes will be lost if you do not save.";	
	});
});