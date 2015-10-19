define(['knockout',
				'appConfig',
				'feasibilitystudy/FeasibilityStudy',
				'cohortbuilder/CohortDefinition',
				'cohortbuilder/CohortExpression',
				'cohortbuilder/CriteriaGroup',
				'webapi/CohortDefinitionAPI',
				'webapi/FeasibilityAPI',
				'webapi/SourceAPI',				
				'feasibilitystudy/InclusionRule',
				'feasibilitystudy/components/InclusionRuleEditor',
				'feasibilitystudy/components/FeasibilityResultsViewer',
				'cohortdefinitionviewer',
				'cohortbuilder/components',
				'conceptsetbuilder/components',
				'databindings/datatableBinding',
				'databindings/eventListenerBinding',
				'databindings/ddSlickActionBinding',
				'bindings/jqAutosizeBinding',
				'knockout-jqueryui/tabs', 
				'css!styles/tabs.css',
				'css!styles/buttons.css',
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
		sourceAPI,
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
				feasibilityAPI.getInfo(self.selectedStudy().id()).then(function(infoList) {
					var hasPending = false;
					infoList.forEach(function(info){
						var source = self.sources().filter(function (s) { return s.source.sourceId == info.generationInfo.id.sourceId })[0];
						source.info(info);
						if (info.generationInfo.status != "COMPLETE")
							hasPending = true;
					});
					
					if (hasPending)
					{
						pollTimeout = setTimeout(function () {
							pollForInfo();
						},5000);
					}
				});
			}
											 
			var self = this;
			
			// model state
			self.router = null;
			self.selectedStudy = ko.observable();
			self.selectedInclusionRule = ko.observable();
			self.studyList = ko.observableArray();
			self.selectedView = ko.observable("");
			self.info = ko.observable();
			self.report = ko.observable();
			self.tabWidget = ko.observable();
			self.indexRuleEditor = ko.observable();
			self.conceptSetEditor = ko.observable();
			self.sources = ko.observableArray();
			self.filteredSources = ko.pureComputed(function () {
				return self.sources().filter(function (source) {
					return source.info();
				});
			});
			
			self.dirtyFlag = ko.observable();
			self.isRunning = ko.pureComputed(function () {
				return self.sources().filter(function (source) {
					return source.info() && source.info().generationInfo.status != "COMPLETE";
				}).length > 0;
			});
			self.isSaveable = ko.pureComputed(function() {
				return self.dirtyFlag() && self.dirtyFlag().isDirty() && self.isRunning(); 
			});
			self.isGeneratedOpen = ko.observable(false);
			self.generatedSql = {};
			self.isImportOpen = ko.observable(false);
			self.studyJSON = ko.observable();

		
			self.generateActionsSettings = {
				selectText: "Generate...",
				width: 100,
				actionOptions: null,  // initalized in the startup actions
				onAction: function (data) {
					data.selectedData.action();
				}
			};

			
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
				window.location.hash = '/' + studyTableItem.id; 
			}
			
			self.open = function (id) {
				feasibilityAPI.getStudy(id).then(function(study) {
					// clear out prior generation info
					self.sources().forEach(function (source) {
						source.info(null);
					});

					
					var priorInclusionIndex = null;
					if (self.selectedStudy() && self.selectedInclusionRule())
					{
						priorInclusionIndex = self.selectedStudy().inclusionRules.indexOf(self.selectedInclusionRule());
					}
					// unwrap JSON stringified expressions into native JS objects
					study.indexRule = JSON.parse(study.indexRule);
					study.inclusionRules.forEach(function (inclusionRule) {
						inclusionRule.expression = JSON.parse(inclusionRule.expression);
					});
					var study = new FeasibilityStudy(study);
					self.dirtyFlag(new dirtyFlag(study));					
					self.selectedStudy(study);
					self.selectedInclusionRule(null); // reset selectedInclusionRule to workaround an issue where inclusion rule editor was not resyncing with index rule causing concept set
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
				study.indexRule = ko.toJSON(study.indexRule, pruneJSON);
				study.inclusionRules.forEach(function(inclusionRule) {
					inclusionRule.expression =  ko.toJSON(inclusionRule.expression, pruneJSON);
				});
				
				// reset view after save
				feasibilityAPI.saveStudy(study).then(function(result) {
					console.log("Saved...");
					if (!study.id) // reset route to new ID
						self.router.setRoute('/' + result.id);
					else // reload saved study
						self.open(study.id);
				});
			}
			
			self.copy = function () {
				clearTimeout(pollTimeout);

				// reset view after save
				feasibilityAPI.copyStudy(self.selectedStudy().id()).then(function(result) {
					console.log("Copied...");
					self.selectedStudy(null);
					self.selectedInclusionRule(null);
					self.report(null);
					self.router.setRoute('/' + result.id);
				});
			}
			
			self.delete = function () {
				clearTimeout(pollTimeout);

				// reset view after save
				feasibilityAPI.deleteStudy(self.selectedStudy().id()).then(function(result) {
					console.log("Deleted...");
					self.refreshList().then(function () {
						console.log("Refreshed...");
						self.selectedStudy(null);
						self.selectedInclusionRule(null);
						self.report(null);
						// clear out prior generation info
						self.sources().forEach(function (source) {
							source.info(null);
						});
						self.router.setRoute('');
					});
				});
			}			

			self.refreshList = function() {
				var refreshPromise = feasibilityAPI.getStudyList();
				refreshPromise.then(function(studyList) {
					self.studyList(studyList);
				});
				return refreshPromise;
			}
			
			self.list = function () {
				
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
					// clear out prior generation info
					self.sources().forEach(function (source) {
						source.info(null);
					});
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

			self.onGenerate = function(generateComponent) {
				var generatePromise = feasibilityAPI.generate(self.selectedStudy().id(), generateComponent.source.sourceKey);
				generatePromise.then(function (result) {
					pollForInfo();
				});
			}
			
			self.onRemoveResult = function(studyGeneration) {
				var targetSourceInfo = self.sources().filter(function (source) { return source.source.sourceId == studyGeneration.generationInfo.id.sourceId; })[0];
				var removePromise = feasibilityAPI.deleteInfo(studyGeneration.generationInfo.id.studyId, targetSourceInfo.source.sourceKey).then (function() {
					targetSourceInfo.info(null);
				});
			}				
			
			self.showSql = function()
			{
				var matchingCohortExpression = new CohortExpression(ko.toJS(self.selectedStudy().indexRule()));
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
			self.showImprtExport = function ()
			{
				var study = self.selectedStudy();
				var studyJS = {
					indexRule:  ko.toJS(study.indexRule),
					inclusionRules : study.inclusionRules().map(function (inclusionRule) {
						return ko.toJS(inclusionRule);
					})
				}
				
				self.studyJSON(ko.toJSON(studyJS, pruneJSON, 2));
				self.isImportOpen(true);	
			}
			
			self.doImport = function()
			{
				console.log("todo: refresh objects");
				var importData = JSON.parse(self.studyJSON());
				var importStudy = ko.toJS(self.selectedStudy()); // work off of a copy of the selected study, we're only updating the indexRule and inclusionRules. Existing study name and IDs stay the same.
				importStudy.indexRule = importData.indexRule;
				importStudy.inclusionRules = importData.inclusionRules;
				
				var updatedStudy = new FeasibilityStudy(importStudy);
				self.dirtyFlag(new dirtyFlag(updatedStudy, true)); // intial state is dirty					
				self.selectedStudy(updatedStudy);
				self.selectedInclusionRule(null); // reset selected inclusion rule
				self.isImportOpen(false); // close import dialog
			}
			
			self.routes = {
				'' : self.list,
				'/new': self.newStudy,
				'/:id': self.open
			};		
			
			
			// startup actions
			sourceAPI.getSources().then(function(sources) {
				var sourceList = [];
				sources.forEach(function(source) {
					if (source.daimons.filter(function (daimon) { return daimon.daimonType == "CDM"; }).length > 0
							&& source.daimons.filter(function (daimon) { return daimon.daimonType == "Results"; }).length > 0)
					{
						sourceList.push({
							source: source,
							info: ko.observable()
						});
					}
				});
				self.sources(sourceList);
				self.generateActionsSettings.actionOptions = sourceList.map(function (sourceItem) {
					return {
						text: sourceItem.source.sourceName,
						selected: false,
						description: "Perform Study on source: " + sourceItem.source.sourceName,
						action: function() {
							if (sourceItem.info()) {
								sourceItem.info().generationInfo.status = "PENDING";
								sourceItem.info.notifySubscribers();
							} 
							else {
								tempInfo = { generationInfo : {
									id : { sourceId: sourceItem.source.sourceId }
								}};
								sourceItem.info(tempInfo);
							}
							var generatePromise = feasibilityAPI.generate(self.selectedStudy().id(), sourceItem.source.sourceKey);
							generatePromise.then(function (result) {
								pollForInfo();
							});
						}
					}
				});				
			});
		}
	});