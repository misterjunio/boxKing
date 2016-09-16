@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/users.js')}}"></script>
@endsection

@section('content')
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
									<button type="button" class="btn btn-default" id="submit_day_limit">Submit</button>
									<button type="button" class="btn btn-default" id="cancel_day_limit">Cancel</button>
								</div>
								@if (Auth::user()->admin)
									<button id="edit_day_limit" type="button" class="btn btn-default">Edit</button>
								@endif
							</div>
							@if (Auth::user()->id == $user->id || Auth::user()->admin)
								<div class="col-md-12 profile_entry">
									<label for="month_payment">Current month payment:</label>
									<span id="current_month_payment">
										@if ($user->current_month_payment)
											done
										@else
											missing
										@endif
									</span>
									<div id="month_payment" style="display: none">
										<select id="month_payment_value" style="max-width:90%">
											<option @if ($user->current_month_payment) selected="selected" @endif value="{{ $user->id }}">done</option>
											<option @if (!$user->current_month_payment) selected="selected" @endif value="{{ $user->id }}">missing</option>
										</select>
										<button type="button" class="btn btn-default" id="submit_month_payment">Submit</button>
										<button type="button" class="btn btn-default" id="cancel_month_payment">Cancel</button>
									</div>
								@endif
								@if (Auth::user()->admin)
									<button id="edit_month_payment" type="button" class="btn btn-default">Edit</button>
								@endif
							</div>
							@if (Auth::user()->admin)
								<form class="form-horizontal" role="form" method="POST" action="{{ url('/users/remove/' . $user->id) }}" onsubmit="return validate_delete_user()">
									{{ csrf_field() }}
									<button type="submit" class="btn btn-danger user_page">Delete user</button>
							</form>
							@endif
						@else
							<div class="col-md-12 profile_entry">
								<label for="admin">Admin</label>
							</div>
						@endif
					</div>
				</div>
			</div>
			@if (Auth::user()->id == $user->id)
			<div class="col-md-8 col-md-offset-2">
				<a href="{{ url('/users/edit/' . $user->id) }}" type="button" class="btn btn-primary">Edit profile</a>
			</div>
			@endif
    </div>
	</div>
	@include('common.footer')
@endsection

