@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/users.js')}}"></script>
@endsection

@section('content')
<div class="container user_page">
	<div class="row">
		<div style="display:inline" id="user_index_options" class="col-md-8 col-md-offset-2">
			<button id="all_users" type="button" class="btn btn-info active">All users</button>
			<button id="already_paid" type="button" class="btn btn-info line_item">Already paid</button>
			<button id="payment_missing" type="button" class="btn btn-info line_item">Payment missing</button>
			<a style="float:right" href="{{ url('/email_page') }}" type="button" class="btn btn-primary">Send email to all users</a>
		</div>
		<div class="col-md-8 col-md-offset-2" style="margin-top:1%">
			<div style="margin-bottom: 0" class="panel panel-default">
				<div class="panel-heading">All users</div>
				<div class="panel-body">
					<div class="table-responsive">
						<table class="table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Day plan</th>
									<th>Monthly payment</th>
								</tr>
							</thead>
							<tbody>
								@foreach ($users as $user)
									<tr>
										<td><a href="{{ url('/users/' . $user->id) }}">{{ $user->name }}</a></td>
										<td>{{ $user->email }}</td>
										<td>{{ $user->day_limit }}</td>
										<td>@if ($user->current_month_payment) done @else missing @endif</td>
									</tr>
								@endforeach
							</tbody>
						</table>
					</div>
				</div>
			</div>
			{!! $users->links() !!}
		</div>
	</div>
</div>
@include('common.footer')
	
@endsection