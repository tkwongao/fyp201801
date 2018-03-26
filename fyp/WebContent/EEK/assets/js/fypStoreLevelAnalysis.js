var scope = 0;
var interval = 1;
var startTime = 0, endTime = 0;
var charts = [];

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
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getPeopleCountingData() {
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
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getData(key) {
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
		chart.forceY([0, 1]).margin({"bottom": 120})/*.color(['#00b19d'])*/.stacked(false).showControls(false);
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

function changeScopeWithStoreId(sc, stid) {
	switch (sc) {
	case 0:
		$("#scope").text("Hourly Data");
		interval = 1;
		break;
	case 1:
		$("#scope").text("Daily Data");
		interval = 24;
		break;
	case 2:
		$("#scope").text("Monthly Data");
		interval = 720;
		break;
	default:
		interval = -1;
	break;
	}
	scope = sc;
	var storeId = stid;
	var numberOfVisitors = [], numberOfVisitorsMA = [], maInterval = 5, averageVisitors = 0;
	$.when(ajax1(), ajax2()).done(function(a1, a2) {
		drawPeopleCountingGraph(numberOfVisitors, numberOfVisitorsMA, maInterval, averageVisitors);
	});
	function ajax1() {
		return $.ajax({
			type : "get",
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
				var i = 0;
				var sum = 0;
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
			type : "get",
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
		type : "get",
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
	$.ajax({
		type : "get",
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
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : endTime,
			mallId: area,
			storeId : storeId,
			interval : 0,
			type : "bounce",
			lengthOfMovingAverage: 1
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
}

function ajaxGettingStores(mallName) {
	return $.ajax({
		type : "get",
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
	if (localStorage.getItem("area_id") === null || localStorage.getItem("area_id") === undefined)
		changeArea("base_1");
	else
		changeArea(localStorage.getItem("area_id"));
	// To be replaced by getting the current date
	const endOfYesterday = moment().utcOffset(serverTimeZone).startOf('day'), startDate = moment("27 October 2017, 00:00 " + serverTimeZone, "D MMMM YYYY, HH:mm ZZ"),
	endDate = moment("28 October 2017, 00:00 " + serverTimeZone, "D MMMM YYYY, HH:mm ZZ");
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			self.children('span').html(start.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm') + " to " + end.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm'));
			self.attr('start', start);
			self.attr('end', end);
			startTime = Number($(calendar_pickers[index]).attr('start'));
			endTime = Number($(calendar_pickers[index]).attr('end'));
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
			timePickerIncrement: 30
		}, date_cb);
	});
	$.when(ajaxGettingStores("base_1")).done(function(a1) {
		changeScopeWithStoreId(0, document.getElementById("storeId").value);
	});
});