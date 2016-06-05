@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/users.js')}}"></script>
@endsection

@section('content')
	@include('common.errors')
	<p><b>Name: </b>{{ $user->name }}</p>
	<p><b>Email: </b>{{ $user->email }}</p>
	<p><b>Day limit: </b><span id="current_day_limit">{{ $user->day_limit }}</span>
	<div id="day_limit" style="display: none">
		<select id="day_limit_value" style="width:40px">
			<option @if ($user->day_limit == 2) selected="selected" @endif value="{{ $user->id }}">2</option>
			<option @if ($user->day_limit == 3) selected="selected" @endif value="{{ $user->id }}">3</option>
			<option @if ($user->day_limit == 7) selected="selected" @endif value="{{ $user->id }}">7</option>
		</select>
		<button id="submit_button">Submit</button>
		<button id="cancel_button">Cancel</button>
	</div>
	@if (Auth ::user()->admin)<button id="edit_day_limit">Edit</button>@endif</p>
	@include('common.footer')
@endsection