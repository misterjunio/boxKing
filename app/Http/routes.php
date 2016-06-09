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

/* Home */
Route::get('/', function () {
    return redirect('/calendar');
});
Route::get('/home', function () {
    return redirect('/calendar');
});

/* Authentication */
Route::auth();

/* Calendar */
Route::get('/calendar', 'CalendarController@show');

/* Calendar background tasks */
Route::get('/fetch_lessons', 'CalendarController@fetch_lessons');
Route::post('/store_lesson', 'CalendarController@store_lesson');
Route::post('/edit_lesson', 'CalendarController@edit_lesson');
Route::post('/remove_lesson', 'CalendarController@remove_lesson');
Route::post('/fetch_lesson_users', 'CalendarController@fetch_lesson_users');
Route::post('/schedule_class', 'CalendarController@schedule_class');
Route::post('/cancel_class', 'CalendarController@cancel_class');
Route::post('/load_week', 'CalendarController@load_week');
Route::post('/add_guest', 'CalendarController@add_guest');

/* Users */
Route::get('/users', 'UsersController@index');
Route::get('/users_already_paid', 'UsersController@users_already_paid');
Route::get('/users_payment_missing', 'UsersController@users_payment_missing');
Route::get('/users/{user}', 'UsersController@show');
Route::get('/users/edit/{user}', 'UsersController@edit');
Route::post('/users/update/{user}', 'UsersController@update');
Route::post('/edit_day_limit', 'UsersController@edit_day_limit');
Route::post('/edit_month_payment', 'UsersController@edit_month_payment');
Route::post('/users_list', 'UsersController@users_list');
Route::get('/email_page', 'UsersController@email_page');
Route::post('/send_email', 'UsersController@send_email');