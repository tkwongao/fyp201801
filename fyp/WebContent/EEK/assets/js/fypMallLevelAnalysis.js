var interval = 1, startTime = 0, endTime = 0;
var charts = [], shops = [], dwellTimeThresholds = [120, 300, 600, 1200, 1800];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

function getTimeFormat(interval) {
	switch (interval) {
	case 1:
		return 'D MMM, HH:00';
	case 24:
	case 168:
		return 'D MMM YYYY';
	case 720:
		return 'MMM YYYY';
	default:
		return undefined;
	}
}

function drawPeopleCountingGraph(data, ma, maInterval, avg) {
	var chart = nv.models.lineChart();
	charts.push(chart);
	function getPeopleCountingData() {
		var MILLISECONDS_PER_INTERVAL = 3600000 * interval;
		var datum = [];
		var a;
		switch (interval) {
		case 1:
			a = "hour";
			break;
		case 24:
			a = "day";
			break;
		case 168:
			a = "week";
			break;
		case 720:
			a = "month";
			break;
		}
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: endTime + MILLISECONDS_PER_INTERVAL * (i - data.length),
					y: data[i]
				});
			datum.push({
				values: values,
				key: 'Number of Visit',
				area: true
			});
			if (Array.isArray(ma)) {
				var maIntervalStr = maInterval + " " + a;
				switch (maInterval * interval) {
				case 24:
					maIntervalStr = "Daily";
				case 168:
					maIntervalStr = "Weekly";
				}
				values = [];
				for (var i = 0; i < ma.length; i++)
					values.push({
						x: endTime + MILLISECONDS_PER_INTERVAL * (i - ma.length),
						y: ma[i]
					});
				datum.push({
					values: values,
					key: maIntervalStr + ' Moving Average of Number of Visit',
					color: "#999999"
				});
			}
			if (!isNaN(avg * 1)) {
				datum.push({
					values: function() {
						var arr = [];
						for (var i = 0; i < data.length; i++)
							arr.push({
								x: endTime + MILLISECONDS_PER_INTERVAL * (i - data.length),
								y: avg
							});
						return arr;
					}(),
					key: 'Average Number of Visit per ' + a,
					color: "#000000",
					area: false
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		chart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true).xScale(d3.time.scale());
		chart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		chart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.numberOfVisitChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountingData()).transition().duration(500).call(chart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(chart.update);
		return chart;
	});
}

function drawAverageDwellTimeGraph(data) {
	var chart = nv.models.multiBarChart();
	charts.push(chart);
	function getData(key) {
		var MILLISECONDS_PER_INTERVAL = 3600000 * interval;
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: endTime + MILLISECONDS_PER_INTERVAL * (i - data.length),
					y: data[i]
				});
			return [{
				values: values,
				key: key,
				area: true
			}];
		}
		return [];
	}
	nv.addGraph(function() {
		chart.forceY([0, 1]).margin({"bottom": 120}).stacked(false).showControls(false);
		chart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		chart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Average Dwell Time (seconds)')).transition().duration(500).call(chart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(chart.update);
		return chart;
	});
}

function drawAverageDwellTimeDistributionGraph(data) {
	var averageDwellTimeDistributionChart = nv.models.stackedAreaChart();
	charts.push(averageDwellTimeDistributionChart);
	function getAverageDwellTimeData() {
		var MILLISECONDS_PER_INTERVAL = 3600000 * interval;
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
				for (var j = 0; j < data.length / (dwellTimeThresholds.length + 1); j++)
					values.push({
						x: endTime + MILLISECONDS_PER_INTERVAL * (j - data.length / (dwellTimeThresholds.length + 1)),
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
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		averageDwellTimeDistributionChart.yAxis.axisLabel('Percentage').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeDistribution svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeDistributionChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeDistributionChart.update);
		return averageDwellTimeDistributionChart;
	});
}

