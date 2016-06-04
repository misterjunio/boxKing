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

Route::post('/fetch_lesson', function () {	
	$lesson = Request::input('lesson');
	DB::table('lessons')
            ->where('id', intval($lesson))
            ->get();
	return Response::json(['data' => $lesson]);
});

Route::post('/store_lesson', function () {
	$lesson = Request::input('lesson');
	$start_at = new DateTime();
	$start_at->setTimestamp($lesson['start_at']);
	$end_at = new DateTime();
	$end_at->setTimestamp($lesson['end_at']);
	DB::table('lessons')->insert(
		['start_at' => $start_at, 'end_at' => $end_at, 'type' => $lesson['type'],
		 'max_participants' => intval($lesson['max_participants']),
		 'created_at' => \Carbon\Carbon::now(), 'updated_at' => \Carbon\Carbon::now()]
	);
	return Response::json(['data' => $lesson]);
});

Route::post('/edit_lesson', function () {
	$lesson = Request::input('lesson');
	$start_at = new DateTime();
	$start_at->setTimestamp($lesson['start_at']);
	$end_at = new DateTime();
	$end_at->setTimestamp($lesson['end_at']);
	DB::table('lessons')
            ->where('id', intval($lesson['id']))
            ->update(['start_at' => $start_at, 'end_at' => $end_at, 'type' => $lesson['type'],
		 'max_participants' => intval($lesson['max_participants']), 'updated_at' => \Carbon\Carbon::now()]);
	return Response::json(['data' => $lesson]);
});

Route::post('/remove_lesson', function () {
	$lesson = Request::input('lesson');
	DB::table('lessons')->where('id', intval($lesson['id']))->delete();
	return Response::json(['data' => $lesson]);
});