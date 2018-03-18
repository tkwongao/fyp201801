var scope = 0;
var interval = 1;
var startTime = 0, endTime = 0;
var charts = [];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

function drawGraph(data) {
	var lineChart_Second = nv.models.lineChart();
	charts.push(lineChart_Second);
	var barChart_Second = nv.models.multiBarChart();
	charts.push(barChart_Second);
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
		barChart_Second.forceY([0, 1]).margin({"bottom": 120})/*.color(['#00b19d'])*/.stacked(false).showControls(false);
		barChart_Second.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});
		barChart_Second.yAxis.axisLabel('Average Dwell Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.bar-chart-second svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Average Dwell Time (seconds)')).transition().duration(500).call(barChart_Second);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(barChart_Second.update);
		return barChart_Second;
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
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : endTime,
			mallId: area,
			storeId : storeId,
			interval : 0,
			userMac : 0,
			type : "average"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var averageDwellTime = [];
			for ( var prop in json)
				averageDwellTime.push(json["dataPoint" + ++i]);
			$(".averageDwellTime").text(averageDwellTime[0]);
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
			end : endTime,
			mallId: area,
			storeId : storeId,
			interval : interval,
			userMac : 0,
			type : "average"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var averageDwellTime = [];
			for ( var prop in json)
				averageDwellTime.push(json["dataPoint" + ++i]);
			drawGraph(averageDwellTime);
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
			var select_html = "<option value=\"-1\" selected>All Stores</option>";
			for (var i = 0; i < shops.length; i++)
				select_html += "<option value=\"" + shops[i].id + "\">" + shops[i].name + "</option>";
			$("#storeId").html(select_html);
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

$(document).ready(function() {
	$("#date").html(moment().format("dddd, D MMMM YYYY"));
	drawGraph([]);
	if (localStorage.getItem("area_id") === null || localStorage.getItem("area_id") === undefined)
		changeArea("base_1");
	else
		changeArea(localStorage.getItem("area_id"));
	// Till the latest available data; to be replaced by getting the current date
	const endOfYesterday = moment().startOf('day'), startDate = moment("23 October 2017, 00:00", "D MMMM YYYY, HH:mm"), endDate = moment("23 October 2017, 22:00", "D MMMM YYYY, HH:mm");
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			self.children('span').html(start.format('D MMMM YYYY, HH:mm') + " to " + end.format('D MMMM YYYY, HH:mm'));
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