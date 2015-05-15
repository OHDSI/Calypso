define(['knockout',
				'appConfig',
				'feasibilitystudy/FeasibilityStudy',
				'cohortbuilder/CohortDefinition',
				'cohortbuilder/CohortExpression',
				'cohortbuilder/CriteriaGroup',
				'webapi/CohortDefinitionAPI',
				'webapi/FeasibilityAPI',
				'feasibilitystudy/InclusionRule',
				'feasibilitystudy/components/InclusionRuleEditor',
				'feasibilitystudy/components/FeasibilityReportViewer',
				'cohortbuilder/components',
				'databindings/datatableBinding',
				'databindings/eventListenerBinding',
				'bindings/jqAutosizeBinding',
				'knockout-jqueryui/tabs'
			 ],
	function (
		ko,
		config,
		FeasibilityStudy,
		CohortDefinition,
		CohortExpression,
		CriteriaGroup,
		cohortDefinitionAPI,
		feasibilityAPI,
		InclusionRule) {

		function pruneJSON(key, value) {
			if (value === 0 || value) {
				return value;
			} else {
				return
			}
		}
	
		function translateSql(sql, dialect) {
			translatePromise = $.ajax({
				url: config.webAPIRoot + 'sqlrender/translate',
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({
					SQL: sql,
					targetdialect: dialect
				}),
				error: function (error) {
					console.log("Error: " + error);
				}
			});
			return translatePromise;
		}
	
		function dirtyFlag(root, isInitiallyDirty) {
			var result = function() {},
					_initialState = ko.observable(ko.toJSON(root,pruneJSON)),
					_isInitiallyDirty = ko.observable(isInitiallyDirty);

			result.isDirty = ko.pureComputed(function() {
					return _isInitiallyDirty() || _initialState() !== ko.toJSON(root,pruneJSON);
			}).extend({rateLimit: 500});;

			result.reset = function() {
					_initialState(ko.toJSON(root));
					_isInitiallyDirty(false);
			};

			return result;
		}

		return function App() {
			
			var pollTimeout = null;
			
			function pollForInfo() {
				feasibilityAPI.getInfo(self.selectedStudy().id()).then(function(info) {
					self.info(info);
					if (info && info.status != "COMPLETE")
					{
						pollTimeout = setTimeout(function () {
							pollForInfo();
						},5000);
					}
					if (info && info.status == "COMPLETE")
					{
						feasibilityAPI.getReport(self.selectedStudy().id()).then(function(report) {
							self.report(report)
						});						
					}
				});
			}
											 
			var self = this;

			// model state
			self.selectedStudy = ko.observable();
			self.selectedInclusionRule = ko.observable();
			self.studyList = ko.observableArray();
			self.selectedView = ko.observable("");
			self.info = ko.observable();
			self.report = ko.observable();
			self.tabWidget = ko.observable();
			self.indexRuleEditor = ko.observable();
			self.conceptSetEditor = ko.observable();
			self.phaseOptions = [{ id: 0, name: 'Phase 1' }, { id: 1, name: 'Phase 2' }, { id: 2, name: 'Phase 3' }, { id: 3, name: 'Phase 4' }]
			self.dirtyFlag = ko.observable();
			self.isRunning = ko.pureComputed(function () {
				return (self.info() && self.info().status != "COMPLETE");
			});
			self.isSaveable = ko.pureComputed(function() {
				return self.dirtyFlag() && self.dirtyFlag().isDirty() && self.isRunning(); 
			});
			self.isGeneratedOpen = ko.observable(false);
			self.generatedSql = {};
			
			// model behaviors
			self.addInclusionRule = function() {
				var newInclusionRule = new InclusionRule();
				self.selectedStudy().inclusionRules.push(newInclusionRule);
				self.selectInclusionRule(newInclusionRule);
			}
			
			self.deleteInclusionRule = function (inclusionRule) {
				self.selectedInclusionRule(null);
				self.selectedStudy().inclusionRules.remove(inclusionRule);
			}
			
			self.addConceptSet = function(item) {
				self.tabWidget().tabs("option", "active", 2); // index 2 is the Concept Set Tab.
				var fieldObservable = item.CodesetId;
				var newConceptId = self.conceptSetEditor().createConceptSet().id;
				fieldObservable(newConceptId);
			}
			
			self.selectStudy = function (studyTableItem) {
				self.open(studyTableItem.id);
			}
			
			self.open = function (id) {
				feasibilityAPI.getStudy(id).then(function(study) {
					
					var priorInclusionIndex = null;
					if (self.selectedStudy() && self.selectedInclusionRule())
					{
						priorInclusionIndex = self.selectedStudy().inclusionRules.indexOf(self.selectedInclusionRule());
					}
					// unwrap JSON stringified expressions into native JS objects
					study.indexRule.expression = JSON.parse(study.indexRule.expression);
					study.inclusionRules.forEach(function (inclusionRule) {
						inclusionRule.expression = JSON.parse(inclusionRule.expression);
					});
					var study = new FeasibilityStudy(study);
					self.dirtyFlag(new dirtyFlag(study));					
					self.selectedStudy(study);
					if (priorInclusionIndex != null) // reset selected inclusion rule
						self.selectedInclusionRule(study.inclusionRules()[priorInclusionIndex]);
					self.selectedView("detail");
				}).then(function() {
					pollForInfo();
				});
			};
			
			self.selectInclusionRule = function (inclusionRule) {
				self.selectedInclusionRule(inclusionRule);	
			}
			self.save = function () {
				clearTimeout(pollTimeout);

				var study = ko.toJS(self.selectedStudy());

				// for saving, we flatten the expresson JS into a JSON string
				study.indexRule.expression = ko.toJSON(study.indexRule.expression, pruneJSON);
				study.inclusionRules.forEach(function(inclusionRule) {
					inclusionRule.expression =  ko.toJSON(inclusionRule.expression, pruneJSON);
				});
				
				// reset view after save
				feasibilityAPI.saveStudy(study).then(function(result) {
					console.log("Saved...");
					self.open(result.id);
				});
			}

			self.refreshList = function() {
				var refreshPromise = feasibilityAPI.getStudyList();
				refreshPromise.then(function(studyList) {
					self.studyList(studyList);
				});
				return refreshPromise;
			}
			
			self.cancel = function () {
				
				// add check for changes without saving, prompt to confirm
				if (self.dirtyFlag() && self.dirtyFlag().isDirty() && !confirm("Changes are not saved. Would you like to continue?"))
				{
					return;
				};
				
				clearTimeout(pollTimeout);
				self.refreshList().then(function () {
					console.log("Refreshed...");
					self.selectedStudy(null);
					self.selectedInclusionRule(null);
					self.report(null);
					self.info(null);
					self.selectedView("list");
				});
			}

			self.newStudy = function () {
				var newStudy = new FeasibilityStudy({
					"name": "New Feasibility Study",
				});

				self.dirtyFlag(new dirtyFlag(newStudy, true));
				self.selectedStudy(newStudy);
				self.selectedView("detail");
			}

			self.generate = function() {
				var generatePromise = feasibilityAPI.generate(self.selectedStudy().id());
				generatePromise.then(function (result) {
					pollForInfo();
				});
			}
			
			self.showSql = function()
			{
				var matchingCohortExpression = new CohortExpression(ko.toJS(self.selectedStudy().indexRule.expression));
				if (!matchingCohortExpression.AdditionalCriteria())
					matchingCohortExpression.AdditionalCriteria(new CriteriaGroup());
				if (matchingCohortExpression.AdditionalCriteria().Type() == "ANY")
				{
					var parentGroup = new CriteriaGroup();
					parentGroup.groups.push(indexRuleExpression.AdditionalCriteria());
					matchingCohortExpression.AdditoinalCriteria(parentGroup);
				}
				self.selectedStudy().inclusionRules().forEach(function (inclusionRule) {
					matchingCohortExpression.AdditionalCriteria().Groups.push(inclusionRule.expression);	
				});
				
				var rawExpression = ko.toJS(matchingCohortExpression, pruneJSON);
				var templateSqlPromise = cohortDefinitionAPI.getSql(rawExpression);

				templateSqlPromise.then(function (result) {
					console.log(result);
				});
				
				templateSqlPromise.then(function (result) {
					
					var mssqlTranslatePromise = translateSql(result.templateSql, 'sql server');
					mssqlTranslatePromise.then(function (result) {
						self.generatedSql.mssql = result.targetSQL;
					});

					var oracleTranslatePromise = translateSql(result.templateSql, 'oracle');
					oracleTranslatePromise.then(function (result) {
						self.generatedSql.oracle = result.targetSQL;
					});

					var postgresTranslatePromise = translateSql(result.templateSql, 'postgresql');
					postgresTranslatePromise.then(function (result) {
						self.generatedSql.postgres = result.targetSQL;
					});

					var redshiftTranslatePromise = translateSql(result.templateSql, 'redshift');
					redshiftTranslatePromise.then(function (result) {
						self.generatedSql.redshift = result.targetSQL;
					});

					$.when(mssqlTranslatePromise, oracleTranslatePromise, postgresTranslatePromise, redshiftTranslatePromise).then(function () {
						self.isGeneratedOpen(true);
					});
				});
			}
		}
	});