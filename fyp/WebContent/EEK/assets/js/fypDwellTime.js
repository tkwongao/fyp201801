var charts = [];
var storeId = -1;

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawGraph = function($) {
	'use strict';
	var lineChart_Second = nv.models.lineChart();
	charts.push(lineChart_Second);
	var barChart_Second = nv.models.discreteBarChart();
	charts.push(barChart_Second);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getData(key) {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++)
			values.push({
				x: END_MILLISECOND + MILLISECONDS_PER_INTERVAL * (i - numberOfDataInGraph),
				y: valFromDB1[i]
			});
		return [{
			values: values,
			key: key,
			color: "#00b19d",
			area: true
		}];
	}
	var timeFormat;
	switch (interval) {
	case 1:
		timeFormat = '%d %b, %H:00';
		break;
	case 24:
		timeFormat = '%d %b %Y';
		break;
	case 720:
		timeFormat = '%b %Y';
		break;
	}
	nv.addGraph(function() {
		lineChart_Second.forceY([0, 1]).margin({"bottom": 120}).useInteractiveGuideline(true).xScale(d3.time.scale());
		lineChart_Second.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});;
		lineChart_Second.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.line-chart-second svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Average Dwell Time (seconds)')).transition().duration(500).call(lineChart_Second);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(lineChart_Second.update);
		return lineChart_Second;
	});

	nv.addGraph(function() {
		barChart_Second.forceY([0, 1]).margin({"bottom": 120}).color(['#00b19d']).xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});
		barChart_Second.yAxis.axisLabel('Average Dwell Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.bar-chart-second svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Average Dwell Time (seconds)')).transition().duration(500).call(barChart_Second);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(barChart_Second.update);
		return barChart_Second;
	});
})(jQuery);

function changeScopeWithStoreId(i, requestType, stid) {
	storeId = stid;
	changeScope(i, requestType);
}

function updateDwellTimeGraph() {
	var startTime = currentTime - 3600000 * interval * numberOfDataInGraph;
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : storeId,
			interval : 0,
			userMac : 0,
			type : "average"
		},
		success : function(json) {
			var i = 0;
			var avgDwellTime = new Array();
			for ( var prop in json)
				avgDwellTime.push(json["dataPoint" + ++i]);
			$(".averageDwellTime").text(avgDwellTime[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : storeId,
			interval : interval,
			userMac : 0,
			type : "average"
		},
		success : function(json) {
			var i = 0;
			valFromDB1 = new Array();
			for ( var prop in json)
				valFromDB1.push(json["dataPoint" + ++i]);
			drawGraph();
		}
	});
}

$(document).ready(function() {
	changeScope(0, "average", document.getElementById("storeId").value);
});