function drawPeopleCountForTop5ShopGraph(data, peopleCountingForEachShopResultsSorted) {
	var peopleCountForTop5ShopChart = nv.models.stackedAreaChart();
	charts.push(peopleCountForTop5ShopChart);
	function getPeopleCountForTop5ShopData() {
		var MILLISECONDS_PER_INTERVAL = 3600000 * interval;
		var datum = [];
		if (Array.isArray(data))
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = 0; j < data[i].length; j++)
					values.push({
						x: endTime + MILLISECONDS_PER_INTERVAL * (j - data[i].length),
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
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		peopleCountForTop5ShopChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.peopleCountForTop5ShopChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountForTop5ShopData()).transition().duration(500).call(peopleCountForTop5ShopChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountForTop5ShopChart.update);
		return peopleCountForTop5ShopChart;
	});
}

function drawFreqBounceGraph(freq, bounce, maFreq, maBounce, maInterval, avgFreq, avgBounce) {
	var chart = nv.models.lineChart();
	charts.push(chart);
	function getData() {
		var MILLISECONDS_PER_INTERVAL = 3600000 * interval;
		var datum = [];
		var a;
		switch (interval) {
		case 1:
			a = "hour";
			break;
		case 24:
			a = "day";
			break;
		case 168:
			a = "week";
			break;
		case 720:
			a = "month";
			break;
		}
		if (Array.isArray(freq) && interval > 72) {
			var values = [];
			for (var i = 0; i < freq.length; i++)
				values.push({
					x: endTime + MILLISECONDS_PER_INTERVAL * (i - freq.length),
					y: freq[i]
				});
			datum.push({
				values: values,
				key: 'Ratio of Frequent Users',
				color: "#4CAF50",
				area: true
			});
			if (Array.isArray(maFreq)) {
				var maIntervalStr = maInterval + " " + a;
				switch (maInterval * interval) {
				case 24:
					maIntervalStr = "Daily";
				case 168:
					maIntervalStr = "Weekly";
				}
				values = [];
				for (var i = 0; i < maFreq.length; i++)
					values.push({
						x: endTime + MILLISECONDS_PER_INTERVAL * (i - maFreq.length),
						y: maFreq[i]
					});
				datum.push({
					values: values,
					key: maIntervalStr + ' Moving Average of Ratio of Frequent Users',
					color: "#81C784"
				});
			}
			if (!isNaN(avgFreq * 1)) {
				datum.push({
					values: function() {
						var arr = [];
						for (var i = 0; i < freq.length; i++)
							arr.push({
								x: endTime + MILLISECONDS_PER_INTERVAL * (i - freq.length),
								y: avgFreq
							});
						return arr;
					}(),
					key: 'Average Ratio of Frequent Users per ' + a,
					color: "#1B5E20",
					area: false
				});
			}
		}
		if (Array.isArray(bounce)) {
			var values = [];
			for (var i = 0; i < bounce.length; i++)
				values.push({
					x: endTime + MILLISECONDS_PER_INTERVAL * (i - bounce.length),
					y: bounce[i]
				});
			datum.push({
				values: values,
				key: 'Bounce Rate',
				color: "#F44336",
				area: true
			});
			if (Array.isArray(maBounce)) {
				var maIntervalStr = maInterval + " " + a;
				switch (maInterval * interval) {
				case 24:
					maIntervalStr = "Daily";
				case 168:
					maIntervalStr = "Weekly";
				}
				values = [];
				for (var i = 0; i < maBounce.length; i++)
					values.push({
						x: endTime + MILLISECONDS_PER_INTERVAL * (i - maBounce.length),
						y: maBounce[i]
					});
				datum.push({
					values: values,
					key: maIntervalStr + ' Moving Average of Bounce Rate',
					color: "#E57373"
				});
			}
			if (!isNaN(avgBounce * 1)) {
				datum.push({
					values: function() {
						var arr = [];
						for (var i = 0; i < bounce.length; i++)
							arr.push({
								x: endTime + MILLISECONDS_PER_INTERVAL * (i - bounce.length),
								y: avgBounce
							});
						return arr;
					}(),
					key: 'Average Bounce Rate per ' + a,
					color: "#B71C1C",
					area: false
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		chart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true).xScale(d3.time.scale());
		chart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		chart.yAxis.axisLabel('Ratio').scale(100).tickFormat(function (d) {
			return d.toFixed(2) + "%";
		});
		d3.select('.freqBounceChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData()).transition().duration(500).call(chart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(chart.update);
		return chart;
	});
}

function drawDeviceBrandDistributionGraph(data, brands) {
	var chart = nv.models.pieChart();
	charts.push(chart);
	function getData(key) {
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: brands[i],
					y: data[i]
				});
			return values;
		}
		return [];
	}
	nv.addGraph(function() {
		chart.showLabels(true).labelType("percent").donut(true).donutRatio(1.0 / 3);
		d3.select('.deviceBrandDistribution svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Average Dwell Time (seconds)')).transition().duration(500).call(chart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(chart.update);
		return chart;
	});
}

