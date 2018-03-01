var charts = [];
var userMac;
var storeId = undefined;

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawPeopleCountingGraph = function($) {
	'use strict';
	var peopleCountingChart = nv.models.lineChart();
	charts.push(peopleCountingChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getData(key) {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++)
			values.push({
				x: END_MILLISECOND + MILLISECONDS_PER_INTERVAL * (i - numberOfDataInGraph),
				y: valFromDB1[i]
			});
		return [{
			values: values,
			key: key,
			color: "#00b19d",
			area: true
		}];
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
})(jQuery);

(drawUserStayTimeGraph = function($) {
	'use strict';
	var userStayTimeChart = nv.models.discreteBarChart();
	charts.push(userStayTimeChart);
	const END_MILLISECOND = 1508688000000; // Till the last complete day (Hong Kong Time) in the current database, Sunday 22 Oct 2017
	const MILLISECONDS_PER_INTERVAL = 3600000 * interval;
	function getData() {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++)
			values.push({
				x: END_MILLISECOND + MILLISECONDS_PER_INTERVAL * (i - numberOfDataInGraph),
				y: valFromDB2[i]
			});
		return [{
			values: values,
			key: 'User Stay Time (seconds)',
			color: "#00b19d"
		}];
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
		userStayTimeChart.forceY([0, 1]).margin({"bottom": 120})/*.color(['#00b19d'])*/.xAxis.axisLabel('Time').rotateLabels(-45).scale(1).tickFormat(function (d) {
			return d3.time.format(timeFormat)(new Date(d));
		});
		userStayTimeChart.yAxis.axisLabel('User Stay Time (seconds)').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.userStayTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData()).transition().duration(500).call(userStayTimeChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(userStayTimeChart.update);
		return userStayTimeChart;
	});
})(jQuery);

function changeScopeWithMac(i, requestType, macAddress, stid) {
	userMac = macAddress;
	storeId = stid;
	changeScope(i, requestType);
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : currentTime - 3600000 * interval * numberOfDataInGraph,
			end : currentTime,
			storeId : storeId,
			interval : 0,
			userMac : userMac,
			type : "loyalty"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var loyalty = new Array();
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
			start : currentTime - 3600000 * interval * numberOfDataInGraph,
			end : currentTime,
			storeId : storeId,
			interval : 0,
			userMac : userMac,
			type : "user"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			var userDwellTime = new Array();
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
	updateGraph(requestType);
}

function updateLoyaltyGraph() {
	var startTime = currentTime - 3600000 * interval * numberOfDataInGraph;
	$.ajax({
		type : "get",
		url : "databaseConnection",
		data : {
			start : startTime,
			end : currentTime,
			storeId : storeId,
			interval : interval,
			userMac : userMac,
			type : "loyalty"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			valFromDB1 = new Array();
			for ( var prop in json)
				valFromDB1.push(json["dataPoint" + ++i]);
			drawPeopleCountingGraph();
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
			end : currentTime,
			storeId : storeId,
			interval : interval,
			userMac : userMac,
			type : "user"
		},
		traditional: true,
		success : function(json) {
			var i = 0;
			valFromDB2 = new Array();
			for ( var prop in json)
				valFromDB2.push(json["dataPoint" + ++i]);
			drawUserStayTimeGraph();
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
$(document).ready(function() {
	$("#date").html(new Intl.DateTimeFormat(
			"en-HK", {
				weekday : "long",
				year : "numeric",
				day : "numeric",
				month : "long"
			}).format(new Date()));
	function ajaxGettingStores(mallName) {
		return $.ajax({
			type : "get",
			url : "prepareStores",
			data : { mallName: mallName },
			traditional: true,
			success : function(json) {
				var shops = new Array();
				for ( var prop in json)
					shops.push({ id: json[prop], name: prop });
				shops.sort(function (a, b) {
					return a.name.localeCompare( b.name );
				});
				var select_html = "<option value=\"-1\" selected>All Stores</option>";
				for (var i = 0; i < shops.length; i++)
					select_html += "<option value=\"" + shops[i].id + "\">" + shops[i].name + "</option>";
				$("#storeId").html(select_html);
				storeId = -1;
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
	$.when(ajaxGettingStores("base_1")).done(function(a1) {
	});
});