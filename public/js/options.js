$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	$('#load_previous').click(function() {
		if (window.confirm("Are you sure?")) {
			$.ajax({
				url: '/load_week',
				type: 'post',
				data: {
					_token: CSRF_TOKEN,
					first_day: $('#calendar').weekCalendar("getCurrentFirstDay").getTime()/1000,
					last_day: $('#calendar').weekCalendar("getCurrentLastDay").getTime()/1000 + 172800,
				},
				success: onSuccess
			});

			function onSuccess(data, status, xhr)	{
				console.log("Returned data: ", data);
				$('#calendar').weekCalendar("refresh");
			}
		}
	});
});