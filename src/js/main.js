import * as THREE from './lib/three.js';
import * as d3 from './lib/d3.js';
import Detector from './detector.js';
import Globe from './globe.js';

window.DashGlobe = DashGlobe;

function DashGlobe(options) {
	this.options = Object.assign({},
		{
			container: document.getElementById('container'),
			masternodeTotalCount: 4000,
			pointSize: 1.1,
			imgDir: 'assets/',
			url: 'assets/mn_locations.tsv'
		},
		options || {});
	this.globeData = [];
	this.globe = null;

	this.init();
}

DashGlobe.Detector = Detector;

DashGlobe.prototype.init = function() {

	this.globe = new Globe(this.options.container, {
		imgDir: this.options.imgDir,
		pointSize: this.options.pointSize,
		cameraOffset: this.options.cameraOffset,
		initialZoom: this.options.initialZoom,
		colorFn: (label) => {
			return new THREE.Color(this.options.barColor || 0xffffffff);
		}
	});

	this.fetchData(() => {

		for (var i = 0; i < this.globeData.length; i++) {
			this.globe.addData(this.globeData[i][1], { format: 'magnitude', name: this.globeData[i][0], animated: true });
		}

		this.globe.createPoints();
		this.globe.time = 1;
		this.globe.animate();
	});

}

/**
 * Fetch Data
 *
 * Data taken from (11.09.16)
 * http://178.254.23.111/~pub/Dash/MN_locations.data
 */
DashGlobe.prototype.fetchData = function (callback) {
	d3.request(this.options.url)
		.mimeType('text/tab-separated-values')
		.response((xhr) => {
			return this.parseMasterNodeDataFromTSV(xhr.responseText);
		})
		.get((error, tsvData) => {

			this.masternodeTotalCount = this.countMasterNodes(tsvData);

			this.globeData.push(['current', this.createGlobeDataSet(tsvData, this.masternodeTotalCount)]);

			if (typeof callback === 'function') {
				callback();
			}
		});
}

/**
 * Convert Data into array form ([lat, lon, magnitude, lat, long, ...])
 */
DashGlobe.prototype.createGlobeDataSet = function(masterNodeData, masterNodeCount) {
	var dataSet = [];

	masterNodeData.forEach(function(d) {
		dataSet.push(d.lat);
		dataSet.push(d.lon);
		dataSet.push(d.masternodes/masterNodeCount*3 + 3/masterNodeCount);
	});

	return dataSet;
}

/**
 * Convert Data into array form ([lat, lon, magnitude, lat, long, ...])
 */
DashGlobe.prototype.countMasterNodes = function(masterNodeData) {
	var count = 0;

	masterNodeData.forEach(function(d) {
		count += d.masternodes;
	});

	return count;
}

/**
 * Parse Data rom2
 */
DashGlobe.prototype.parseMasterNodeDataFromTSV = function(tsvText) {
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

export default DashGlobe;
