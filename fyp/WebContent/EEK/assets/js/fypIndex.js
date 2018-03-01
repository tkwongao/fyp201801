var charts = [];
var shops = [];
var PeopleCountForEachShopResults = [];
var averageDwellTimeDistribution = [];
var dwellTimeThresholds = [60, 120, 300, 600, 1200, 1800];

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
			//color: "#00b19d",
			area: true
		}];
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true).xScale(d3.time.scale());
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
	var averageDwellTimeChart = nv.models.multiBarChart();
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
			key: 'Average Dwell Time (seconds)'
		}];
	}
	nv.addGraph(function() {
		averageDwellTimeChart.forceY([0, 1]).margin({"bottom": 80})/*.color(['#00b19d'])*/.stacked(false).showControls(false);
		averageDwellTimeChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
})(jQuery);

(drawAverageDwellTimeDistributionGraph = function($) {
	'use strict';
	var averageDwellTimeDistributionChart = nv.models.stackedAreaChart();
	charts.push(averageDwellTimeDistributionChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getAverageDwellTimeData() {
		var datum = new Array();
		for (var i = 0; i < dwellTimeThresholds.length + 1; i++) {
			var key = undefined;
			if (i == 0)
				key = "Less than " + (dwellTimeThresholds[i] / 60) + " minutes";
			else if (i == dwellTimeThresholds.length)
				key = "More than " + (dwellTimeThresholds[i - 1] / 60) + " minutes";
			else
				key = "Between " + (dwellTimeThresholds[i - 1] / 60) + " and " + (dwellTimeThresholds[i] / 60) + " minutes";
			var values = [];
			for (var j = 0; j < numberOfDataInGraph; j++) {
				values.push({
					x: END_MILLISECOND + MILLISECONDS_IN_A_DAY * (j - numberOfDataInGraph),
					y: averageDwellTimeDistribution[j * (dwellTimeThresholds.length + 1) + i]
				});
			}
			datum.push({
				values: values,
				key: key
			});
		}
		return datum;
	}
	nv.addGraph(function() {
		averageDwellTimeDistributionChart.forceY([0, 1]).margin({"bottom": 80}).style('expand').useInteractiveGuideline(true).xScale(d3.time.scale()).showControls(false);
		averageDwellTimeDistributionChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		averageDwellTimeDistributionChart.yAxis.axisLabel('Percentage').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeDistribution svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeDistributionChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeDistributionChart.update);
		return averageDwellTimeDistributionChart;
	});
})(jQuery);

(drawPeopleCountForEachShopGraph = function($) {
	'use strict';
	var peopleCountForEachShopChart = nv.models.stackedAreaChart();
	charts.push(peopleCountForEachShopChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountForEachShopData() {
		var datum = new Array();
		for (var i = 0; i < PeopleCountForEachShopResults.length; i++) {
			var values = [];
			for (var j = 0; j < numberOfDataInGraph; j++) {
				values.push({
					x: END_MILLISECOND + MILLISECONDS_IN_A_DAY * (j - numberOfDataInGraph),
					y: PeopleCountForEachShopResults[i][j]
				});
			}
			datum.push({
				values: values,
				key: shops[i].name
			});
		}
		return datum;
	}
	nv.addGraph(function() {
		peopleCountForEachShopChart.forceY([0, 1]).margin({"bottom": 80}).style('stack').useInteractiveGuideline(true).xScale(d3.time.scale()).showControls(false);
		peopleCountForEachShopChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		peopleCountForEachShopChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.peopleCountForEachShopChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountForEachShopData()).transition().duration(500).call(peopleCountForEachShopChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountForEachShopChart.update);
		return peopleCountForEachShopChart;
	});
})(jQuery);

function afterAJAXs() {
	$('.counter').counterUp({
		delay : 100,
		time : 1200
	});
	$('.circliful-chart').circliful();
}

