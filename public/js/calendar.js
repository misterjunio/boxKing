$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	var $calendar = $('#calendar');
	var lessons = [];
	var button_guest = 0;

	$calendar.weekCalendar({
		readonly: !user.admin,
		use24Hour: true,
		timeslotHeight: 9,
		timeSeparator: ' - ',
		defaultEventLength: 4,
		dateFormat: 'F d',
		useShortDayNames: true,
		headerSeparator: ' - ',
		timeslotsPerHour : 4,
		allowCalEventOverlap: true,
		overlapEventsSeparate: true,
		firstDayOfWeek: 1,
		businessHours: {start: 7, end: 22, limitDisplay: true},
		daysToShow: 6,
		switchDisplay: {'1 day': 1, '3 next days': 3, 'full week': 7},
		title: function(daysToShow) {
			return daysToShow == 1 ? '%date%' : '%start% - %end%';
		},
		height: function($calendar) {
			return $(window).height() - $("h1").outerHeight() - 1;
		},
		eventRender: function(calEvent, $event) {
			calEvent.title = calEvent.title + " (" + calEvent.no_participants + "/" + calEvent.max_participants + ")";
			switch (calEvent.color) {
				case 'blue':
					$event.css("backgroundColor", "blue");
					$event.children().css("backgroundColor", "blue");
					break;
				case 'red':
					$event.css("backgroundColor", "red");
					$event.children().css("backgroundColor", "red");
					break;
				case 'green':
					$event.css("backgroundColor", "green");
					$event.children().css("backgroundColor", "green");
					break;
				case 'purple':
					$event.css("backgroundColor", "purple");
					$event.children().css("backgroundColor", "purple");
					break;
				case 'brown':
					$event.css("backgroundColor", "brown");
					$event.children().css("backgroundColor", "brown");
					break;
			}
			for (i = 0; i < user_lessons.length; i++) {
				if (calEvent.id == user_lessons[i].id) {
					$event.css("backgroundColor", "#aaa");
					$event.find(".wc-time").css({
							"backgroundColor" : "#999",
							"border" : "1px solid #888"
					});
				}
			}
		},
		eventAfterRender: function(calEvent, $event) {
			calEvent.title = calEvent.title.substr(0, calEvent.title.indexOf(' ('));
		},
		draggable: function(calEvent, $event) {
			return false;
		},
		resizable: function(calEvent, $event) {
			return false;
		},
		eventNew: function(calEvent, $event) {
			var time_now = new Date();
			if (calEvent.start > time_now.setTime(time_now.getTime() + 60*60*1000)) {
				var $dialogContent = $("#event_edit_container");
				$dialogContent.find("input").val("");
				var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
				var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
				var titleField = $dialogContent.find("input[name='title']");
				var colorField = $dialogContent.find("select[name='color']");
				var maxPeopleField = $dialogContent.find("input[name='max_p']");
				var lesson = {};

				$dialogContent.dialog({
					modal: true,
					title: "New lesson",
					close: function() {
						$dialogContent.dialog("destroy");
						$dialogContent.hide();
						$('#calendar').weekCalendar("removeUnsavedEvents");
					},
					buttons: {
						save : function() {
							calEvent.start = new Date(startField.val());
							calEvent.end = new Date(endField.val());
							calEvent.title = titleField.val();
							calEvent.color = colorField.val();

							$calendar.weekCalendar("removeUnsavedEvents");
							$calendar.weekCalendar("updateEvent", calEvent);
							$dialogContent.dialog("close");
							lesson['start_at'] = calEvent['start'].getTime()/1000;
							lesson['end_at'] = calEvent['end'].getTime()/1000;
							lesson['type'] = calEvent['title'];
							lesson['color'] = calEvent['color'];
							lesson['max_participants'] = maxPeopleField.val();
							$.ajax({
								url: '/store_lesson',
								type: 'post',
								data: {
									_token: CSRF_TOKEN,
									lesson: lesson,
								},
								success: onSuccess
							});

							function onSuccess(data, status, xhr)	{
								calEvent.id = data.id;
								$calendar.weekCalendar("refresh");
							}
						},
						cancel : function() {
							$dialogContent.dialog("close");
						}
					}
				}).show();

				$dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
				setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
			}
			else {
				$('#calendar').weekCalendar("removeUnsavedEvents");
			}
		},
		eventClick: function(calEvent, $event) {
			if (calEvent.readOnly) {
				return;
			}
			
			var $dialogContent;
			seeClass($dialogContent, calEvent);
		},
		data: function(start, end, callback) {
			$.ajax({
				url: '/fetch_lessons',
				type: 'get',
				success: onSuccess
			});
		
			function onSuccess(data, status, xhr)	{
				lessons.length = data.length;
				for (var i = 0; i < data.length; i++) {
						lessons[i] = {
								"id": data[i]['id'],
								"start": nearestQuarterHour(dateStringToDate(data[i]['start_at'])),
								"end": nearestQuarterHour(dateStringToDate(data[i]['end_at'])),
								"title": data[i]['type'],
								"max_participants": data[i]['max_participants'],
								"no_participants": data[i]['no_participants'],
								"color": data[i]['color']
						};
				}
				callback(lessons);
			}
			
			function nearestQuarterHour(date) {
				var hour = date.getHours();
				var minutes = date.getMinutes();
				if (minutes < 8) {
						minutes = 0;
				} else if (minutes < 23) {
						minutes = 15;
				} else if (minutes < 38) {
						minutes = 30;
				} else if (minutes < 53) {
						minutes = 45;
				} else {
						minutes = 0;
						++hour;
				}
				date.setSeconds(0);
				date.setMinutes(minutes);
				date.setHours(hour);
				return date;
			}
		}
	});
	
	function seeClass($dialogContent, calEvent) {
		$dialogContent = $("#schedule_class_container");
		$dialogContent.find("input").val("");
		$("#day_limit_msg").hide();
		var current_time = (new Date()).getTime();
		var user_week_lessons = [];
		
		for (var i = 0; i < user_lessons.length; i++) {
			if (dateStringToDate(user_lessons[i].start_at).getTime() > $("#calendar").weekCalendar("getCurrentFirstDay") &&
					dateStringToDate(user_lessons[i].start_at).getTime() < $("#calendar").weekCalendar("getCurrentLastDay")) {
				user_week_lessons.push(user_lessons[i]);
			}
		}
		var unique = {};
		var distinct_days = [];
		var day;
		for (var lesson in user_week_lessons) {
			day = dateStringToDate(user_week_lessons[lesson].start_at).getDay();
			if (typeof(unique[day]) == "undefined") {
				distinct_days.push(day);
			}
			unique[day] = 0;
		}
		
		$.ajax({
			url: '/fetch_lesson_users',
			type: 'post',
			data: {
				_token: CSRF_TOKEN,
				lesson: calEvent['id'],
			},
			success: onSuccess
		});

		function onSuccess(data, status, xhr)	{
			var list_participants = document.getElementById('list_participants');
			list_participants.innerHTML = '';
			var buttons = {};
			for (var i = 0; i < data.length; i++) {
				if (data[i].email == 'guest@example.com') {
					button_guest = 1;
				}
				var entry = document.createElement('li');
				var entryLink = document.createElement('a');
				entryLink.setAttribute('href', '/users/' + data[i].id);
				if (i >= calEvent.max_participants) {
					var italicNode = document.createElement("i");
					italicNode.appendChild(document.createTextNode("(R) "));
					entryLink.appendChild(italicNode);
					entry.appendChild(entryLink);
				}
				if (data[i].id == user.id) {
					var boldNode = document.createElement("b");
					boldNode.appendChild(document.createTextNode(data[i].name));
					entryLink.appendChild(boldNode);
					entry.appendChild(entryLink);
					if (calEvent.start.getTime() - 3600000 > current_time) {
						buttons = {
							'cancel class': function() {
								if (window.confirm("Are you sure you want to cancel this class? You may lose your spot")) {
									$dialogContent.dialog("close");
									$.ajax({
										url: '/cancel_class',
										type: 'post',
										data: {
											_token: CSRF_TOKEN,
											lesson: calEvent['id'],
											user: user.id
										},
										success: onScheduleSuccess
									});
								}
							},
							cancel: function() {
								$dialogContent.dialog("close");
							}
						};
					}
				}
				else {
					entryLink.appendChild(document.createTextNode(data[i].name));
					entry.appendChild(entryLink);
				}
				if (user.admin && calEvent.end.getTime() > current_time) {
					entryLink.style.cssText = "display: inline-block; max-width: 65%";
					var a = document.createElement("a");
					a.setAttribute('href', '#');
					a.appendChild(document.createTextNode("Remove"));
					a.style.cssText = "margin: 0 3%; float: right";
					var boldNode = document.createElement("b");
					boldNode.appendChild(a);
					a.onclick = (function() {
						var id = data[i].id;
						return function() {
								onClickLink(id);
						}
					})();
					function onClickLink(id) {
						$.ajax({
							url: '/cancel_class',
							type: 'post',
							data: {
								_token: CSRF_TOKEN,
								lesson: calEvent['id'],
								user: id
							},
							success: onRemoveSuccess
						});
					};
					function onRemoveSuccess (data, status, xhr) {
						$dialogContent.dialog("close");
						$calendar.weekCalendar("refresh");
						seeClass($dialogContent, calEvent);
					}
					entry.appendChild(boldNode);
				}
				list_participants.appendChild(entry);
			}
			if (calEvent.start.getTime() - 3600000 > current_time) {
				var current_date = new Date(current_time);
				var previous_day = new Date(calEvent.start.getTime()-24*60*60*1000);
				console.log("calEvent.start.getTime()", calEvent.start.getHours());
				console.log("current_date", current_date);
				console.log("previous_day", previous_day);
				if (calEvent.start.getHours() < 9 && ((current_date.getHours() < 22 && current_date.getDay() == previous_day.getDay())
				|| (current_date.getDay() < previous_day.getDay() && current_date.getMonth() == previous_day.getMonth())
				|| (current_date.getMonth() < previous_day.getMonth()))) {
					if ($.isEmptyObject(buttons) && !user.admin) {
						if (($.inArray(calEvent.start.getDay(), distinct_days) != -1) || (distinct_days.length < user.day_limit
							&& !(distinct_days.length >= 1 && !user.current_month_payment && (new Date()).getDate() > 8))) {
							buttons = {
								'schedule class': function() {
									$dialogContent.dialog("close");
									$.ajax({
										url: '/schedule_class',
										type: 'post',
										data: {
											_token: CSRF_TOKEN,
											lesson: calEvent['id'],
											user: user.id
										},
										success: onScheduleSuccess
									});
								},
								cancel: function() {
									$dialogContent.dialog("close");
								}
							};
						}
						else {
							$("#day_limit_span").empty();
							if (distinct_days.length >= 1 && !user.current_month_payment && (new Date()).getDate() > 8) {
								$("#day_limit_span").append(" of 1 day. Please proceed with this month's payment as soon as possible" +
								" to get back to your usual day plan");
							}
							else {
								$("#day_limit_span").append(" of " + user.day_limit + " days");
							}
							$("#day_limit_msg").show();
							buttons = {
								cancel: function() {
									$dialogContent.dialog("close");
								}
							};
						}
					}
				}
				else if (user.admin) {
					buttons = {
						'add user': (function() {
								var $dialogContent2 = $dialogContent;
								var calEvent2 = calEvent;
								var page = 0;
								return function() {
										populate_add_users($dialogContent2, calEvent2, page);
								}
							})(),
						'edit class': function() {
							$dialogContent.dialog("close");
							editClass($dialogContent, calEvent);
						},
						cancel: function() {
							$dialogContent.dialog("close");
						}
					};
				}
			}
			else if (calEvent.end.getTime() > current_time && user.admin) {
				buttons = {
					'add user': (function() {
							var $dialogContent2 = $dialogContent;
							var calEvent2 = calEvent;
							var page = 0;
							return function() {
									populate_add_users($dialogContent2, calEvent2, page);
							}
						})(),
					'edit class': function() {
						$dialogContent.dialog("close");
						editClass($dialogContent, calEvent);
					},
					cancel: function() {
						$dialogContent.dialog("close");
					}
				};
			}
			else {
				buttons = {
					cancel: function() {
						$dialogContent.dialog("close");
					}
				};
			}
			function onScheduleSuccess(data, status, xhr) {
				user_lessons = data;
				$calendar.weekCalendar("refresh");
			}
			$dialogContent.dialog({
				modal: true,
				title: calEvent.title + " (" + data.length + "/" + calEvent.max_participants + ")",
				close: function() {
					$dialogContent.dialog("destroy");
					$dialogContent.hide();
					$('#calendar').weekCalendar("removeUnsavedEvents");
				},
				buttons: buttons
			}).show();
		}
		
		$dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start, "M d, H:i") +
		" to " + $calendar.weekCalendar("formatDate", calEvent.end, "H:i"));
		$(window).resize().resize(); //fixes a bug in modal overlay size ??
	}
	
	function populate_add_users($dialogContent, calEvent, page) {
		var $userDialogContent = $("#user_list");
		$.ajax({
			url: '/users_list?page=' + page,
			type: 'post',
			data: {
				_token: CSRF_TOKEN,
				lesson: calEvent['id'],
			},
			success: onUsersSuccess
		});
		function onUsersSuccess(data, status, xhr)	{
			var list_users = document.getElementById('list_users');
			list_users.innerHTML = '';
			for (var i = 0; i < data.data.length; i++) {
				var entry = document.createElement('li');
				entry.appendChild(document.createTextNode(data.data[i].name));
				if (i == 0) {
					entry.style.cssText = "margin-bottom: 1%; margin-top: 5%";
				}
				else {
					entry.style.cssText = "margin-bottom: 1%";
				}
				var link = document.createElement('a');
				link.setAttribute('href', '#');
				link.appendChild(document.createTextNode("Add"));
				link.style.cssText = "float: right; margin-right: 3%";
				var boldNode = document.createElement("b");
				boldNode.appendChild(link);
				link.onclick = (function() {
					var id = data.data[i].id;
					return function() {
							onClickLink(id);
					}
				})();
				function onClickLink(id) {
					$.ajax({
						url: '/schedule_class',
						type: 'post',
						data: {
							_token: CSRF_TOKEN,
							lesson: calEvent['id'],
							user: id
						},
						success: onAddSuccess
					});
				};
				function onAddSuccess(data, status, xhr) {
					$userDialogContent.dialog("close");
					$dialogContent.dialog("close");
					$calendar.weekCalendar("refresh");
					seeClass($dialogContent, calEvent);
				}
				entry.appendChild(boldNode);
				list_users.appendChild(entry);
				list_users.appendChild(document.createElement('hr'));
			}
			var buttons_guest = {};
			if (button_guest == 0) {
				buttons_guest = {
					'add guest': function() {
						$.ajax({
							url: '/add_guest',
							type: 'post',
							data: {
								_token: CSRF_TOKEN,
								lesson: calEvent['id']
							},
							success: onAddGuestSuccess
						});
					},
					cancel: function() {
						$userDialogContent.dialog("close");
					}
				}
			}
			else {
				button_guest = 0;
				buttons_guest = {
					cancel: function() {
						$userDialogContent.dialog("close");
					}
				}
			}
			$userDialogContent.dialog({
				modal: true,
				title: "Choose user",
				close: function() {
					$userDialogContent.dialog("destroy");
					$userDialogContent.hide();
					$('#calendar').weekCalendar("removeUnsavedEvents");
				},
				buttons: buttons_guest
			}).show();
			function onAddGuestSuccess(data, status, xhr) {
				$userDialogContent.dialog("close");
				$dialogContent.dialog("close");
				$calendar.weekCalendar("refresh");
				seeClass($dialogContent, calEvent);
			}
			var pagination_list = document.createElement('div');
			pagination_list.className = 'pagination';
			pagination_list.style.cssText = "margin-top: 10%";
			var back_btn = document.createElement('li');
			var back_text = document.createTextNode('«');
			if (data.current_page == 1) {
				var back_span = document.createElement('span');
				back_span.appendChild(back_text);
				back_btn.appendChild(back_span);
				back_btn.className = 'disabled';
			}
			else {
				var back_link = document.createElement('a');
				back_link.setAttribute('href', '#');
				back_link.appendChild(back_text);
				back_link.onclick = (function() {
					var $dialogContent2 = $dialogContent;
					var calEvent2 = calEvent;
					var page = data.current_page - 1;
					return function() {
							populate_add_users($dialogContent2, calEvent2, page);
					}
				})();
				back_btn.appendChild(back_link);
			}
			pagination_list.appendChild(back_btn);
			for (var i = 0; i < data.last_page; i++) {
				var page_btn = document.createElement('li');
				var page_text = document.createTextNode('' + (i + 1));
				if (data.current_page == i + 1) {
					var pagination_span = document.createElement('span');
					pagination_span.appendChild(page_text);
					page_btn.appendChild(pagination_span);
					page_btn.className = 'active';
				}
				else {
					var page_link = document.createElement('a');
					page_link.setAttribute('href', '#');
					page_link.appendChild(page_text);
					page_link.onclick = (function() {
						var $dialogContent2 = $dialogContent;
						var calEvent2 = calEvent;
						var page = i + 1;
						return function() {
								populate_add_users($dialogContent2, calEvent2, page);
						}
					})();
					page_btn.appendChild(page_link);
				}
				pagination_list.appendChild(page_btn);
			}
			var next_btn = document.createElement('li');
			var next_text = document.createTextNode('»');
			if (data.current_page == data.last_page) {
				var next_span = document.createElement('span');
				next_span.appendChild(next_text);
				next_btn.appendChild(next_span);
				next_btn.className = 'disabled';
			}
			else {
				var next_link = document.createElement('a');
				next_link.setAttribute('href', '#');
				next_link.appendChild(next_text);
				next_link.onclick = (function() {
					var $dialogContent2 = $dialogContent;
					var calEvent2 = calEvent;
					var page = data.current_page + 1;
					return function() {
							populate_add_users($dialogContent2, calEvent2, page);
					}
				})();
				next_btn.appendChild(next_link);
			}
			pagination_list.appendChild(next_btn);
			list_users.appendChild(pagination_list);
		}
	}
	
	function editClass($dialogContent, calEvent) {
				$dialogContent = $("#event_edit_container");
				$dialogContent.find("input").val("");
				var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
				var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
				var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
				var colorField = $dialogContent.find("select[name='color']").val(calEvent.color);
				var maxPeopleField = $dialogContent.find("input[name='max_p']");
				var lesson = {};
				var clicked_lesson = $.grep(lessons, function(l) {
					return l.id === calEvent.id;
				});
				document.getElementById('max_p').value = clicked_lesson[0].max_participants;

				$dialogContent.dialog({
					modal: true,
					title: "Edit - " + calEvent.title + " (" + calEvent.no_participants + "/" + calEvent.max_participants + ")",
					close: function() {
							$dialogContent.dialog("destroy");
							$dialogContent.hide();
							$('#calendar').weekCalendar("removeUnsavedEvents");
					},
					buttons: {
						save: function() {
							calEvent.start = new Date(startField.val());
							calEvent.end = new Date(endField.val());
							calEvent.title = titleField.val();
							calEvent.color = colorField.val();

							$calendar.weekCalendar("updateEvent", calEvent);
							$dialogContent.dialog("close");
							lesson['id'] = calEvent['id'];
							lesson['start_at'] = calEvent['start'].getTime()/1000;
							lesson['end_at'] = calEvent['end'].getTime()/1000;
							lesson['type'] = calEvent['title'];
							lesson['color'] = calEvent['color'];
							lesson['max_participants'] = maxPeopleField.val();
							$.ajax({
									url: '/edit_lesson',
									type: 'post',
									data: {
										_token: CSRF_TOKEN,
										lesson: lesson,
									},
									success: onSuccess
							});
	
							function onSuccess(data, status, xhr)	{
								$calendar.weekCalendar("refresh");
							}
						},
						delete : function() {
							if (window.confirm("Are you sure you want to delete this class?")) {
								$calendar.weekCalendar("removeEvent", calEvent.id);
								$dialogContent.dialog("close");
								$.ajax({
										url: '/remove_lesson',
										type: 'post',
										data: {
											_token: CSRF_TOKEN,
											lesson: calEvent['id'],
										},
										success: onSuccess
								});
							}
	
							function onSuccess(data, status, xhr)	{
							}
						},
						cancel : function() {
							$dialogContent.dialog("close");
						},
						'see class': function() {
							$dialogContent.dialog("close");
							seeClass($dialogContent, calEvent);
						}
					}
				}).show();
				setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
	}
	
	function dateStringToDate(dateString) {
		var reggie, dateArray;
		reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
		dateArray = reggie.exec(dateString);
		return new Date(
				(+dateArray[1]),
				(+dateArray[2])-1, // Careful, month starts at 0!
				(+dateArray[3]),
				(+dateArray[4]),
				(+dateArray[5]),
				(+dateArray[6])
		);
	}

	function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) {

		$startTimeField.empty();
		$endTimeField.empty();

		for (var i = 0; i < timeslotTimes.length; i++) {
				var startTime = timeslotTimes[i].start;
				var endTime = timeslotTimes[i].end;
				var startSelected = "";
				if (startTime.getTime() === calEvent.start.getTime()) {
					startSelected = "selected=\"selected\"";
				}
				var endSelected = "";
				if (endTime.getTime() === calEvent.end.getTime()) {
					endSelected = "selected=\"selected\"";
				}
				$startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
				$endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");

				$timestampsOfOptions.start[timeslotTimes[i].startFormatted] = startTime.getTime();
				$timestampsOfOptions.end[timeslotTimes[i].endFormatted] = endTime.getTime();

		}
		$endTimeOptions = $endTimeField.find("option");
		$startTimeField.trigger("change");
	}

	var $endTimeField = $("select[name='end']");
	var $endTimeOptions = $endTimeField.find("option");
	var $timestampsOfOptions = {start:[],end:[]};

	//reduces the end time options to be only after the start time options.
	$("select[name='start']").change(function() {
		var startTime = $timestampsOfOptions.start[$(this).find(":selected").text()];
		var currentEndTime = $endTimeField.find("option:selected").val();
		$endTimeField.html(
					$endTimeOptions.filter(function() {
							return startTime < $timestampsOfOptions.end[$(this).text()];
					})
					);

		var endTimeSelected = false;
		$endTimeField.find("option").each(function() {
				if ($(this).val() === currentEndTime) {
					$(this).attr("selected", "selected");
					endTimeSelected = true;
					return false;
				}
		});

		if (!endTimeSelected) {
				//automatically select an end date 4 slots away.
				$endTimeField.find("option:eq(3)").attr("selected", "selected");
		}
	});
	
	var count = 0, easteregg_timer1, easteregg_timer2;
	$("h1.wc-title").click(function() {
		if (count == 0) {
			easteregg_timer1 = window.setTimeout(function() {
				count = 0;
			}, 2000);
		}
		count++;
		if (count == 5) {
			count = 0;
			window.clearTimeout(easteregg_timer1);
			$("#easteregg").show();
			easteregg_timer2 = window.setTimeout(function() {
				$("#easteregg").hide();
			}, 1000);
		}
	});
});
