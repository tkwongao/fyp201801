var interval = 1, counter = 0;
var invalidDateBit = false;
var startTimes = [0, 0], endTimes = [0, 0];
var charts = [], shops = [];

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

function drawPeopleCountingGraph(data) {
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	var a;
	switch (interval) {
	case 1:
		a = "Hours";
		break;
	case 24:
		a = "Days";
		break;
	case 168:
		a = "Weeks";
		break;
	case 720:
		a = "Months";
		break;
	}
	function getPeopleCountingData() {
		var datum = [];
		if (Array.isArray(data)) {
			var colors = ["#F44336", "#4caf50"];
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = 0; j < data[i].length; j++)
					values.push({
						x: j,
						y: data[i][j]
					});
				datum.push({
					values: values,
					key: 'Number of Visit for the period between ' + moment(startTimes[i]).utcOffset(serverTimeZone).format(getTimeFormat(interval)) + ' and ' +
					moment(endTimes[i]).utcOffset(serverTimeZone).format(getTimeFormat(interval)),
					color: colors[i],
					area: false
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true);
		peopleCountingChart.xAxis.axisLabel(a + ' after start of period').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d;
		});
		peopleCountingChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.numberOfVisitChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountingData()).transition().duration(500).call(peopleCountingChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountingChart.update);
		return peopleCountingChart;
	});
}

function drawAverageDwellTimeGraph(data) {
	var averageDwellTimeChart = nv.models.multiBarChart();
	charts.push(averageDwellTimeChart);
	var a;
	switch (interval) {
	case 1:
		a = "Hours";
		break;
	case 24:
		a = "Days";
		break;
	case 168:
		a = "Weeks";
		break;
	case 720:
		a = "Months";
		break;
	}
	function getAverageDwellTimeData() {
		var datum = [];
		if (Array.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				var values = [];
				for (var j = 0; j < data[i].length; j++)
					values.push({
						x: j,
						y: data[i][j]
					});
				datum.push({
					values: values,
					key: 'Average Dwell Time (seconds) for the period between ' + moment(startTimes[i]).utcOffset(serverTimeZone).format(getTimeFormat(interval)) + ' and ' +
					moment(endTimes[i]).utcOffset(serverTimeZone).format(getTimeFormat(interval)),
				});
			}
		}
		return datum;
	}
	nv.addGraph(function() {
		averageDwellTimeChart.forceY([0, 1]).margin({"bottom": 80}).stacked(false).showControls(false);
		averageDwellTimeChart.xAxis.axisLabel(a + ' after start of period').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d;
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
}

function changeScope(sc, stid) {
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
	if (invalidDateBit)
		alert("Please enter valid date ranges for comparison.");
	else
	{
		var valFromDB1 = new Array(2);
		for (var i = 0; i < valFromDB1.length; i++)
			valFromDB1[i] = [];
		var valFromDB2 = new Array(2);
		for (var i = 0; i < valFromDB2.length; i++)
			valFromDB2[i] = [];
		for (var i = 0; i < 2; i++) {
			(function() {
				var k = i;
				$.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTimes[i],
						end : endTimes[i],
						mallId: area,
						storeId : stid,
						interval : interval,
						type : "count",
						lengthOfMovingAverage: 1
					},
					traditional: true,
					success : function(json) {
						var j = 0;
						var sum = 0;
						var numberOfVisitors = new Array();
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + j++];
							if (j !== 1) {
								numberOfVisitors.push(thisDataPoint);
								sum += thisDataPoint;
							}
							else
								$(".totalVisitorCount").text(thisDataPoint);
						}
						valFromDB1[k] = numberOfVisitors;
						$(".dailyVisitors").text(sum / numberOfVisitors.length);
						$("#todayVisitors").text(numberOfVisitors[numberOfVisitors.length - 1]);
						$("#yesterdayVisitors").text(numberOfVisitors[numberOfVisitors.length - 2]);
						drawPeopleCountingGraph(valFromDB1);
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					},
				});
				$.ajax({
					type : "post",
					url : "databaseConnection",
					data : {
						start : startTimes[i],
						end : endTimes[i],
						mallId: area,
						storeId : stid,
						interval : interval,
						type : "average",
						lengthOfMovingAverage: 1
					},
					traditional: true,
					success : function(json) {
						var j = 0;
						var sum = 0;
						var averageDwellTime = new Array();
						for ( var prop in json) {
							var thisDataPoint = json["dataPoint" + j++];
							if (j !== 1)
								averageDwellTime.push(thisDataPoint);
							else
								$(".totalAverageDwellTime").text(thisDataPoint.toFixed(2));
						}
						valFromDB2[k] = averageDwellTime;
						$("#todayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 1]);
						$("#yesterdayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 2]);
						drawAverageDwellTimeGraph(valFromDB2);
					},
					statusCode: {
						501: function() {
							window.location.href = "pages-501.html";
						},
						500: function() {
							window.location.href = "pages-500.html";
						}
					},
				});
			})();
		}
	}
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
			var select_html = "<option value=\"-1\" selected=\"selected\">All Stores</option>";
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

