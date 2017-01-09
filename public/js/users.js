$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	
	$('#edit_day_limit').click(function() {
		$('#edit_day_limit').hide();
		$('#current_day_limit').hide();
		$('#day_limit').css('display', 'inline');
	});
	$('#submit_day_limit').click(function() {
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
			$('#current_day_limit').text(value);
			$('#edit_day_limit').show();
			$('#current_day_limit').show();
			$('#day_limit').hide();
		}
	});
	$('#cancel_day_limit').click(function() {
		$('#edit_day_limit').show();
		$('#current_day_limit').show();
		$('#day_limit').hide();
	});
	
	$('#edit_month_payment').click(function() {
		$('#edit_month_payment').hide();
		$('#current_month_payment').hide();
		$('#month_payment').css('display', 'inline');
	});
	$('#submit_month_payment').click(function() {
		var value_aux = $('#month_payment_value option:selected').text(), value;
		if (value_aux == 'done') {
			value = 1;
		}
		else {
			value = 0;
		}
		var user = $('#month_payment_value').val();
		$.ajax({
				url: '/edit_month_payment',
				type: 'post',
				data: {
					_token: CSRF_TOKEN,
					month_payment: value,
					user: user
				},
				success: onSuccess
		});
		function onSuccess(data, status, xhr)	{
			if (data) {
				value = "done";
			}
			else {
				value = "missing";
			}
			$('#current_month_payment').text(value);
			$('#edit_month_payment').show();
			$('#current_month_payment').show();
			$('#month_payment').hide();
		}
	});
	$('#cancel_month_payment').click(function() {
		$('#edit_month_payment').show();
		$('#current_month_payment').show();
		$('#month_payment').hide();
	});
	
	$('#all_users').click(function() {
		window.location.href = "/users";
	});
	
	$('#already_paid').click(function() {
		window.location.href = "/users_already_paid";
	});
	
	$('#payment_missing').click(function() {
		window.location.href = "/users_payment_missing";
	});
	
	$('button#send_emails').click(function() {
		$("<div class='alert alert-info'>Please wait while the email is sent...</div>").prependTo($(".flash-message"));
		$(this).hide();
		$('#subject').attr('readonly', 'readonly');
		$('#content').attr('readonly', 'readonly');
	});
	
	validate_delete_user = function() {
		if (window.confirm("Are you sure you want to delete this user?")) {
			return true;
		}
		return false;
	};
});