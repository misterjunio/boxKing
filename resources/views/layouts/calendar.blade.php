@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/calendar.js')}}"></script>
@endsection

@section('content')
	<div id='calendar'></div>
	<div id="event_edit_container" style="display: none">
		<form>
			<input type="hidden" />
			<ul id="class_info">
				<li>
					<span>Date:</span>
					<span class="date_holder"></span>
				</li>
				<li>
					<label for="start">Start Time:</label>
					<select name="start">
						<option value="">Select Start Time</option>
					</select>
				</li>
				<li>
					<label for="end">End Time:</label>
					<select name="end">
						<option value="">Select End Time</option>
					</select>
				</li>
				<li>
					<label for="title">Type:</label>
					<input type="text" name="title" />
				</li>
				<li>
					<label for="max_p">Max. people:</label>
					<input id="max_p" type="number" name="max_p" min="1" value="15" />
				</li>
			</ul>
		</form>
	</div>
	<div id="schedule_class_container" style="display: none">
		<form>
			<input type="hidden" />
			<p id="day_limit_msg" style="display:none; color:red">You have reached your day limit</p>
			<ul>
				<li>
					<span>Date:</span>
					<span class="date_holder"></span>
				</li>
				<li>
					<h3>Participants:</h4>
					<ul id="list_participants">
					</ul>
				</li>
			</ul>
		</form>
	</div>
	<div id="user_list" style="display: none">
		<ul id="list_users" style="margin-top: 3%">
		</ul>
	</div>
	@include('common.footer')
@endsection