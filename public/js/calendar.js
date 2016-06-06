$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	var $calendar = $('#calendar');
	var lessons = [];

	$calendar.weekCalendar({
		readonly: !user.admin,
		use24Hour: true,
		timeslotHeight: 18,
		timeSeparator: ' - ',
		timeslotsPerHour : 2,
		allowCalEventOverlap : true,
		overlapEventsSeparate: true,
		firstDayOfWeek : 1,
		businessHours :{start: 7, end: 22, limitDisplay: true},
		daysToShow : 6,
		switchDisplay: {'1 day': 1, '3 next days': 3, 'full week': 7},
		title: function(daysToShow) {
			return daysToShow == 1 ? '%date%' : '%start% - %end%';
		},
		height : function($calendar) {
			return $(window).height() - $("h1").outerHeight() - 1;
		},
		eventRender : function(calEvent, $event) {
			calEvent.title = calEvent.title + " (" + calEvent.no_participants + "/" + calEvent.max_participants + ")";
			var i = 0;
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
		draggable : function(calEvent, $event) {
			return false;
		},
		resizable : function(calEvent, $event) {
			return false;
		},
		eventNew : function(calEvent, $event) {
			var $dialogContent = $("#event_edit_container");
			resetForm($dialogContent);
			var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
			var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
			var titleField = $dialogContent.find("input[name='title']");
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

							$calendar.weekCalendar("removeUnsavedEvents");
							$calendar.weekCalendar("updateEvent", calEvent);
							$dialogContent.dialog("close");
							lesson['start_at'] = calEvent['start'].getTime()/1000;
							lesson['end_at'] = calEvent['end'].getTime()/1000;
							lesson['type'] = calEvent['title'];
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
								console.log("Returned data: ", data);
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
		},
		eventClick : function(calEvent, $event) {
			if (calEvent.readOnly) {
				return;
			}
			
			var $dialogContent;
			seeClass($dialogContent, calEvent);
		},
		data : function(start, end, callback) {
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
								"start": nearestHalfHour(dateStringToDate(data[i]['start_at'])),
								"end": nearestHalfHour(dateStringToDate(data[i]['end_at'])),
								"title": data[i]['type'],
								"max_participants": data[i]['max_participants'],
								"no_participants": data[i]['no_participants'],
						};
				}
				callback(lessons);
			}
			
			function nearestHalfHour(date) {
				var hour = date.getHours();
				var minutes = date.getMinutes();
				if (minutes < 15) {
						minutes = 0;
				} else if (minutes < 45) {
						minutes = 30;
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
		resetForm($dialogContent);
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
			console.log("Returned data: ", data);
			var user_list = document.getElementById('list_participants');
			user_list.innerHTML = '';
			var buttons = {};
			for (var i = 0; i < data.length; i++) {
				var entry = document.createElement('li');
				if (i >= calEvent.max_participants) {
					var italicNode = document.createElement("i");
					italicNode.appendChild(document.createTextNode("(R) "));
					entry.appendChild(italicNode);
				}
				if (data[i].id == user.id) {
					var boldNode = document.createElement("b");
					boldNode.appendChild(document.createTextNode(data[i].name));
					entry.appendChild(boldNode);
					if (calEvent.start.getTime() - 3600000 > current_time) {
						buttons = {
							'cancel class': function() {
								window.confirm("Are you sure you want to cancel this class? You may lose your spot");
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
							},
							cancel: function() {
								$dialogContent.dialog("close");
							}
						};
					}
				}
				else {
					entry.appendChild(document.createTextNode(data[i].name));
				}
				var a = document.createElement("a");
   			a.setAttribute('href', '#');
				a.appendChild(document.createTextNode("Remove"));
				a.style.cssText = "margin-left: 10px";
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
					console.log("Returned data: ", data);
					$dialogContent.dialog("close");
					seeClass($dialogContent, calEvent);
				}
				entry.appendChild(a);
				user_list.appendChild(entry);
			}
			if (calEvent.start.getTime() - 3600000 > current_time) {
				if ($.isEmptyObject(buttons) && !user.admin) {
					if (distinct_days.length < user.day_limit || $.inArray(calEvent.start.getDay(), distinct_days) != -1) {
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
						$("#day_limit_msg").show();
						buttons = {
							cancel: function() {
								$dialogContent.dialog("close");
							}
						};
					}
				}
				else if (user.admin) {
					buttons = {
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
			else {
				buttons = {
					cancel: function() {
						$dialogContent.dialog("close");
					}
				};
			}
			function onScheduleSuccess (data, status, xhr) {
				console.log("Returned data: ", data);
				user_lessons = data;
				$calendar.weekCalendar("refresh");
			}
			$dialogContent.dialog({
				modal: true,
				title: calEvent.title,
				close: function() {
					$dialogContent.dialog("destroy");
					$dialogContent.hide();
					$('#calendar').weekCalendar("removeUnsavedEvents");
				},
				buttons: buttons
			}).show();
		}
		
		$dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
		$(window).resize().resize(); //fixes a bug in modal overlay size ??
	}
	
	function editClass($dialogContent, calEvent) {
				$dialogContent = $("#event_edit_container");
				resetForm($dialogContent);
				var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
				var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
				var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
				var maxPeopleField = $dialogContent.find("input[name='max_p']");
				var lesson = {};
				var clicked_lesson = $.grep(lessons, function(l) {
					return l.id === calEvent.id;
				});
				document.getElementById('max_p').value = clicked_lesson[0].max_participants;

				$dialogContent.dialog({
					modal: true,
					title: "Edit - " + calEvent.title,
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

							$calendar.weekCalendar("updateEvent", calEvent);
							$dialogContent.dialog("close");
							lesson['id'] = calEvent['id'];
							lesson['start_at'] = calEvent['start'].getTime()/1000;
							lesson['end_at'] = calEvent['end'].getTime()/1000;
							lesson['type'] = calEvent['title'];
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
								console.log("Returned data: ", data);
							}
						},
						delete : function() {
							window.confirm("Are you sure you want to delete this class?");
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
	
							function onSuccess(data, status, xhr)	{
								console.log("Returned data: ", data);
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

	function resetForm($dialogContent) {
		$dialogContent.find("input").val("");
		$dialogContent.find("textarea").val("");
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
				//automatically select an end date 2 slots away.
				$endTimeField.find("option:eq(1)").attr("selected", "selected");
		}
	});
});
