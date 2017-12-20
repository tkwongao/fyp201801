(function($) {
    'use strict';

	$(document).ready(function()
	{		
		$('div.calendar-picker span').html('Date and Time');

		$('div.calendar-picker').daterangepicker({
			format: 'MM/DD/YYYY h:mm A',
			startDate: moment().subtract(29, 'days'),
			endDate: moment(),
			minDate: '01/01/2016',
			maxDate: '12/31/2016',
			dateLimit: {
				days: 60
			},
			showDropdowns: true,
			showWeekNumbers: true,
			timePicker: true,
			timePickerIncrement: 30,
			timePicker12Hour: true,
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			},
			opens: 'left',
			drops: 'down',
			buttonClasses: ['btn', 'btn-sm'],
			applyClass: 'btn-success',
			cancelClass: 'btn-default',
			separator: ' to ',
			locale: {
				applyLabel: 'Submit',
				cancelLabel: 'Cancel',
				fromLabel: 'From',
				toLabel: 'To',
				customRangeLabel: 'Custom',
				daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
				monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
				firstDay: 1
			}
		}, function (start, end, label) {
			console.log(start.toISOString(), end.toISOString(), label);
			$('div.calendar-picker span').html(start.format('MMMM D, YYYY h:mm A') + ' - ' + end.format('MMMM D, YYYY h:mm A'));
		});
		
		$('.colorpicker-default').colorpicker().on('changeColor', function (e) {
			  $(this)[0].style.backgroundColor = e.color.toHex();
		});
		
		
		var svgObject = $('object.floorPlan').dragZoomTool({
			isPlotTrajectory: true,
			onSelectedPath: function(path) {

			}
		});
		
		GetWorld().objectList['svgFloorPlan'] = svgObject;
		
		GetWorld().Start();
	});	

})(jQuery);