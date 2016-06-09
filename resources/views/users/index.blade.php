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
								- {{ $user->day_limit }} day plan</li>
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