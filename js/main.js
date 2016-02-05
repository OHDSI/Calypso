requirejs.config({
	baseUrl: "js",
	packages: [
		{
			name: "databindings",
			location: "modules/databindings"
		},
		{
			name: "circe",
			location: "modules/circe"
		},
		{
			name: "cohortdefinitionviewer",
			location: "modules/cohortdefinitionviewer"
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
		"jquery": "https://code.jquery.com/jquery-1.11.2",
		"jquery-ui": "https://code.jquery.com/ui/1.11.4/jquery-ui.min",
		"d3": "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.8/d3.min",
		"knockout": "https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min",
		"ko.sortable": "https://cdnjs.cloudflare.com/ajax/libs/knockout-sortable/0.11.0/knockout-sortable",
		"director": "https://cdnjs.cloudflare.com/ajax/libs/Director/1.2.8/director.min",
		"datatables": "https://cdn.datatables.net/1.10.10/js/jquery.dataTables.min",
		"datatables.net": "https://cdn.datatables.net/1.10.12/js/jquery.dataTables.min",
		"datatables.net-buttons" : "https://cdn.datatables.net/buttons/1.2.2/js/dataTables.buttons.min",
		"datatables.net-buttons-html5" : "https://cdn.datatables.net/buttons/1.2.2/js/buttons.html5.min",		
		"lodash": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.16.4/lodash.min",
		"d3_tip": "modules/d3.tip",
		"lz-string": "modules/lz-string",
		// OHDSI components
		"cohortbuilder": "modules/cohortbuilder",
		"conceptpicker": "modules/conceptpicker",
		"conceptsetbuilder": "modules/conceptsetbuilder",
		"crossfilter": "modules/crossfilter",
		"feasibilitystudy": "modules/feasibilitystudy",
		"webapi" : "modules/WebAPIProvider",
		"facets": "modules/facets",
		"faceted-datatable": "modules/faceted-datatable",
		"vocabularyprovider": "modules/WebAPIProvider/VocabularyProvider",
		"jnj_chart": "modules/jnj.chart",
		"ohdsi.util": "modules/ohdsi.util",
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
			'jquery-ui/sortable' : 'jquery-ui',
			'jquery-ui/draggable' : 'jquery-ui',
			'jquery-ui/dialog' : 'jquery-ui',
			'jquery-ui/autocomplate': 'jquery-ui',
			'jquery-ui/tabs': 'jquery-ui',
			'knockout.dataTables.binding': 'databindings/datatableBinding',
			'colvis': 'ColVis'
		}
	},
	deps: ['jquery',
				 'jquery-ui',
				 'jqueryui/jquery.ui.autocomplete.scroll',
				 'css!//cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css',
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