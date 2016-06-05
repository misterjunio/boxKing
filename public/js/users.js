$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	
	$('#edit_day_limit').click(function() {
		$('#edit_day_limit').hide();
		$('#current_day_limit').hide();
		$('#day_limit').show();
	});
	
	$('#submit_button').click(function() {
		var value = $('#day_limit_value option:selected').text();
		var user = $('#day_limit_value').val();
		$.ajax({
				url: '/edit_day_limit',
				type: 'post',
				data: {
					_token: CSRF_TOKEN,
					day_limit: value,
					user: user
				},
				success: onSuccess
		});

		function onSuccess(data, status, xhr)	{
			console.log("Returned data: ", data);
			$('#current_day_limit').text(value);
			$('#edit_day_limit').show();
			$('#current_day_limit').show();
			$('#day_limit').hide();
		}
	});
	
	$('#cancel_button').click(function() {
		$('#edit_day_limit').show();
		$('#current_day_limit').show();
		$('#day_limit').hide();
	});
});