//To be replaced by getting the current date
var startTime = moment("19 October 2016 " + serverTimeZone, "D MMMM YYYY ZZ").valueOf(), endTime = moment("2 November 2016 " + serverTimeZone, "D MMMM YYYY ZZ").valueOf();
var charts = [];
var shops = [];
var MILLISECONDS_IN_A_DAY = 86400000;
var heatmapInstance = undefined;

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

function drawPeopleCountingGraph(data, ma, avg) {
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	function getPeopleCountingData() {
		var datum = [];
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: endTime + MILLISECONDS_IN_A_DAY * (i - data.length),
					y: data[i]
				});
			datum.push({
				values: values,
				key: 'Number of Visit',
				area: true
			});
			if (Array.isArray(ma)) {
				values = [];
				for (var i = 0; i < ma.length; i++)
					values.push({
						x: endTime + MILLISECONDS_IN_A_DAY * (i - ma.length),
						y: ma[i]
					});
				datum.push({
					values: values,
					key: 'Weekly Moving Average of Number of Visit',
					color: "#999999"
				});
			}
			if (!isNaN(avg * 1))
				datum.push({
					values: function() {
						var arr = [];
						for (var i = 0; i < data.length; i++)
							arr.push({
								x: endTime + MILLISECONDS_IN_A_DAY * (i - data.length),
								y: avg
							});
						return arr;
					}(),
					key: 'Average Number of Visit per day',
					color: "#000000"
				});
		}
		return datum;
	}
	nv.addGraph(function() {
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 80}).useInteractiveGuideline(true).xScale(d3.time.scale());
		peopleCountingChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format("D MMM YYYY");
		});
		peopleCountingChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.numberOfVisitChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getPeopleCountingData()).transition().duration(500).call(peopleCountingChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(peopleCountingChart.update);
		return peopleCountingChart;
	});
}

function drawAverageDwellTimeGraph(data) {
	var averageDwellTimeChart = nv.models.multiBarChart();
	charts.push(averageDwellTimeChart);
	function getAverageDwellTimeData() {
		if (Array.isArray(data)) {
			var values = [];
			for (var i = 0; i < data.length; i++)
				values.push({
					x: endTime + MILLISECONDS_IN_A_DAY * (i - data.length),
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
			return moment(d).utcOffset(serverTimeZone).format("D MMM YYYY");
		});
		averageDwellTimeChart.yAxis.axisLabel('Average Dwell Time (seconds)').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.averageDwellTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getAverageDwellTimeData()).transition().duration(500).call(averageDwellTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(averageDwellTimeChart.update);
		return averageDwellTimeChart;
	});
}

function mainProcedure() {
	var interval = 24;
	$.when(ajaxGettingStores(area)).done(function(a1) {
		var numberOfVisitors = [], numberOfVisitorsMA7 = [], averageDailyVisitors = 0;
		$.when(ajax1(), ajax2(), ajax3()).done(function(a1, a2, a3) {
			drawPeopleCountingGraph(numberOfVisitors, numberOfVisitorsMA7, averageDailyVisitors);
		});
		function ajax1() {
			return $.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: mall,
					storeId : -1,
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
					averageDailyVisitors = sum / numberOfVisitors.length;
					$(".dailyVisitors").text(averageDailyVisitors.toFixed(2));
					$("#todayVisitors").text(numberOfVisitors[numberOfVisitors.length - 1]);
					$("#yesterdayVisitors").text(numberOfVisitors[numberOfVisitors.length - 2]);
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
					storeId : -1,
					interval : interval,
					type : "count",
					lengthOfMovingAverage: 7
				},
				traditional: true,
				success : function(json) {
					var i = 0;
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + i++];
						if (i !== 1)
							numberOfVisitorsMA7.push(thisDataPoint);
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
		function ajax3() {
			return $.ajax({
				type : "post",
				url : "databaseConnection",
				data : {
					start : startTime,
					end : endTime,
					mallId: mall,
					storeId : -1,
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
					//$("#todayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 1].toFixed(2));
					//$("#yesterdayAverageDwellTime").text(averageDwellTime[averageDwellTime.length - 2].toFixed(2));
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
		}
	});
}

function ajaxGettingStores(mallName) {
	return $.ajax({
		type : "post",
		url : "prepareFloorPlanImage",
		data : { mallName: mallName },
		traditional: true,
		success : function(json) {
			$("#floorPlan").attr("src", "https://eek123.ust.hk/" + ((mall === "base_1")? "Base" : "K11_sh") + "/assets/img/" + json[0]);
			var img = document.getElementById("floorPlan");
			img.onLoad = setTimeout(function() {
				$('.floorPlan').css("width", $("#floorPlan").css("width"));
				$('.floorPlan').css("height", $("#floorPlan").css("height"));
				if (heatmapInstance !== undefined)
					heatmapInstance.setData({data: []});
				heatmapInstance = h337.create({
					// only container is required, the rest will be defaults
					container: document.querySelector('.floorPlan')
				});
				var rawPoints = [[100, 200, 300, 400], [100, 200, 300, 400]], points = [];
				var max = 0;
				var widthRatio = img.width / img.naturalWidth, heightRatio = img.height / img.naturalHeight;
				var len = rawPoints[0].length;
				while (len-- !== 0) {
					max = Math.max(max, 0.01);
					var point = {
							x: Math.floor(rawPoints[0][len] * widthRatio),
							y: Math.floor(rawPoints[1][len] * heightRatio),
							value: 100
					};
					points.push(point);
				}
				heatmapInstance.setData({
					max: max, 
					data: points 
				});
			}, 2000);
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
	var endOfYesterday = moment().startOf('day'),
	startDate = moment("1 November 2016 " + serverTimeZone, "D MMMM YYYY ZZ"),
	endDate = moment("2 November 2016 " + serverTimeZone, "D MMMM YYYY ZZ");
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
		self.daterangepicker({
			locale: {
				"format": "D MMMM YYYY, HH:mm"
			},
			ranges: {
				'Today': [endOfYesterday, moment()],
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
			showDropdowns: true,
			dateLimit: {
				days: 60
			},
			opens: 'left',
			drops: 'down'
		}, date_cb);	
	});
	$.when(ajaxGettingMalls()).done(setTimeout(function() {
		if (localStorage.getItem("mall_id") === null || localStorage.getItem("mall_id") === undefined)
			changeMall("k11_sh_1");
		else
			changeMall(localStorage.getItem("mall_id"));
	}, 1000));
	$('.colorpicker-default').colorpicker().on('changeColor', function (e) {
		$(this)[0].style.backgroundColor = e.color.toHex();
	});
});