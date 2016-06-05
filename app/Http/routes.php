<?php

use App\Lesson;
use App\User;

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
Route::get('/fetch_lessons', 'CalendarController@fetch_lessons');
Route::post('/store_lesson', 'CalendarController@store_lesson');
Route::post('/edit_lesson', 'CalendarController@edit_lesson');
Route::post('/remove_lesson', 'CalendarController@remove_lesson');
Route::post('/fetch_lesson_users', 'CalendarController@fetch_lesson_users');
Route::post('/schedule_class', 'CalendarController@schedule_class');
Route::post('/cancel_class', 'CalendarController@cancel_class');

Route::auth();