//BEGIN SVG WEATHER ICON
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
			traditional: true,
			success : function(json) {
				var i = 0;
				var totalVisitorCount = new Array();
				for ( var prop in json)
					totalVisitorCount.push(json["dataPoint" + ++i]);
				$(".totalVisitorCount").text(totalVisitorCount[0]);
			},
			statusCode: {
				501: function() {
					window.location.href = "EEK/pages-501.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
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
			traditional: true,
			success : function(json) {
				var i = 0;
				var totalAverageDwellTime = new Array();
				for ( var prop in json)
					totalAverageDwellTime.push(json["dataPoint" + ++i]);
				$(".totalAverageDwellTime").text(totalAverageDwellTime[0]);
			},
			statusCode: {
				501: function() {
					window.location.href = "EEK/pages-501.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
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
			traditional: true,
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
			},
			statusCode: {
				501: function() {
					window.location.href = "EEK/pages-501.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
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
		traditional: true,
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
		},
		statusCode: {
			501: function() {
				window.location.href = "EEK/pages-501.html";
			},
			500: function() {
				window.location.href = "EEK/pages-500.html";
			}
		}
	});
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : -1,
			interval : interval,
			userMac : 0,
			type : "avgTimeDistribution",
			dwellTimeThresholds: dwellTimeThresholds
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			averageDwellTimeDistribution = new Array();
			for ( var prop in json)
				averageDwellTimeDistribution.push(json["dataPoint" + ++i]);
			drawAverageDwellTimeDistributionGraph();
		},
		statusCode: {
			501: function() {
				window.location.href = "EEK/pages-501.html";
			},
			500: function() {
				window.location.href = "EEK/pages-500.html";
			}
		}
	});
	for (var i = 0; i < shops.length; i++)
		(function() {
			var k = i + 1;
			$.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : currentTime,
					storeId : shops[i].id,
					interval : 0,
					userMac : 0,
					type : "count"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var thisStoreCount = new Array();
					for ( var prop in json)
						thisStoreCount.push(json["dataPoint" + ++j]);
					$("#s" + k + "scount").text(thisStoreCount[0]);
				},
				statusCode: {
					501: function() {
						window.location.href = "EEK/pages-501.html";
					},
					500: function() {
						window.location.href = "EEK/pages-500.html";
					}
				}
			});
		})();
	var ajaxs = new Array();
	PeopleCountForEachShopResults = new Array();
	for (var i = 0; i < shops.length; i++) {
		var anAjax;
		(function() {
			var k = i;
			anAjax = $.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : currentTime,
					storeId : shops[i].id,
					interval : interval,
					userMac : 0,
					type : "count"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var sum = 0;
					PeopleCountForEachShopResults[k] = new Array();
					for ( var prop in json)
						PeopleCountForEachShopResults[k].push(json["dataPoint" + ++j]);
				},
				statusCode: {
					501: function() {
						window.location.href = "EEK/pages-501.html";
					},
					500: function() {
						window.location.href = "EEK/pages-500.html";
					}
				}
			});
		})();
		ajaxs.push(anAjax);
	}
	$.when.apply($, ajaxs).done(function() {
		drawPeopleCountForEachShopGraph();
	});
}

$(document).ready(function() {
	$("#date").html(new Intl.DateTimeFormat(
			"en-HK", {
				weekday : "long",
				year : "numeric",
				day : "numeric",
				month : "long"
			}).format(new Date()));
	function ajaxGettingStores(mallName) {
		return $.ajax({
			type : "get",
			url : "prepareStores",
			data : { mallName: mallName },
			traditional: true,
			success : function(json) {
				shops = new Array();
				for ( var prop in json)
					shops.push({ id: json[prop], name: prop });
				shops.sort(function (a, b) {
					return a.name.localeCompare( b.name );
				});
				var popularShopsHtml = "";
				for (var i = 0; i < shops.length; i++)
					popularShopsHtml += "<tr><td>" + shops[i].name + "</td><td align=\"right\" id=\"s" + (i + 1) + "scount\">0</td></tr>";
				$("#popularShops").html(popularShopsHtml);
			},
			statusCode: {
				403: function() {
					window.location.href = "EEK/pages-403.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
			}
		});
	}
	$.when(ajaxGettingStores("base_1")).done(function(a1) {
		changeScope(2, "index");
	});
});