$( document ).ready(function() {
	$("#date").html(moment().utcOffset(serverTimeZone).format("dddd, D MMMM YYYY"));
	drawPeopleCountingGraph([]);
	drawAverageDwellTimeGraph([]);
	// To be replaced by getting the current date
	var endOfYesterday = moment().startOf('day'), startDate = endOfYesterday.clone().subtract(7, 'days'), endDate = endOfYesterday;
	var calendar_pickers = $('div.calendar-picker'), hours = 0;
	calendar_pickers.each(function(index) {
		var self = $(this);
		function date_cb(start, end) {
			invalidDateBit = false;
			if (index + 1 < calendar_pickers.length) {
				if (counter > 0) {
					var range2Data = calendar_pickers.eq(index + 1).data('daterangepicker'), endDate = range2Data.startDate.clone().add(Math.floor(moment.duration(end.diff(start)).asHours()), 'hours');
					if (endDate.isAfter(moment()))
						invalidDateBit = true;
					range2Data.setEndDate(endDate);
					calendar_pickers.eq(index + 1).children('span').html(range2Data.startDate.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm') + " to " + range2Data.endDate.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm'));
				}
				calendar_pickers.eq(index + 1).click();
			}
			else if (counter > 1) {
				end = start.clone().add(hours, 'hours');
				self.data('daterangepicker').setEndDate(end);
				if (end.isAfter(moment()))
					invalidDateBit = true;
			}
			counter = Math.min(++counter, 2);
			self.children('span').html(start.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm') + " to " + end.utcOffset(serverTimeZone).format('D MMMM YYYY, HH:mm'));
			self.attr('start', start);
			self.attr('end', end);
			startTimes[index] = Number($(calendar_pickers[index]).attr('start'));
			endTimes[index] = Number($(calendar_pickers[index]).attr('end'));
			hours = Math.floor(moment.duration(end.diff(start)).asHours());
			var newValue, requireValueChange = false;
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
		date_cb(startDate.clone().subtract(7 * (1 - index), 'days'), endDate.clone().subtract(7 * (1 - index), 'days'));
		$(this).daterangepicker({
			"locale": {
				"format": "D MMMM YYYY, HH:mm"
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
			minDate: '1 October 2016',
			maxDate: 'now',
			timePickerIncrement: 60,
			showDropdowns: true
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
		changeScope(document.getElementById("scope").value, document.getElementById("storeId").value);
	})
	$('button[data-target="#searchPanel"]').click(function(event) {	
		$('div#searchPanel').collapse('toggle');
		$('div#resultPanel').collapse('show');
		$(this).prop('disabled', true);
		event.stopPropagation();
	});
	$.when(ajaxGettingMalls()).done(setTimeout(function() {
		if (localStorage.getItem("mall_id") === null || localStorage.getItem("mall_id") === undefined)
			changeMall("base_1");
		else
			changeMall(localStorage.getItem("mall_id"));
	}, 1000));
});