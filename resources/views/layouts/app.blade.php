<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="csrf-token" content="<?php echo csrf_token() ?>" />
    <title>BoxKing</title>
		<link rel='stylesheet' type='text/css' href="{{asset('css/reset.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('libs/css/smoothness/jquery-ui-1.8.11.custom.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/jquery.weekcalendar.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/boxKing.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/default.css')}}" />
		<script type='text/javascript' src="{{asset('libs/jquery-1.4.4.min.js')}}"></script>
		<script type='text/javascript' src="{{asset('libs/jquery-ui-1.8.11.custom.min.js')}}"></script>
		<script type='text/javascript' src="{{asset('js/date.js')}}"></script>
		<script type='text/javascript' src="{{asset('js/jquery.weekcalendar.js')}}"></script>
		@yield('pagescript')
	</head>
	<body id="app-layout">
		<h1><a href="{{ url('/') }}">OlimpusBox</a> @ BoxKing</h1>
		@if (Auth::guest())
			<a href="{{ url('/login') }}">Login</a>
			<a href="{{ url('/register') }}">Register</a>
		@else
			<a href="{{ url('/users/' . Auth::user()->id) }}">{{ Auth::user()->name }}</a>
			@if (Auth::user()->admin)
				<a href="{{ url('/users') }}">Users</a>
			@endif
			<a href="{{ url('/logout') }}">Logout</a>
		@endif
    @yield('content')
	</body>
</html>
