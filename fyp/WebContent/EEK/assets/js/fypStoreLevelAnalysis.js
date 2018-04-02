var interval = 1;
var startTime = 0, endTime = 0;
var charts = [];
var dwellTimeThresholds = [120, 300, 600, 1200, 1800];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

function getTimeFormat(interval) {
	switch (interval) {
	case 1:
		return 'DD MMM, HH:00';
	case 24:
		return 'DD MMM YYYY';
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

function changeScopeWithStoreId(sc, stid, lengthOfMovingAverage, bounceSD) {
	switch (Number(sc)) {
	case 0:
		interval = 1;
		break;
	case 1:
		interval = 24;
		break;
	case 2:
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
	else {
		var storeId = stid, numberOfVisitors = [], numberOfVisitorsMA = [], maInterval = lengthOfMovingAverage, averageVisitors = 0;
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
					mallId: area,
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
					mallId: area,
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
				mallId: area,
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
		if ((endTime - startTime) <= 3 * 86400000)
			$(".freq").text("Not Applicable");
		else
			$.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: area,
					storeId : storeId,
					interval : 0,
					type : "freq",
					lengthOfMovingAverage: 1
				},
				traditional: true,
				success : function(json) {
					var i = 0;
					var freqRatio = [];
					for ( var prop in json)
						freqRatio.push(json["dataPoint" + ++i]);
					$(".freq").text(freqRatio[0].toFixed(2) + "%");
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
				mallId: area,
				storeId : storeId,
				interval : 0,
				type : "bounce",
				lengthOfMovingAverage: 1,
				bounceSD: bounceSD
			},
			traditional: true,
			success : function(json) {
				var i = 0;
				var bounceRate = [];
				for ( var prop in json)
					bounceRate.push(json["dataPoint" + ++i]);
				$(".bounce").text(bounceRate[0].toFixed(2) + "%");
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
				mallId: area,
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
	}
}

function ajaxGettingStores(mallName) {
	return $.ajax({
		type : "post",
		url : "prepareStores",
		data : { mallName: mallName },
		traditional: true,
		success : function(json) {
			var shops = [];
			for ( var prop in json)
				shops.push({ id: json[prop], name: prop });
			shops.sort(function (a, b) {
				return a.name.localeCompare( b.name );
			});
			var select_html = "";
			for (var i = 0; i < shops.length; i++)
				select_html += "<option value=\"" + shops[i].id + "\">" + shops[i].name + "</option>";
			$("#storeId").html(select_html);
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
	if (localStorage.getItem("area_id") === null || localStorage.getItem("area_id") === undefined)
		changeArea("base_1");
	else
		changeArea(localStorage.getItem("area_id"));
	const endOfYesterday = moment().utcOffset(serverTimeZone).startOf('day'), startDate = endOfYesterday.clone().subtract(1, 'days'), endDate = endOfYesterday;
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			self.children('span').html(start.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm') + " to " + end.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm'));
			self.attr('start', start);
			self.attr('end', end);
			startTime = Number($(calendar_pickers[index]).attr('start'));
			endTime = Number($(calendar_pickers[index]).attr('end'));
			var hours = Math.floor(moment.duration(end.diff(start)).asHours());
			if (hours > 168) {
				$("#hourly").attr("disabled", "disabled");
				$("#scope").val("1").change();
			}
			else
				$("#hourly").removeAttr("disabled");
			if (hours < 960) {
				$("#monthly").attr("disabled", "disabled");
				$("#scope").val("1").change();
			}
			else
				$("#monthly").removeAttr("disabled");
			if (hours < 48) {
				$("#daily").attr("disabled", "disabled");
				$("#scope").val("0").change();
			}
			else if (hours > 2016) {
				$("#daily").attr("disabled", "disabled");
				$("#scope").val("2").change();
			}
			else
				$("#daily").removeAttr("disabled");
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
			minDate: '1 January 2015',
			maxDate: 'now',
			timePickerIncrement: 60
		}, date_cb);
	});
	$.when(ajaxGettingStores("base_1")).done(function(a1) {
		changeScopeWithStoreId(document.getElementById("scope").value, document.getElementById("storeId").value, document.getElementById("lengthOfMovingAverage").value, document.getElementById("bounceSD").value);
	});
});