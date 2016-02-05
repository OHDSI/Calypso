define([], function () {
	var config = {};

	config.services = [
		{
			name: 'Local',
			url: 'http://localhost:8080/WebAPI/'
		}
		];

	config.webAPIRoot = config.services[0].url;
	config.readOnly = true;

	return config;

});