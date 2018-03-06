var numberOfDataInGraph = undefined;
var currentTime = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
//To be replaced by getting the current date

var charts = [];
var shops = [];
var dwellTimeThresholds = [60, 120, 300, 600, 1200, 1800];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawPeopleCountingGraph = function(data, avg) {
	'use strict';
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountingData() {
		var datum = [];
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < numberOfDataInGraph; i++)
				values.push({
					x: currentTime + MILLISECONDS_IN_A_DAY * (i - numberOfDataInGraph),
					y: data[i]
				});
			datum.push({
				values: values,
				key: 'Number of Visit',
				//color: "#00b19d",
				area: true
			});
			if (!isNaN(avg * 1))
				datum.push({
					values: function() {
						var arr = new Array(numberOfDataInGraph);
						for (var i = 0; i < numberOfDataInGraph; i++)
							arr[i] = {
								x: currentTime + MILLISECONDS_IN_A_DAY * (i - numberOfDataInGraph),
								y: avg
						};
						return arr;
					}(),
					key: 'Monthly Average Number of Visit',
					color: "#000000",
					area: false
				});
		}
		return datum;
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

(drawAverageDwellTimeGraph = function(data) {
	'use strict';
	var averageDwellTimeChart = nv.models.multiBarChart();
	charts.push(averageDwellTimeChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getAverageDwellTimeData() {
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < numberOfDataInGraph; i++)
				values.push({
					x: currentTime + MILLISECONDS_IN_A_DAY * (i - numberOfDataInGraph),
					y: data[i]
				});
			return [{
				values: values,
				key: 'Average Dwell Time (seconds)'
			}];
		}
		return [];
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

(drawAverageDwellTimeDistributionGraph = function(data) {
	'use strict';
	var averageDwellTimeDistributionChart = nv.models.stackedAreaChart();
	charts.push(averageDwellTimeDistributionChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getAverageDwellTimeData() {
		var datum = [];
		if (Array.isArray(data))
			for (var i = 0; i < dwellTimeThresholds.length + 1; i++) {
				var key = undefined;
				if (i == 0)
					key = "Less than " + (dwellTimeThresholds[i] / 60) + " minutes";
				else if (i == dwellTimeThresholds.length)
					key = "More than " + (dwellTimeThresholds[i - 1] / 60) + " minutes";
				else
					key = "Between " + (dwellTimeThresholds[i - 1] / 60) + " and " + (dwellTimeThresholds[i] / 60) + " minutes";
				var values = [];
				for (var j = 0; j < numberOfDataInGraph; j++)
					values.push({
						x: currentTime + MILLISECONDS_IN_A_DAY * (j - numberOfDataInGraph),
						y: data[j * (dwellTimeThresholds.length + 1) + i]
					});
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

(drawPeopleCountForTop5ShopGraph = function(data, peopleCountingForEachShopResultsSorted) {
	'use strict';
	var peopleCountForTop5ShopChart = nv.models.stackedAreaChart();
	charts.push(peopleCountForTop5ShopChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountForTop5ShopData() {
		var datum = [];
		if (Array.isArray(data))
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = 0; j < numberOfDataInGraph; j++)
					values.push({
						x: currentTime + MILLISECONDS_IN_A_DAY * (j - numberOfDataInGraph),
						y: data[i][j]
					});
				datum.push({
					values: values,
					key: shops[peopleCountingForEachShopResultsSorted[i].id].name
				});
			}
		return datum;
	}
	nv.addGraph(function() {
		peopleCountForTop5ShopChart.forceY([0, 1]).margin({"bottom": 80}).style('stack').useInteractiveGuideline(true).xScale(d3.time.scale()).showControls(false);
		peopleCountForTop5ShopChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format('%d %b %Y')(new Date(d));
		});
		peopleCountForTop5ShopChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.peopleCountForTop5ShopChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountForTop5ShopData()).transition().duration(500).call(peopleCountForTop5ShopChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountForTop5ShopChart.update);
		return peopleCountForTop5ShopChart;
	});
})(jQuery);

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
				shops = [];
				for ( var prop in json)
					shops.push({ id: json[prop], name: prop });
				shops.sort(function (a, b) {
					return a.name.localeCompare( b.name );
				});
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
		var interval = 24;
		numberOfDataInGraph = 30;
		var scope = 2;
		var startTime = currentTime - 3600000 * interval * numberOfDataInGraph;
		$.when(ajax1(), ajax2(), ajax3()).done(function(a1, a2, a3) {
			$('.counter').counterUp({
				delay : 100,
				time : 1200
			});
			$('.circliful-chart').circliful();
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
					var totalVisitorCount = [];
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
					var totalAverageDwellTime = [];
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
					var peopleCounting = [];
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + ++i] 
						peopleCounting.push(thisDataPoint);
						sum += thisDataPoint;
					}
					$(".dailyVisitors").text(sum / peopleCounting.length);
					$("#todayVisitors").text(peopleCounting[peopleCounting.length - 1]);
					$("#yesterdayVisitors").text(peopleCounting[peopleCounting.length - 2]);
					drawPeopleCountingGraph(peopleCounting, sum / peopleCounting.length);
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
				var averageDwellTime = [];
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + ++i] 
					averageDwellTime.push(thisDataPoint);
					sum += thisDataPoint;
				}
				$("#todayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 1]);
				$("#yesterdayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 2]);
				drawAverageDwellTimeGraph(averageDwellTime);
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
				var averageDwellTimeDistribution = [];
				for ( var prop in json)
					averageDwellTimeDistribution.push(json["dataPoint" + ++i]);
				drawAverageDwellTimeDistributionGraph(averageDwellTimeDistribution);
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
		var ajaxs = [];
		var peopleCountingForEachShopResults = [];
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
						interval : 0,
						userMac : 0,
						type : "count"
					},
					traditional: true,
					success : function(json) {
						var j = 0;
						var thisStoreCount = [];
						for ( var prop in json)
							thisStoreCount.push(json["dataPoint" + ++j]);
						//$("#s" + (k + 1) + "scount").text(thisStoreCount[0]);
						peopleCountingForEachShopResults[k] = {"id": k, "count": thisStoreCount[0]};
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
			var peopleCountingForEachShopResultsSorted = peopleCountingForEachShopResults.sort(function(a, b) {
				return b.count - a.count;
			});
			var numberOfPopularStores = Math.min(peopleCountingForEachShopResults.length, 5);
			var popularStoresHtml = "";
			for (var i = 0; i < numberOfPopularStores; i++)
				popularStoresHtml += "<tr><td>" + shops[peopleCountingForEachShopResultsSorted[i].id].name + "</td><td align=\"right\" id=\"sc" + peopleCountingForEachShopResultsSorted[i].id + "\">0</td></tr>";
			popularStoresHtml += "<tr><td>Rest of the stores</td><td align=\"right\" id=\"scr\">0</td></tr>";
			$("#popularStores").html(popularStoresHtml);
			var restStoresCount = 0;
			for (var i = 0; i < peopleCountingForEachShopResultsSorted.length; i++) {
				if (i < numberOfPopularStores)
					$("#sc" + peopleCountingForEachShopResultsSorted[i].id).text(peopleCountingForEachShopResultsSorted[i].count);
				else
					restStoresCount += peopleCountingForEachShopResultsSorted[i].count;
			}
			$("#scr").text(restStoresCount);
			peopleCountingForEachShopResultsSorted = peopleCountingForEachShopResultsSorted.slice(0, numberOfPopularStores);
			var peopleCountForTop5ShopResults = [];
			var ajaxs = [];
			for (var i = 0; i < peopleCountingForEachShopResultsSorted.length; i++) {
				var anAjax;
				(function() {
					var k = i;
					anAjax = $.ajax({
						type : "get",
						url : "databaseConnection",
						data : {
							start : startTime,
							end : currentTime,
							storeId : shops[peopleCountingForEachShopResultsSorted[i].id].id,
							interval : interval,
							userMac : 0,
							type : "count"
						},
						traditional: true,
						success : function(json) {
							var j = 0;
							var sum = 0;
							peopleCountForTop5ShopResults[k] = [];
							for ( var prop in json)
								peopleCountForTop5ShopResults[k].push(json["dataPoint" + ++j]);
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
				drawPeopleCountForTop5ShopGraph(peopleCountForTop5ShopResults, peopleCountingForEachShopResultsSorted);
			});
		});
	});
});