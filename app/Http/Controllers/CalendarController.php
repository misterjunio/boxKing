<?php

namespace App\Http\Controllers;

use App\Lesson;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Repositories\LessonRepository;

class CalendarController extends Controller
{
	/**
     * The lesson repository instance.
     *
     * @var LessonRepository
     */
	protected $lessons;
		
	/**
		* Create a new controller instance.
		*
		* @param  LessonRepository  $lessons
		* @return void
		*/
	public function __construct(LessonRepository $lessons)
	{
			$this->middleware('auth');

			$this->lessons = $lessons;
	}
		
	/**
	 * Display the calendar.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function show(Request $request)
	{
			return view('calendar', [
					'lessons' => $this->lessons->forUser($request->user()),
			]);
	}
}
