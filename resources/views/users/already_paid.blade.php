@extends('layouts.app')

@section('pagescript')
	<script type='text/javascript' src="{{asset('js/users.js')}}"></script>
@endsection

@section('content')
<div class="container user_page">
	<div class="row">
		<div id="user_index_options" class="col-md-8 col-md-offset-2">
			<button id="all_users" type="button" class="btn btn-info">All users</a>
			<button id="already_paid" type="button" class="btn btn-info line_item active">Already paid</a>
			<button id="payment_missing" type="button" class="btn btn-info line_item">Payment missing</a>
		</div>
		<div class="col-md-8 col-md-offset-2" style="margin-top:1%">
			<div class="panel panel-default">
				<div class="panel-heading">Already paid</div>
				<div class="panel-body">
					<ul id="total_users">
						@foreach ($users as $user)
							<li>-> <a href="{{ url('/users/' . $user->id) }}">{{ $user->name }}</a> ({{ $user->email }})
								- <b>{{ $user->day_limit }}</b> day plan</li>
						@endforeach
					</ul>
					{!! $users->links() !!}
				</div>
			</div>
		</div>
	</div>
</div>
@include('common.footer')
	
@endsection