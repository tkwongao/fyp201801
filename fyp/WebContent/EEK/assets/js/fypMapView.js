var startTime = 0, endTime = 0;
var heatmapInstance = undefined;

function drawHeatMap() {
	var img = document.getElementById("floorPlan");
	var widthRatio = img.width / img.naturalWidth, heightRatio = img.height / img.naturalHeight;
	if (heatmapInstance !== undefined)
		heatmapInstance.setData({data: []});
	heatmapInstance = h337.create({
		container: document.querySelector('.floorPlan'),
		maxOpacity: 0.5
	});
	var rawPoints = [[], []]
	$.ajax({
		type : "post",
		url : "heatmap",
		data : {
			start : startTime,
			end : endTime,
			mallName: area,
			widthRatio: widthRatio,
			heightRatio: heightRatio
		},
		traditional: true,
		success : function(json) {
			var max = 0, i = 0;
			var points = [];
			var macAddressesHTML = "";
			for ( var prop in json) {
				if (prop === "count") {
					$("#totalVisitorCount").text(json[prop]);
					continue;
				}
				var thisDataPoint = prop.split(" ");
				if (thisDataPoint[0] === "mac") {
					macAddressesHTML += '<div class="row">' +
					'<div class="col-md-6">' +
					'<div class="form-group">' +
					'<h3>' +
					'<div class="label label-default ellipis mac-address">' + thisDataPoint[1] + '</div>' +
					'<div class="font-13 text-muted">' + new moment(json[prop]).utcOffset(serverTimeZone).format("D MMMM YYYY, HH:mm") + '</div>' +
					'</h3>' +
					'</div>' +
					'</div>' +
					'<div class="col-md-1"></div>' +
					'<div class="col-md-2">' +
					'<div class="form-group">' +
					'<h3><button class="btn colorpicker-default input-group" style="background: #7266ba; border-radius: 5px; width:100%">&nbsp;</button></h3>' +
					'</div>' +
					'</div>' +
					'<div class="col-md-1"></div>' +
					'<div class="col-md-2">' +
					'<div class="form-group">' +
					'<h3><input type="checkbox" checked id="switchery' + i++ + 'fyp"/></h3>' +
					'</div>' +
					'</div>' +
					'</div>';
					continue;
				}
				var point = {
						x: Number(thisDataPoint[0]),
						y: Number(thisDataPoint[1]),
						value: json[prop]
				};
				max = Math.max(max, json[prop]);
				points.push(point);
			}
			heatmapInstance.setData({
				max: max,
				data: points
			});
			$("#macAddressList").html(macAddressesHTML);
			for (var id = 0; id < i; id++)
				new Switchery($("#switchery" + id + "fyp")[0], {
					color: '#7266ba'
				})
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
	var endOfYesterday = moment().startOf('day'),
	startDate = moment("29 October 2017 " + serverTimeZone, "D MMMM YYYY ZZ"),
	endDate = moment("30 October 2017 " + serverTimeZone, "D MMMM YYYY ZZ");
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
			timePickerIncrement: 15,
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