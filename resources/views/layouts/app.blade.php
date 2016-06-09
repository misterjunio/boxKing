<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="csrf-token" content="<?php echo csrf_token() ?>" />
    <title>BoxKing</title>
		<link rel="icon" href="{{asset('img/icon.png')}}">
		<link rel='stylesheet' type='text/css' href="{{asset('css/reset.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('libs/css/smoothness/jquery-ui-1.8.11.custom.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/jquery.weekcalendar.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/boxKing.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('libs/bootstrap-3.3.6/css/bootstrap.min.css')}}" />
		<link rel='stylesheet' type='text/css' href="{{asset('css/default.css')}}" />
		<script src="https://code.jquery.com/jquery-1.9.1.min.js" integrity="sha256-wS9gmOZBqsqWxgIVgA8Y9WcQOa7PgSIX+rPA0VL2rbQ=" crossorigin="anonymous"></script>
		<script type='text/javascript' src="{{asset('libs/bootstrap-3.3.6/js/bootstrap.min.js')}}"></script>
		<script type='text/javascript' src="{{asset('libs/jquery-1.4.4.min.js')}}"></script>
		<script type='text/javascript' src="{{asset('libs/jquery-ui-1.8.11.custom.min.js')}}"></script>
		<script type='text/javascript' src="{{asset('js/date.js')}}"></script>
		<script type='text/javascript' src="{{asset('js/jquery.weekcalendar.js')}}"></script>
		<script type='text/javascript' src="{{asset('js/options.js')}}"></script>
		@yield('pagescript')
	</head>
	<body id="app-layout">
		<nav id="boxking-navbar" class="navbar navbar-default">
			<div class="container-fluid">
				<!-- Brand and toggle get grouped for better mobile display -->
				<div class="navbar-header">
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="navbar-brand"  href="{{ url('/') }}">OlimpusBox @ BoxKing</a>
				</div>

				<!-- Collect the nav links, forms, and other content for toggling -->
				<div class="collapse navbar-collapse" id="boxking-navbar-collapse">
					<ul class="nav navbar-nav navbar-right">
						@if (Auth::guest())
							<li><a href="{{ url('/login') }}">Login</a></li>
							<li><a href="{{ url('/register') }}">Register</a></li>
						@else
							<li><a href="{{ url('/users/' . Auth::user()->id) }}">{{ Auth::user()->name }}</a></li>
							@if (Auth::user()->admin)
								<li class="dropdown">
									<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Admin options<span class="caret"></span></a>
									<ul class="dropdown-menu">
										<li><a href="{{ url('/users') }}">Manage users</a></li>
										@if (Request::url() === url('/calendar'))<li id="load_previous"><a href="#">Copy previous week</a></li>@endif
									</ul>
								</li>
							@endif
							<li><a href="{{ url('/logout') }}">Logout</a></li>
						@endif
					</ul>
				</div><!-- /.navbar-collapse -->
			</div><!-- /.container-fluid -->
		</nav>
		<div id="easteregg">
			<img src="{{asset('img/crossgirl.jpg')}}" class="img-rounded" alt="Crossfit Girl">
			<p>I &lt;3 CROSSFIT</p>
		</div>
    @yield('content')
	</body>
</html>
