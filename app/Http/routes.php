<?php

use App\Lesson;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return redirect('/calendar');
});

Route::get('/calendar', 'CalendarController@show');

Route::auth();

Route::get('/fetch_lessons', function () {	
	$data = DB::table('lessons')->get();

	return Response::json($data);
});
