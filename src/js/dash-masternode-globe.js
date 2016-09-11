import THREE from 'three';
import * as d3 from 'd3'
import Detector from 'exports?Detector!../../node_modules/webgl-globe/globe/third-party/Detector.js';
import DAT from 'imports?THREE=three!exports?DAT!../../node_modules/webgl-globe/globe/globe.js';


var globeData = [],
	globe = new DAT.Globe(container, {
		imgDir: 'assets/'
	});

/**
 * Data taken from (11.09.16)
 * http://178.254.23.111/~pub/Dash/MN_locations.data
 **/

d3.request('assets/MN_locations.data')
	.mimeType('text/tab-separated-values')
	.response(function(xhr) {
		return d3.tsvParse(xhr.responseText, function(d) {
			var masternodeCount = 0,
				lat = 0,
				lon = 0;
			try {
				masternodeCount = parseInt(d.description.replace('Masternodes: ', ''), 10);
				lat = parseFloat(d.lat);
				lon = parseFloat(d.lon);
			} catch (e) {}

			return {
				lat: lat,
				lon: lon,
				masternodes: masternodeCount,
				_masternodes: d.description,
				title: d.title
			};
		});
	})
	.get(function(error, tsvData) {

		let dataSet = [];

		tsvData.forEach(function(d) {
			dataSet.push(d.lat);
			dataSet.push(d.lon);
			dataSet.push(d.masternodes/4200*3);
		});

		globeData.push(['current', dataSet]);

		if (!Detector.webgl) {
			Detector.addGetWebGLMessage();
		} else {
			window.data = globeData;

			for (let i = 0; i < data.length; i++) {
				globe.addData(data[i][1], { format: 'magnitude', name: data[i][0], animated: true });
			}

			globe.createPoints();
			globe.time = 1;
			globe.animate();

			document.body.style.backgroundImage = 'none'; // remove loading
		}
	});