function changeScopeWithStoreId(sc, lengthOfMovingAverage, bounceSD) {
	switch (Number(sc)) {
	case 0:
		interval = 1;
		break;
	case 1:
		interval = 24;
		break;
	case 2:
		interval = 168;
		break;
	case 3:
		interval = 720;
		break;
	default:
		interval = -1;
	break;
	}
	if (bounceSD < 0 || bounceSD > 3)
		alert("Please enter a valid threshold for Bounce Rate in standard derivation, between 0 and 3.");
	else if (lengthOfMovingAverage < 2 || lengthOfMovingAverage > 127)
		alert("Please enter a valid length of Moving Average, between 2 and 127.");
	else
		$.when(ajaxGettingStores(area)).done(function(a1) {
			var storeId = -1, numberOfVisitors = [], numberOfVisitorsMA = [], maInterval = lengthOfMovingAverage, averageVisitors = 0;
			$.when(ajax1(), ajax2()).done(function(a1, a2) {
				drawPeopleCountingGraph(numberOfVisitors, numberOfVisitorsMA, maInterval, averageVisitors);
			});
			function ajax1() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "count",
						lengthOfMovingAverage: 1
					},
					traditional: true,
					success : function(json) {
						var i = 0, sum = 0;
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + i++];
							if (i !== 1) {
								numberOfVisitors.push(thisDataPoint);
								sum += thisDataPoint;
							}
							else
								$(".totalVisitorCount").text(thisDataPoint);
						}
						averageVisitors = sum / numberOfVisitors.length;
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			function ajax2() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "count",
						lengthOfMovingAverage: maInterval
					},
					traditional: true,
					success : function(json) {
						var i = 0;
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + i++];
							if (i !== 1)
								numberOfVisitorsMA.push(thisDataPoint);
						}
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			$.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: mall,
					storeId : storeId,
					interval : interval,
					type : "average",
					lengthOfMovingAverage: 1
				},
				traditional: true,
				success : function(json) {
					var i = 0;
					var averageDwellTime = [];
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + i++];
						if (i !== 1)
							averageDwellTime.push(thisDataPoint);
						else
							$(".totalAverageDwellTime").text(thisDataPoint.toFixed(2));
					}
					drawAverageDwellTimeGraph(averageDwellTime);
				},
				statusCode: {
					501: function() {
						window.location.href = "pages-501.html";
					},
					500: function() {
						window.location.href = "pages-500.html";
					}
				}
			});
			var bounce, averageBounce, bounceMA, freq, averageFreq, freqMA;
			$.when(ajax3(), ajax4(), ajax5(), ajax6()).done(function(a3, a4, a5, a6) {
				drawFreqBounceGraph(freq, bounce, freqMA, bounceMA, maInterval, averageFreq, averageBounce);
			});
			function ajax3() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "bounce",
						lengthOfMovingAverage: 1,
						bounceSD: bounceSD
					},
					traditional: true,
					success : function(json) {
						var i = 0, sum = 0;
						bounce = [];
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + i++];
							if (i !== 1) {
								bounce.push(thisDataPoint);
								sum += thisDataPoint;
							}
							else
								$(".bounce").text(thisDataPoint.toFixed(2) + "%");
						}
						averageBounce = sum / bounce.length;
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			function ajax4() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "bounce",
						lengthOfMovingAverage: maInterval,
						bounceSD: bounceSD
					},
					traditional: true,
					success : function(json) {
						var i = 0;
						bounceMA = [];
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + i++];
							if (i !== 1)
								bounceMA.push(thisDataPoint);
						}
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			function ajax5() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "freq",
						lengthOfMovingAverage: 1
					},
					traditional: true,
					success : function(json) {
						if ((endTime - startTime) > 3 * 86400000) {
							var i = 0, sum = 0;
							freq = [];
							for ( var prop in json) {
								var thisDataPoint = json["dataPoint" + i++];
								if (i !== 1) {
									freq.push(thisDataPoint);
									sum += thisDataPoint;
								}
								else
									$(".freq").text(thisDataPoint.toFixed(2) + "%");
							}
							averageFreq = sum / freq.length;
						}
						else
							$(".freq").text("Not Applicable");
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			function ajax6() {
				return $.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTime,
						end : endTime,
						mallId: mall,
						storeId : storeId,
						interval : interval,
						type : "freq",
						lengthOfMovingAverage: maInterval
					},
					traditional: true,
					success : function(json) {
						if ((endTime - startTime) > 3 * 86400000) {
							var i = 0;
							freqMA = [];
							for ( var prop in json) {
								var thisDataPoint = json["dataPoint" + i++];
								if (i !== 1)
									freqMA.push(thisDataPoint);
							}
						}
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					}
				});
			}
			$.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: mall,
					storeId : storeId,
					interval : interval,
					type : "avgTimeDistribution",
					lengthOfMovingAverage: 1,
					dwellTimeThresholds: dwellTimeThresholds
				},
				traditional: true,
				success : function(json) {
					var i = 0;
					var averageDwellTimeDistribution = [];
					for ( var prop in json) {
						if (i > dwellTimeThresholds.length)
							averageDwellTimeDistribution.push(json["dataPoint" + i]);
						i++;
					}
					drawAverageDwellTimeDistributionGraph(averageDwellTimeDistribution);
				},
				statusCode: {
					501: function() {
						window.location.href = "pages-501.html";
					},
					500: function() {
						window.location.href = "pages-500.html";
					}
				}
			});
			$.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: mall,
					storeId : storeId,
					interval : 0,
					type : "oui",
					lengthOfMovingAverage: 1
				},
				traditional: true,
				success : function(json) {
					var sorted = [], ouiDistribution = [], brands = [];
					for ( var prop in json)
						if (prop === "ZZZZUnknown") {
							brands.push("Unknown");
							ouiDistribution.push(json[prop]);
							break;
						}
					for ( var prop in json)
						if (prop === "ZZZZMinor brands") {
							brands.push("Minor brands");
							ouiDistribution.push(json[prop]);
						}
						else if (prop !== "ZZZZUnknown")
							sorted.push([prop, json[prop]]);
					sorted.sort(function(a, b) {
						return a[1] - b[1];
					});
					for ( var item in sorted) {
						brands.push(sorted[item][0]);
						ouiDistribution.push(sorted[item][1]);
					}
					drawDeviceBrandDistributionGraph(ouiDistribution.reverse(), brands.reverse());
				},
				statusCode: {
					501: function() {
						window.location.href = "pages-501.html";
					},
					500: function() {
						window.location.href = "pages-500.html";
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
						type : "post",
						url : "databaseConnection",
						data : {
							start : startTime,
							end : endTime,
							mallId: area,
							storeId : shops[i].id,
							interval : 0,
							type : "count",
							lengthOfMovingAverage: 1
						},
						traditional: true,
						success : function(json) {
							var j = 0;
							var thisStoreCount = [];
							for ( var prop in json)
								thisStoreCount.push(json["dataPoint" + ++j]);
							peopleCountingForEachShopResults[k] = {"id": k, "count": thisStoreCount[0]};
						},
						statusCode: {
							501: function() {
								window.location.href = "pages-501.html";
							},
							500: function() {
								window.location.href = "pages-500.html";
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
							type : "post",
							url : "databaseConnection",
							data : {
								start : startTime,
								end : endTime,
								mallId: area,
								storeId : shops[peopleCountingForEachShopResultsSorted[i].id].id,
								interval : interval,
								type : "count",
								lengthOfMovingAverage: 1
							},
							traditional: true,
							success : function(json) {
								var j = 0;
								var sum = 0;
								peopleCountForTop5ShopResults[k] = [];
								for ( var prop in json) {
									var thisDataPoint = json["dataPoint" + j++];
									if (j !== 1)
										peopleCountForTop5ShopResults[k].push(thisDataPoint);
								}
							},
							statusCode: {
								501: function() {
									window.location.href = "pages-501.html";
								},
								500: function() {
									window.location.href = "pages-500.html";
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
}

function ajaxGettingStores(mallName) {
	return $.ajax({
		type : "post",
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
				window.location.href = "pages-403.html";
			},
			500: function() {
				window.location.href = "pages-500.html";
			}
		}
	});
}

$(document).ready(function() {
	$("#date").html(moment().utcOffset(serverTimeZone).format("dddd, D MMMM YYYY"));
	drawPeopleCountingGraph([]);
	drawAverageDwellTimeGraph([]);
	drawAverageDwellTimeDistributionGraph([]);
	drawFreqBounceGraph([], []);
	drawDeviceBrandDistributionGraph([], []);
	var endOfYesterday = moment().utcOffset(serverTimeZone).startOf('day'), startDate = endOfYesterday.clone().subtract(1, 'days'), endDate = endOfYesterday;
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			self.children('span').html(start.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm') + " to " + end.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm'));
			self.attr('start', start);
			self.attr('end', end);
			startTime = Number($(calendar_pickers[index]).attr('start'));
			endTime = Number($(calendar_pickers[index]).attr('end'));
			var hours = Math.floor(moment.duration(end.diff(start)).asHours()), newValue, requireValueChange = false;
			if (hours > 168) {
				if ($("#scope").val() === "0") {
					newValue = "1";
					requireValueChange = true;
				}
				$("#hourly").attr("disabled", "disabled");
			}
			else
				$("#hourly").removeAttr("disabled");
			if (hours < 48) {
				newValue = "0";
				requireValueChange = true;
				$("#daily").attr("disabled", "disabled");
			}
			else if (hours > 2880) {
				if ($("#scope").val() <= 1) {
					newValue = "2";
					requireValueChange = true;
				}
				$("#daily").attr("disabled", "disabled");
			}
			else
				$("#daily").removeAttr("disabled");
			if (hours < 336) {
				if ($("#scope").val() >= 2) {
					newValue = "1";
					requireValueChange = true;
					if (hours < 48)
						newValue = "0";
				}
				$("#weekly").attr("disabled", "disabled");
			}
			else if (hours > 8736) {
				newValue = "3";
				requireValueChange = true;
				$("#weekly").attr("disabled", "disabled");
			}
			else
				$("#weekly").removeAttr("disabled");
			if (hours < 960) {
				if ($("#scope").val() === "3") {
					newValue = "2";
					requireValueChange = true;
					if (hours < 336)
						newValue = "1";
					if (hours < 48)
						newValue = "0";
				}
				$("#monthly").attr("disabled", "disabled");
			}
			else
				$("#monthly").removeAttr("disabled");
			if (requireValueChange)
				$("#scope").val(newValue).change();
		};
		date_cb(startDate, endDate);
		$(this).daterangepicker({
			"locale": {
				"format": "D MMMM YYYY, HH:mm",
			},
			"ranges": {
				'Yesterday': [endOfYesterday.clone().subtract(1, 'days'), endOfYesterday],
				'Last Week': [endOfYesterday.clone().subtract(7, 'days'), endOfYesterday],
				'Last 30 Days': [endOfYesterday.clone().subtract(30, 'days'), endOfYesterday],
				'Last 3 Months': [endOfYesterday.clone().subtract(3, 'month').startOf('month'), endOfYesterday.clone().startOf('month')],
				'Last 12 Months': [endOfYesterday.clone().subtract(12, 'month').startOf('month'), endOfYesterday.clone().startOf('month')]
			},
			timePicker: true,
			timePicker24Hour: true,
			startDate: startDate,
			endDate: endDate,
			minDate: '1 July 2016',
			maxDate: 'now',
			timePickerIncrement: 60
		}, date_cb);
	});
	$.when(ajaxGettingMalls()).done(setTimeout(function() {
		if (localStorage.getItem("mall_id") === null || localStorage.getItem("mall_id") === undefined)
			changeMall("base_1");
		else
			changeMall(localStorage.getItem("mall_id"));
	}, 1000));
});