$(document).ready(function() {
	var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
	var $calendar = $('#calendar');
	var lessons = [];

	$calendar.weekCalendar({
		readonly: !user.admin,
		use24Hour: true,
		timeslotHeight: 9.5,
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
			var list_participants = document.getElementById('list_participants');
			list_participants.innerHTML = '';
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
					entry.appendChild(document.createTextNode(data[i].name));
				}
				if (user.admin && calEvent.start.getTime() - 3600000 > current_time) {
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
						$calendar.weekCalendar("refresh");
						seeClass($dialogContent, calEvent);
					}
					entry.appendChild(a);
				}
				list_participants.appendChild(entry);
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
						$("#day_limit_msg").append(" of " + user.day_limit + " days").show();
						buttons = {
							cancel: function() {
								$dialogContent.dialog("close");
							}
						};
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
							/*
						function() {
							var $userDialogContent = $("#user_list");
							$.ajax({
								url: '/users_list',
								type: 'post',
								data: {
									_token: CSRF_TOKEN,
									lesson: calEvent['id'],
								},
								success: onUsersSuccess
							});
							function onUsersSuccess(data, status, xhr)	{
								console.log("Returned data: ", data);
								var list_users = document.getElementById('list_users');
								list_users.innerHTML = '';
								for (var i = 0; i < data.data.length; i++) {
									var entry = document.createElement('li');
									entry.appendChild(document.createTextNode(data.data[i].name + " - " + data.data[i].email));
									if (i == 0) {
										entry.style.cssText = "margin-bottom: 1%; margin-top: 5%";
									}
									else {
										entry.style.cssText = "margin-bottom: 1%";
									}
									var link = document.createElement('a');
									link.setAttribute('href', '#');
									link.appendChild(document.createTextNode("Add"));
									link.style.cssText = "margin-left: 10px";
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
									function onAddSuccess (data, status, xhr) {
										console.log("Returned data: ", data);
										$userDialogContent.dialog("close");
										$dialogContent.dialog("close");
										$calendar.weekCalendar("refresh");
										seeClass($dialogContent, calEvent);
									}
									entry.appendChild(link);
									list_users.appendChild(entry);
								}
								paginate_add_users(data, calEvent);
								$userDialogContent.dialog({
									modal: true,
									title: "Choose user",
									close: function() {
										$userDialogContent.dialog("destroy");
										$userDialogContent.hide();
										$('#calendar').weekCalendar("removeUnsavedEvents");
									},
									buttons: {
										cancel: function() {
											$userDialogContent.dialog("close");
										}
									}
								}).show();
							}
						},*/
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
			function onScheduleSuccess(data, status, xhr) {
				console.log("Returned data: ", data);
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
			console.log("Returned data: ", data);
			var list_users = document.getElementById('list_users');
			list_users.innerHTML = '';
			for (var i = 0; i < data.data.length; i++) {
				var entry = document.createElement('li');
				entry.appendChild(document.createTextNode(data.data[i].name + " - " + data.data[i].email));
				if (i == 0) {
					entry.style.cssText = "margin-bottom: 1%; margin-top: 5%";
				}
				else {
					entry.style.cssText = "margin-bottom: 1%";
				}
				var link = document.createElement('a');
				link.setAttribute('href', '#');
				link.appendChild(document.createTextNode("Add"));
				link.style.cssText = "margin-left: 10px";
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
					console.log("Returned data: ", data);
					$userDialogContent.dialog("close");
					$dialogContent.dialog("close");
					$calendar.weekCalendar("refresh");
					seeClass($dialogContent, calEvent);
				}
				entry.appendChild(link);
				list_users.appendChild(entry);
			}
			$userDialogContent.dialog({
				modal: true,
				title: "Choose user",
				close: function() {
					$userDialogContent.dialog("destroy");
					$userDialogContent.hide();
					$('#calendar').weekCalendar("removeUnsavedEvents");
				},
				buttons: {
					cancel: function() {
						$userDialogContent.dialog("close");
					}
				}
			}).show();
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
		
						/*entry.appendChild(document.createTextNode(data.data[i].name + " - " + data.data[i].email));
						entry.style.cssText = "margin-bottom: 5px";
						var link = document.createElement('a');
						link.setAttribute('href', '#');
						link.appendChild(document.createTextNode("Add"));
						link.style.cssText = "margin-left: 10px";
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
						function onAddSuccess (data, status, xhr) {
							console.log("Returned data: ", data);
							$userDialogContent.dialog("close");
							$dialogContent.dialog("close");
							$calendar.weekCalendar("refresh");
							seeClass($dialogContent, calEvent);
						}
						entry.appendChild(link);
						list_users.appendChild(entry);*/
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
				//automatically select an end date 4 slots away.
				$endTimeField.find("option:eq(3)").attr("selected", "selected");
		}
	});
});
