requirejs.config({
	baseUrl: "js",
	packages: [
		{
			name: "databindings",
			location: "//rawgit.com/OHDSI/Circe/master/js/modules/databindings"
		},
		{
			name: "circe",
			location: "//rawgit.com/OHDSI/Circe/master/js/modules/circe"
		},
		{
			name: "cohortdefinitionviewer",
			location: "//rawgit.com/OHDSI/Circe/master/js/modules/cohortdefinitionviewer"
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
		"jquery": "//cdn.rawgit.com/jquery/jquery/1.11.2/dist/jquery.min",
		"jquery-ui": "jqueryui/jquery-ui.min",
		"d3": "//cdn.rawgit.com/mbostock/d3/v3.5.5/d3.min",
		"knockout": "//cdn.rawgit.com/knockout/knockout/v3.3.0/dist/knockout",
		"director": "director.1.2.6.min",
		"databindings/knockout.selectOnFocus": "//cdn.rawgit.com/One-com/knockout-select-on-focus/v0.1.5/lib/knockout.selectOnFocus",
		"datatables": "jqueryui/jquery.dataTables.min",
		// OHDSI components
		"cohortbuilder": "//rawgit.com/OHDSI/Circe/master/js/modules/cohortbuilder",
		"conceptpicker": "//rawgit.com/OHDSI/Circe/master/js/modules/conceptpicker",
		"conceptsetbuilder": "//rawgit.com/OHDSI/Circe/master/js/modules/conceptsetbuilder",
		"feasibilitystudy": "modules/feasibilitystudy",
		"webapi" : "//rawgit.com/OHDSI/Circe/master/js/modules/WebAPIProvider",
		
		"vocabularyprovider": "//rawgit.com/OHDSI/Circe/master/js/modules/WebAPIProvider/VocabularyProvider",
		// plugins
		"text": "requirejs/plugins/text",
		"css": "requirejs/plugins/css",
		"json": "requirejs/plugins/json",
		"ColVis": "jqueryui/dataTables.colVis.min"
	},
	shim: { 
		"director": { exports: "Router" } 
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

require(['jquery','knockout', 'app', 'director' ], function ($, ko, App, Router) {
	var calypsoApp = new App();
	ko.applyBindings(calypsoApp, document.getElementById('wrapper'));
	
	var router = Router(calypsoApp.routes);
	router.init('/');
	calypsoApp.router = router;

	$(window).bind('beforeunload', function () {
			if (calypsoApp.selectedStudy() &&  calypsoApp.dirtyFlag() && calypsoApp.dirtyFlag().isDirty())
					return "Changes will be lost if you do not save.";	
	});
});