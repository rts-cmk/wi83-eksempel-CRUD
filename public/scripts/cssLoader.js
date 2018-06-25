const cssLoader = function (stylesheet) {
	const link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', stylesheet);
	document.getElementsByTagName('head')[0]
		.appendChild(link);
};

document.addEventListener('DOMContentLoaded', () => {
	cssLoader('/stylesheets/main.css');
});
