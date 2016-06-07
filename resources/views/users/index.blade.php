@extends('layouts.app')

@section('content')
	@include('common.errors')
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
					</div>
				</div>
			</div>
    </div>
	</div>
	@include('common.footer')
	
@endsection