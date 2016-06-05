@extends('layouts.app')

@section('content')

	@include('common.errors')
	@foreach ($users as $user)
		<p>This is user <a href="{{ url('/users/' . $user->id) }}">{{ $user->name }}</a>, {{ $user->admin }}</p>
	@endforeach
	@include('common.footer')
	
@endsection