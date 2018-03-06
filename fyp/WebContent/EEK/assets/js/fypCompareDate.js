var numberOfDataInGraph = 30;
var scope = 0;
var interval = 1;

function changeScope(i, requestType) {
	switch (i) {
	case 0:
		$("#scope").text("Past Day");
		interval = 1;
		numberOfDataInGraph = 24;
		break;
	case 1:
		$("#scope").text("Past 7 Days");
		interval = 24;
		numberOfDataInGraph = 7;
		break;
	case 2:
		$("#scope").text("Past Month");
		interval = 24;
		numberOfDataInGraph = 30;
		break;
	case 3:
		$("#scope").text("Past 3 Months");
		interval = 720;
		numberOfDataInGraph = 3;
		break;
	case 4:
		$("#scope").text("Past Year");
		interval = 720;
		numberOfDataInGraph = 12;
		break;
	default:
		interval = -1;
	break;
	}
	scope = i;
	var requestTypeL = requestType.toLowerCase();
	if (requestTypeL === "average")
		updateDwellTimeGraph();
	else if (requestTypeL === "loyalty")
		updateLoyaltyGraph();
	else if (requestTypeL === "index")
		updateIndexGraph();
}

var startTimes = [0, 0], endTimes = [0, 0];
var charts = [];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawPeopleCountingGraph = function(data) {
	'use strict';
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	const MILLISECONDS_IN_A_DAY = 86400000;
	function getPeopleCountingData() {
		var datum = [];
		if (Array.isArray(data)) {
			var colors = ["#00b19d", "#ef5350"];
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = numberOfDataInGraph - 1; j >= 0; j--)
					values.push({
						x: numberOfDataInGraph - j,
						y: data[i][j]
					});
				datum.push({
					values: values,
					key: 'Number of Visit for the month before ' + new Intl.DateTimeFormat(
							"en-HK", {
								weekday : "long",
								year : "numeric",
								day : "numeric",
								month : "long"
							}).format(new Date(endTimes[i])),
							color: colors[i],
							area: true
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true);
		peopleCountingChart.xAxis.axisLabel('Days before the compared date').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d;
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
		var datum = [];
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = numberOfDataInGraph - 1; j >= 0; j--)
					values.push({
						x: numberOfDataInGraph - j,
						y: data[i][j]
					});
				datum.push({
					values: values,
					key: 'Average Dwell Time (seconds) for the month before ' + new Intl.DateTimeFormat(
							"en-HK", {
								weekday : "long",
								year : "numeric",
								day : "numeric",
								month : "long"
							}).format(new Date(endTimes[i]))
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		averageDwellTimeChart.forceY([0, 1]).margin({"bottom": 80})/*.color(['#00b19d'])*/.stacked(false).showControls(false);
		averageDwellTimeChart.xAxis.axisLabel('Days before the compared date').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d;
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
})(jQuery);

function updateIndexGraph() {
	var valFromDB1 = new Array(2);
	for (var i = 0; i < valFromDB1.length; i++)
		valFromDB1[i] = [];
	var valFromDB2 = new Array(2);
	for (var i = 0; i < valFromDB1.length; i++)
		valFromDB2[i] = [];
	for (var i = 0; i < 2; i++) {
		(function() {
			var k = i;
			$.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : startTimes[i],
					end : endTimes[i],
					storeId : -1,
					interval : 0,
					userMac : 0,
					type : "count"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var totalVisitorCount = new Array();
					for ( var prop in json)
						totalVisitorCount.push(json["dataPoint" + ++j]);
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
					start : startTimes[i],
					end : endTimes[i],
					storeId : -1,
					interval : 0,
					userMac : 0,
					type : "average"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var totalAverageDwellTime = new Array();
					for ( var prop in json)
						totalAverageDwellTime.push(json["dataPoint" + ++j]);
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
					start : startTimes[i],
					end : endTimes[i],
					storeId : -1,
					interval : interval,
					userMac : 0,
					type : "count"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var sum = 0;
					var peopleCounting = new Array();
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + ++j];
						peopleCounting.push(thisDataPoint);
						sum += thisDataPoint;
					}
					valFromDB1[k] = peopleCounting;
					$(".dailyVisitors").text(sum / peopleCounting.length);
					$("#todayVisitors").text(peopleCounting[peopleCounting.length - 1]);
					$("#yesterdayVisitors").text(peopleCounting[peopleCounting.length - 2]);
					drawPeopleCountingGraph(valFromDB1);
				},
				statusCode: {
					501: function() {
						window.location.href = "EEK/pages-501.html";
					},
					500: function() {
						window.location.href = "EEK/pages-500.html";
					}
				},
			});
			$.ajax({
				type : "get",
				url : "databaseConnection",
				data : {
					start : startTimes[i],
					end : endTimes[i],
					storeId : -1,
					interval : interval,
					userMac : 0,
					type : "average"
				},
				traditional: true,
				success : function(json) {
					var j = 0;
					var sum = 0;
					var averageDwellTime = new Array();
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + ++j];
						averageDwellTime.push(thisDataPoint);
						sum += thisDataPoint;
					}
					valFromDB2[k] = averageDwellTime;
					$("#todayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 1]);
					$("#yesterdayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 2]);
					drawAverageDwellTimeGraph(valFromDB2);
				},
				statusCode: {
					501: function() {
						window.location.href = "EEK/pages-501.html";
					},
					500: function() {
						window.location.href = "EEK/pages-500.html";
					}
				},
			});
		})();
	}
}

$( document ).ready(function() {
	$("#date").html(new Intl.DateTimeFormat(
			"en-HK", {
				weekday : "long",
				year : "numeric",
				day : "numeric",
				month : "long"
			}).format(new Date()));
	const endOfYesterday = moment().startOf('day'), startDate = moment("23 September 2017", "D MMMM YYYY"), endDate = moment("23 October 2017", "D MMMM YYYY");
	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.children('span').html('Date and Time');
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			self.children('span').html(start.format('D MMMM YYYY, HH:mm') + " to " + end.format('D MMMM YYYY, HH:mm'));
			self.attr('start', start);
			self.attr('end', end);
			startTimes[index] = Number($(calendar_pickers[index]).attr('start'));
			endTimes[index] = Number($(calendar_pickers[index]).attr('end'));
			if (index + 1 < calendar_pickers.length)
				calendar_pickers.eq(index + 1).click();
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