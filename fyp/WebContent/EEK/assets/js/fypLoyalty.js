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

function drawLoyaltyCountingGraph(data, ma, maInterval, avg) {
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	function getData(key) {
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
				key: key,
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
		peopleCountingChart.forceY([0, 1]).margin({"bottom": 120}).useInteractiveGuideline(true).xScale(d3.time.scale());
		peopleCountingChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
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
	function getData() {
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
				key: 'User Stay Time (seconds)'
			}];
		}
		return [];
	}
	nv.addGraph(function() {
		userStayTimeChart.forceY([0, 1]).margin({"bottom": 120}).stacked(false).showControls(false);
		userStayTimeChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		userStayTimeChart.yAxis.axisLabel('User Stay Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.userStayTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData()).transition().duration(500).call(userStayTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(userStayTimeChart.update);
		return userStayTimeChart;
	});
}

function drawNumberOfStoresGraph(data) {
	var numberOfStoresChart = nv.models.multiBarChart();
	charts.push(numberOfStoresChart);
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
		numberOfStoresChart.forceY([0, 1]).margin({"bottom": 120}).stacked(false).showControls(false);
		numberOfStoresChart.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return moment(d).utcOffset(serverTimeZone).format(getTimeFormat(interval));
		});
		numberOfStoresChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.d'));
		d3.select('.numOfStoresVisitedChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Number of Stores Visited')).transition().duration(500).call(numberOfStoresChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(numberOfStoresChart.update);
		return numberOfStoresChart;
	});
}

function changeScopeWithMac(sc, macAddress, stid, lengthOfMovingAverage) {
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
	if (!macAddress.match(/^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/g))
		alert("Please enter a valid MAC address");
	else if (lengthOfMovingAverage < 2 || lengthOfMovingAverage > 127)
		alert("Please enter a valid length of Moving Average, between 2 and 127.");
	else {
		var storeId = stid, userMac = macAddress, loyaltyCounting = [], loyaltyCountingMA = [], maInterval = lengthOfMovingAverage, averageVisitors = 0;
		$.when(ajax1(), ajax2()).done(function(a1, a2) {
			drawLoyaltyCountingGraph(loyaltyCounting, loyaltyCountingMA, maInterval, averageVisitors);
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
					userMac : userMac,
					type : "loyalty",
					lengthOfMovingAverage: 1
				},
				traditional: true,
				success : function(json) {
					var i = 0, sum = 0;
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + i++];
						if (i !== 1) {
							loyaltyCounting.push(thisDataPoint);
							sum += thisDataPoint;
						}
						else
							$("#loyalty").text(thisDataPoint);
					}
					averageVisitors = sum / loyaltyCounting.length;
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
					userMac : userMac,
					type : "loyalty",
					lengthOfMovingAverage: maInterval
				},
				traditional: true,
				success : function(json) {
					var i = 0;
					for ( var prop in json) {
						var thisDataPoint = json["dataPoint" + i++];
						if (i !== 1)
							loyaltyCountingMA.push(thisDataPoint);
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
			type: "post",
			url: "oui",
			data: { userMac: userMac },
			traditional: true,
			success: function(json) {
				var text = "";
				var i = 0;
				for ( var prop in json) {
					if (i++ !== 0)
						text += " OR ";
					text += prop;
				}
				$("#oui").addClass("input-group-addon");
				$("#oui").text(text);
			},
			statusCode: {
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
				userMac : userMac,
				type : "numOfStore",
				lengthOfMovingAverage: 1
			},
			traditional: true,
			success : function(json) {
				var i = 0;
				var numOfStores = [];
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + i++];
					if (i !== 1)
						numOfStores.push(thisDataPoint);
					else
						$("#numberOfStoresVisited").text((thisDataPoint === 0.5) ? "Not Applicable" : thisDataPoint);
				}
				for (i = 0; i < numOfStores.length; i++)
					if (numOfStores[i] === 0.5) {
						numOfStores = [];
						break;
					}
				drawNumberOfStoresGraph(numOfStores);
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
				userMac : userMac,
				type : "user",
				lengthOfMovingAverage: 1
			},
			traditional: true,
			success : function(json) {
				var i = 0;
				var userStayTime = [];
				for ( var prop in json) {
					var thisDataPoint = json["dataPoint" + i++];
					if (i !== 1)
						userStayTime.push(thisDataPoint);
					else
						$("#userDwellTime").text(thisDataPoint);
				}
				drawUserStayTimeGraph(userStayTime);
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
			var select_html = "<option value=\"-1\" selected>All Stores</option>";
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
	drawLoyaltyCountingGraph([]);
	drawUserStayTimeGraph([]);
	drawNumberOfStoresGraph([]);
	if (localStorage.getItem("area_id") === null || localStorage.getItem("area_id") === undefined)
		changeArea("base_1");
	else
		changeArea(localStorage.getItem("area_id"));
	const endOfYesterday = moment().startOf('day'), startDate = endOfYesterday.clone().subtract(1, 'days'), endDate = endOfYesterday;
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
	ajaxGettingStores(area);
});