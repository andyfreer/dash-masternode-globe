import * as THREE from 'three';
import * as d3 from 'd3'
import Detector from 'exports?Detector!../../node_modules/webgl-globe/globe/third-party/Detector.js';
import Globe from './globe.js';


var globeData = [],
	container = document.getElementById('container'),
	globe = new Globe(container, {
		imgDir: 'assets/',
		pointSize: 1.1,
		colorFn: function(label) {
			return new THREE.Color([
				0xd9d9d9, 0xb6b4b5, 0x9966cc, 0x15adff, 0x3e66a3,
				0x216288, 0xff7e7e, 0xff1f13, 0xc0120b, 0x5a1301, 0xffcc02,
				0xedb113, 0x9fce66, 0x0c9a39,
				0xfe9872, 0x7f3f98, 0xf26522, 0x2bb673, 0xd7df23,
				0xe6b23a, 0x7ed3f7][label]);
		}
	});

/**
 * Data taken from (11.09.16)
 * http://178.254.23.111/~pub/Dash/MN_locations.data
 **/

d3.request('assets/mn_locations.tsv')
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
			dataSet.push(d.masternodes/4200*3 + 3/4200);
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
