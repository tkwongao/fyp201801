$( document ).ready(function() {

	var calendar_pickers = $('div.calendar-picker');
	calendar_pickers.children('span').html('Date and Time');
	
	calendar_pickers.each(function(index) {
		
		var self = $(this);
		
		$(this).daterangepicker({
			singleDatePicker: true,
			timePicker: true,
			timePickerIncrement: 30
		}, function (start, end, label) {
			self.children('span').html(start.format('MMMM D, YYYY h:mm A'));
			
			if(index + 1 < calendar_pickers.length)
			{
				calendar_pickers.eq(index + 1).click();
			}
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
		UpdateAllCharts();
	})
	
	$('button[data-target="#searchPanel"]').click(function(event) {	
		$('div#searchPanel').collapse('toggle');
		$('div#resultPanel').collapse('show');
		$(this).prop('disabled', true);
		
		event.stopPropagation();
	});
});