@extends('layouts.app')

@section('content')
<div class="container user_page">
	<div class="row">
		<div class="col-md-8 col-md-offset-2">
			<div class="panel panel-default">
				<div class="panel-heading">All users</div>
				<div class="panel-body">
					<ul id="total_users">
						@foreach ($users as $user)
							<li>-> <a href="{{ url('/users/' . $user->id) }}">{{ $user->name }}</a> ({{ $user->email }})
								- <b>{{ $user->day_limit }}</b> day plan - current month payment: 
								@if ($user->current_month_payment)
									<b>done</b>
								@else
									<b>missing</b>
								@endif
								</li>
						@endforeach
					</ul>
					{!! $users->links() !!}
				</div>
			</div>
		</div>
		<div class="col-md-8 col-md-offset-2">
			<a href="{{ url('/email_page') }}" type="button" class="btn btn-primary">Send email to everyone</a>
		</div>
	</div>
</div>
@include('common.footer')
	
@endsection