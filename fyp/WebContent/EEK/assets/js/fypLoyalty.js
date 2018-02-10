var charts = [];

function UpdateAllCharts() {
	for (var i in charts)
		if (charts[i].update)
			charts[i].update();
}

(drawGraph = function($) {
	'use strict';

	var lineChart = nv.models.lineChart();
	charts.push(lineChart);
	var barChart = nv.models.discreteBarChart();
	charts.push(barChart);
	barChart.color(['#00b19d', '#ef5350', '#3ddcf7', '#ffaa00','#81c868', '#dcdcdc', '#555555', '#fb6d9d', '#98a6ad', '#3bafda']);
	
	lineChart.forceY([0, 1]);
	barChart.forceY([0, 1]);
	
	function getData(key) {
		var values = [];
		for (var i = 0; i < numberOfDataInGraph; i++)
			values.push({
				x: i,
				y: valFromDB[i]
			});
		return [{
			values: values,
			key: key,
			color: "#00b19d",
			area: true
		}];
	}

	nv.addGraph(function() {
		var height = 300;
		lineChart.useInteractiveGuideline(true);
		lineChart.xAxis.axisLabel('Time').scale(1).tickFormat(function(d){return d;});
		lineChart.yAxis.axisLabel('Number of Visit').scale(100).tickFormat(d3.format('.2f'));
		d3.select('.userLoyaltyCheckChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('Number of Visit')).transition().duration(500).call(lineChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(lineChart.update);
		return lineChart;
	});

	nv.addGraph(function() {
		var height = 300;
		barChart.xAxis.axisLabel('Time').scale(1).tickFormat(function(d){return d;});
		barChart.yAxis.axisLabel('User Stay Time in Mall').scale(1).tickFormat(d3.format('.2f'));
		d3.select('.userStayTimeChart svg').attr('perserveAspectRatio', 'xMinYMid').datum(getData('User Stay Time in Mall')).transition().duration(500).call(barChart);
		d3.select('.nv-legendWrap').attr('transform', 'translate(25, -30)');
		nv.utils.windowResize(barChart.update);
		return barChart;
	});
	return;
})(jQuery);