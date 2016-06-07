@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/users.js')}}"></script>
@endsection

@section('content')
	@include('common.errors')
	<div class="container user_page">
    <div class="row">
			<div class="col-md-8 col-md-offset-2">
				<div class="panel panel-default">
					<div class="panel-heading">User profile</div>
					<div class="panel-body">
						<div class="col-md-12">
						<label for="name">Name:</label>
							{{ $user->name }}
						</div>
						<div class="col-md-12 profile_entry">
						<label for="email">Email:</label>
							{{ $user->email }}
						</div>
						@if (!$user->admin)
							<div class="col-md-12 profile_entry">
								<label for="day_limit">Day limit:</label>
								<span id="current_day_limit">{{ $user->day_limit }}</span>
								<div id="day_limit" style="display: none">
									<select id="day_limit_value" style="width:40px">
										<option @if ($user->day_limit == 2) selected="selected" @endif value="{{ $user->id }}">2</option>
										<option @if ($user->day_limit == 3) selected="selected" @endif value="{{ $user->id }}">3</option>
										<option @if ($user->day_limit == 7) selected="selected" @endif value="{{ $user->id }}">7</option>
									</select>
									<button type="button" class="btn btn-default" id="submit_button">Submit</button>
									<button type="button" class="btn btn-default" id="cancel_button">Cancel</button>
								</div>
								@if (Auth::user()->admin)
									<button id="edit_day_limit" type="button" class="btn btn-default">Edit</button>
								@endif
							</div>
						@else
							<div class="col-md-12 profile_entry">
								<label for="admin">Admin</label>
							</div>
						@endif
					</div>
				</div>
			</div>
    </div>
	</div>
	@include('common.footer')
@endsection

