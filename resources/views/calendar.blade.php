@extends('layouts.app')

@section('content')

	@include('common.errors')
	<div id='calendar'></div>
	<div id="event_edit_container" style="display: none">
		<form>
			<input type="hidden" />
			<ul>
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
			<ul>
				<li>
					<span>Date:</span>
					<span class="date_holder"></span>
				</li>
				<br/>
				<li>
					<h3>Participants enrolled:</h4>
					<ul id="list_participants">
					</ul>
				</li>
			</ul>
		</form>
	</div>
	@include('common.footer')
	
@endsection