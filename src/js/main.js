import * as THREE from 'three';
import * as d3 from 'd3'
import Detector from './detector.js';
import Globe from './globe.js';


var container = document.getElementById('container'),
	masternodeTotalCount = 4000, // Initial Value
	pointSize = 1.1,
	imgDir = 'assets/',
	globeData = [],
	globe;


if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
} else {
	globe = new Globe(container, {
		imgDir: imgDir,
		pointSize: pointSize,
		colorFn: function(label) {
			return new THREE.Color(0xffffff);
		}
	});
	fetchData(function() {

		for (let i = 0; i < globeData.length; i++) {
			globe.addData(globeData[i][1], { format: 'magnitude', name: globeData[i][0], animated: true });
		}

		globe.createPoints();
		globe.time = 1;
		globe.animate();
	});
}


/**
 * Fetch Data
 *
 * Data taken from (11.09.16)
 * http://178.254.23.111/~pub/Dash/MN_locations.data
 */
function fetchData(callback) {
	d3.request('assets/mn_locations.tsv')
		.mimeType('text/tab-separated-values')
		.response(function(xhr) {
			return parseMasterNodeDataFromTSV(xhr.responseText);
		})
		.get(function(error, tsvData) {

			masternodeTotalCount = countMasterNodes(tsvData);

			globeData.push(['current', createGlobeDataSet(tsvData)]);

			if (typeof callback === 'function') {
				callback();
			}
		});
}

/**
 * Convert Data into array form ([lat, lon, magnitude, lat, long, ...])
 */
function createGlobeDataSet(masterNodeData) {
	let dataSet = [];

	masterNodeData.forEach(function(d) {
		dataSet.push(d.lat);
		dataSet.push(d.lon);
		dataSet.push(d.masternodes/masternodeTotalCount*3 + 3/masternodeTotalCount);
	});

	return dataSet;
}

/**
 * Convert Data into array form ([lat, lon, magnitude, lat, long, ...])
 */
function countMasterNodes(masterNodeData) {
	let count = 0;

	masterNodeData.forEach(function(d) {
		count += d.masternodes;
	});

	return count;
}

/**
 * Parse Data rom2
 */
function parseMasterNodeDataFromTSV(tsvText) {
	return d3.tsvParse(tsvText, function(d) {
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
				title: d.title
			};
		});
}
