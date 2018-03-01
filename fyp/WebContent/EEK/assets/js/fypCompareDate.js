var currentTimes = [0, 0];
var charts = [];
var valFromDB = new Array(4);
for (var j1 = 0; j1 < valFromDB.length; j1++) {
	valFromDB[j1] = new Array(numberOfDataInGraph);
	for (var j2 = 0; j2 < numberOfDataInGraph; j2++)
		valFromDB[j1][j2] = 80;
}

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawPeopleCountingGraph = function($) {
	'use strict';
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountingData() {
		var value1 = [];
		var value2 = [];
		for (var i = 0; i < numberOfDataInGraph; i++) {
			value1.push({
				x: i - numberOfDataInGraph,
				y: valFromDB[0][i]
			});
			value2.push({
				x: i - numberOfDataInGraph,
				y: valFromDB[2][i]
			});
		}
		return [{
			values: value1,
			key: 'Number of Visit for the month before ' + new Intl.DateTimeFormat(
					"en-HK", {
						weekday : "long",
						year : "numeric",
						day : "numeric",
						month : "long"
					}).format(new Date(currentTimes[0])),
					color: "#00b19d",
					area: true
		},
		{
			values: value2,
			key: 'Number of Visit for the month before ' + new Intl.DateTimeFormat(
					"en-HK", {
						weekday : "long",
						year : "numeric",
						day : "numeric",
						month : "long"
					}).format(new Date(currentTimes[1])),
					color: "#ef5350",
					area: true
		}];
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true);
		peopleCountingChart.xAxis.axisLabel('Days before the compared date').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return -d-1;
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
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getAverageDwellTimeData() {
		var value1 = [];
		var value2 = [];
		for (var i = 0; i < numberOfDataInGraph; i++) {
			value1.push({
				x: i - numberOfDataInGraph,
				y: valFromDB[1][i]
			});
			value2.push({
				x: i - numberOfDataInGraph,
				y: valFromDB[3][i]
			});
		}
		return [{
			values: value1,
			key: 'Average Dwell Time (seconds) for the month before ' + new Intl.DateTimeFormat(
					"en-HK", {
						weekday : "long",
						year : "numeric",
						day : "numeric",
						month : "long"
					}).format(new Date(currentTimes[0]))
		},
		{
			values: value2,
			key: 'Average Dwell Time (seconds) for the month before ' + new Intl.DateTimeFormat(
					"en-HK", {
						weekday : "long",
						year : "numeric",
						day : "numeric",
						month : "long"
					}).format(new Date(currentTimes[1]))
		}];
	}
	nv.addGraph(function() {
		averageDwellTimeChart.forceY([0, 1]).margin({"bottom": 80})/*.color(['#00b19d'])*/.stacked(false).showControls(false);
		averageDwellTimeChart.xAxis.axisLabel('Days before the compared date').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return -d-1;
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
})(jQuery);

function updateIndexGraph() {
	var startTime = new Array();
	for (var i1 = 0; i1 < 2; i1++) {
		startTime[i1] = currentTimes[i1] - 3600000 * interval * numberOfDataInGraph;
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime[i1],
				end : currentTimes[i1],
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
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime[i1],
				end : currentTimes[i1],
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
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime[i1],
				end : currentTimes[i1],
				storeId : -1,
				interval : interval,
				userMac : 0,
				type : "count"
			},
			traditional: true,
			success : function(json) {
				const firstArrayIndex = 2 * i1;
				var i = 0;
				var sum = 0;
				var valFromDB3 = new Array();
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + ++i];
					valFromDB3.push(thisDataPoint);
					sum += thisDataPoint;
				}
				valFromDB[firstArrayIndex] = valFromDB3;
				$(".dailyVisitors").text(sum / valFromDB1.length);
				$("#todayVisitors").text(valFromDB[firstArrayIndex][valFromDB[firstArrayIndex].length - 1]);
				$("#yesterdayVisitors").text(valFromDB[firstArrayIndex][valFromDB[firstArrayIndex].length - 2]);
				drawPeopleCountingGraph();
			},
			statusCode: {
				501: function() {
					window.location.href = "EEK/pages-501.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
			},
			async: false
		});
		$.ajax({
			type : "get",
			url : "databaseConnection",
			data : {
				start : startTime[i1],
				end : currentTimes[i1],
				storeId : -1,
				interval : interval,
				userMac : 0,
				type : "average"
			},
			traditional: true,
			success : function(json) {
				const firstArrayIndex = 2 * i1 + 1;
				var i = 0;
				var sum = 0;
				var valFromDB4 = new Array();
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + ++i];
					valFromDB4.push(thisDataPoint);
					sum += thisDataPoint;
				}
				valFromDB[firstArrayIndex] = valFromDB4;
				$("#todayAverageDwellTime").text(valFromDB[firstArrayIndex][valFromDB[firstArrayIndex].length - 1]);
				$("#yesterdayAverageDwellTime").text(valFromDB[firstArrayIndex][valFromDB[firstArrayIndex].length - 2]);
				drawAverageDwellTimeGraph();
			},
			statusCode: {
				501: function() {
					window.location.href = "EEK/pages-501.html";
				},
				500: function() {
					window.location.href = "EEK/pages-500.html";
				}
			},
			async: false
		});
	}
}

$( document ).ready(function() {
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.children('span').html('Date and Time');
	calendar_pickers.each(function(index) {
		var self = $(this);
		$(this).daterangepicker({
			singleDatePicker: true,
			timePicker: true,
			timePicker24Hour: true,
			minDate: '01/01/2015',
			maxDate: 'now',
			timePickerIncrement: 30
		}, function (start, end, label) {
			self.children('span').html(start.format('MMMM D, YYYY HH:mm'));
			self.attr('value', start);
			currentTimes[0] = Number($('#startDate').attr('value'));
			currentTimes[1] = Number($('#endDate').attr('value'));
			if (index + 1 < calendar_pickers.length)
				calendar_pickers.eq(index + 1).click();
		});
	});
	var button = $('button[data-target="#searchPanel"]');
	$('div#searchPanel').on('shown.bs.collapse', function (event) {
		button.text('Compare');
		button.prop('disabled', false);
	});
	$('div#searchPanel').on('hidden.bs.collapse', function (event) {
		button.text('Revise Search');
		button.prop('disabled', false);
		changeScope(2, 'index');
	})
	$('button[data-target="#searchPanel"]').click(function(event) {	
		$('div#searchPanel').collapse('toggle');
		$('div#resultPanel').collapse('show');
		$(this).prop('disabled', true);
		event.stopPropagation();
	});
});