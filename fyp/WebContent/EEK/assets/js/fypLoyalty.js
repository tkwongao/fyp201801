var scope = 0;
var interval = 1;
var startTime = 0, endTime = 0;
var charts = [];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

function drawLoyaltyCountingGraph(data) {
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
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
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 120}).useInteractiveGuideline(true).xScale(d3.time.scale());
		peopleCountingChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});
		peopleCountingChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.userLoyaltyCheckChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Number of Visit')).transition().duration(500).call(peopleCountingChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountingChart.update);
		return peopleCountingChart;
	});
}

function drawUserStayTimeGraph(data) {
	var userStayTimeChart = nv.models.multiBarChart();
	charts.push(userStayTimeChart);
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getData() {
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: endTime + MILLISECONDS_PER_INTERVAL * (i - data.length),
					y: data[i]
				});
			return [{
				values: values,
				key: 'User Stay Time (seconds)'
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
		userStayTimeChart.forceY([0, 1]).margin({"bottom": 120}).stacked(false).showControls(false);
		userStayTimeChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});
		userStayTimeChart.yAxis.axisLabel('User Stay Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.userStayTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData()).transition().duration(500).call(userStayTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(userStayTimeChart.update);
		return userStayTimeChart;
	});
}

function changeScopeWithMac(sc, macAddress, stid) {
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
	var userMac = macAddress;
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
			userMac : userMac,
			type : "loyalty"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var loyalty = [];
			for ( var prop in json)
				loyalty.push(json["dataPoint" + ++i]);
			$("#loyalty").text(loyalty[0]);
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
			interval : 0,
			userMac : userMac,
			type : "user"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var userDwellTime = [];
			for ( var prop in json)
				userDwellTime.push(json["dataPoint" + ++i]);
			$("#userDwellTime").text(userDwellTime[0]);
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
			userMac : userMac,
			type : "loyalty"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var loyaltyCounting = [];
			for ( var prop in json)
				loyaltyCounting.push(json["dataPoint" + ++i]);
			drawLoyaltyCountingGraph(loyaltyCounting);
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
			userMac : userMac,
			type : "user"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var userStayTime = [];
			for ( var prop in json)
				userStayTime.push(json["dataPoint" + ++i]);
			drawUserStayTimeGraph(userStayTime);
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
	drawLoyaltyCountingGraph([]);
	drawUserStayTimeGraph([]);
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
	ajaxGettingStores("base_1");
});