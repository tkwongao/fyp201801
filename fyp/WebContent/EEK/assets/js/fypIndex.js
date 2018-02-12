var charts = [];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawPeopleCountingGraph = function($) {
	'use strict';
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountingData() {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++) {
			values.push({
				x: END_MILLISECOND + MILLISECONDS_IN_A_DAY * (i - numberOfDataInGraph),
				y: valFromDB1[i]
			});
		}
		return [{
			values: values,
			key: 'Number of Visit',
			color: "#00b19d",
			area: true
		}];
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true).xScale(d3.time.scale())
		peopleCountingChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		peopleCountingChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.numberOfVisitChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountingData()).transition().duration(500).call(peopleCountingChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountingChart.update);
		return peopleCountingChart;
	});
})(jQuery);

(drawAverageDwellTimeGraph = function($) {
	'use strict';
	var averageDwellTimeChart = nv.models.discreteBarChart();
	charts.push(averageDwellTimeChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getAverageDwellTimeData() {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++) {
			values.push({
				x: END_MILLISECOND + MILLISECONDS_IN_A_DAY * (i - numberOfDataInGraph),
				y: valFromDB2[i]
			});
		}
		return [{
			values: values,
			key: 'Average Dwell Time (seconds)',
			color: "#00b19d"
		}];
	}
	nv.addGraph(function() {
		averageDwellTimeChart.forceY([0, 1]).margin({"bottom": 80})/*.color(['#00b19d'])*/.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
})(jQuery);

function afterAJAXs() {
	$('.counter').counterUp({
		delay : 100,
		time : 1200
	});
	$('.circliful-chart').circliful();
}

// BEGIN SVG WEATHER ICON
if (typeof Skycons !== 'undefined') {
	var icons = new Skycons({
		"color" : "#3bafda"
	}, {
		"resizeClear" : true
	}), list = [ "clear-day", "clear-night", "partly-cloudy-day",
			"partly-cloudy-night", "cloudy", "rain", "sleet", "snow",
			"wind", "fog" ], i;

	for (i = list.length; i--;)
		icons.set(list[i], list[i]);
	icons.play();
};

function updateIndexGraph() {
	var startTime = currentTime - 3600000 * interval * numberOfDataInGraph;
	$.when(ajax1(), ajax2(), ajax3()).done(function(a1, a2, a3) {
		afterAJAXs();
	});
	function ajax1() {
		return $.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime,
				end : currentTime,
				storeId : -1,
				interval : 0,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				var i = 0;
				var totalVisitorCount = new Array();
				for ( var prop in json)
					totalVisitorCount.push(json["dataPoint" + ++i]);
				$(".totalVisitorCount").text(totalVisitorCount[0]);
			}
		});
	}
	function ajax2() {
		return $.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime,
				end : currentTime,
				storeId : -1,
				interval : 0,
				userMac : 0,
				type : "average"
			},
			success : function(json) {
				var i = 0;
				var totalAverageDwellTime = new Array();
				for ( var prop in json)
					totalAverageDwellTime.push(json["dataPoint" + ++i]);
				$(".totalAverageDwellTime").text(totalAverageDwellTime[0]);
			}
		});
	}
	function ajax3() {
		return $.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime,
				end : currentTime,
				storeId : -1,
				interval : interval,
				userMac : 0,
				type : "count"
			},
			success : function(json) {
				var i = 0;
				var sum = 0;
				valFromDB1 = new Array();
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + ++i] 
					valFromDB1.push(thisDataPoint);
					sum += thisDataPoint;
				}
				$(".dailyVisitors").text(sum / valFromDB1.length);
				$("#todayVisitors").text(valFromDB1[valFromDB1.length - 1]);
				$("#yesterdayVisitors").text(valFromDB1[valFromDB1.length - 2]);
				drawPeopleCountingGraph();
			}
		});
	}
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : -1,
			interval : interval,
			userMac : 0,
			type : "average"
		},
		success : function(json) {
			var i = 0;
			var sum = 0;
			valFromDB2 = new Array();
			for ( var prop in json) {
				var thisDataPoint = json["dataPoint" + ++i] 
				valFromDB2.push(thisDataPoint);
				sum += thisDataPoint;
			}
			$("#todayAverageDwellTime").text(valFromDB2[valFromDB2.length - 1]);
			$("#yesterdayAverageDwellTime").text(valFromDB2[valFromDB2.length - 2]);
			drawAverageDwellTimeGraph();
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : 1000001,
			interval : 0,
			userMac : 0,
			type : "count"
		},
		success : function(json) {
			var i = 0;
			var s1scount = new Array();
			for ( var prop in json)
				s1scount.push(json["dataPoint" + ++i]);
			$("#s1scount").text(s1scount[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : 1000002,
			interval : 0,
			userMac : 0,
			type : "count"
		},
		success : function(json) {
			var i = 0;
			var s2scount = new Array();
			for ( var prop in json)
				s2scount.push(json["dataPoint" + ++i]);
			$("#s2scount").text(s2scount[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : 1000003,
			interval : 0,
			userMac : 0,
			type : "count"
		},
		success : function(json) {
			var i = 0;
			var s3scount = new Array();
			for ( var prop in json)
				s3scount.push(json["dataPoint" + ++i]);
			$("#s3scount").text(s3scount[0]);
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : 1000004,
			interval : 0,
			userMac : 0,
			type : "count"
		},
		success : function(json) {
			var i = 0;
			var s4scount = new Array();
			for ( var prop in json)
				s4scount.push(json["dataPoint" + ++i]);
			$("#s4scount").text(s4scount[0]);
		}
	});
}