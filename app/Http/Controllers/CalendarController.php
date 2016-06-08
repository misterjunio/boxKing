<?php

namespace App\Http\Controllers;

use App\Lesson;
use App\User;
use App\Http\Requests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Repositories\LessonRepository;
use App\Repositories\UserRepository;
use JavaScript;
use DateTime;
use Carbon\Carbon;

class CalendarController extends Controller
{
	/**
     * The lesson repository instance.
     *
     * @var LessonRepository
     */
	protected $lessons;
	
	/**
     * The user repository instance.
     *
     * @var UserRepository
     */
	protected $users;
		
	/**
		* Create a new controller instance.
		*
		* @param  LessonRepository  $lessons
		* @return void
		*/
	public function __construct(LessonRepository $lessons, UserRepository $users) {
		$this->middleware('auth');

		$this->lessons = $lessons;
		$this->users = $users;
	}
		
	/**
	 * Display the calendar.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function show(Request $request) {
		JavaScript::put([
				'user_lessons' => $this->lessons->forUser($request->user()),
				'user' => $request->user()
		]);
		return view('layouts.calendar');
	}
		
	/**
	 * Get calendar lessons.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function fetch_lessons(Request $request)	{
		return response()->json(Lesson::all());
	}
		
	/**
	 * Save new lesson.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function store_lesson(Request $request) {
		$lesson = $request->input('lesson');
		$start_at = new DateTime();
		$start_at->setTimestamp($lesson['start_at']);
		$end_at = new DateTime();
		$end_at->setTimestamp($lesson['end_at']);
		
		$lesson_r = Lesson::create(
			['start_at' => $start_at, 'end_at' => $end_at, 'type' => $lesson['type'],
			'max_participants' => intval($lesson['max_participants'])]
		);
		return response()->json($lesson_r);
	}
		
	/**
	 * Update calendar lesson.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function edit_lesson(Request $request) {
		$lesson = $request->input('lesson');
		$start_at = new DateTime();
		$start_at->setTimestamp($lesson['start_at']);
		$end_at = new DateTime();
		$end_at->setTimestamp($lesson['end_at']);
		$lesson_r = Lesson::where('id', intval($lesson['id']))
							->update(['start_at' => $start_at, 'end_at' => $end_at, 'type' => $lesson['type'],
			'max_participants' => intval($lesson['max_participants']), 'updated_at' => Carbon::now()]);
		return response()->json($lesson_r);
	}
		
	/**
	 * Delete calendar lesson.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function remove_lesson(Request $request)	{
		$lesson = $request->input('lesson');
		Lesson::destroy(intval($lesson));
		return response()->json($lesson);
	}
		
	/**
	 * Get users enrolled in lesson.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function fetch_lesson_users(Request $request) {
		return response()->json($this->users->forLesson(Lesson::find(intval($request->input('lesson')))));
	}
	
	/**
	 * Schedule lesson for user.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function schedule_class(Request $request) {
		$lesson = Lesson::find(intval($request->input('lesson')));
		$user = User::find(intval($request->input('user')));
		$user->lessons()->attach($lesson);
		$lesson->increment('no_participants');
		return response()->json($this->lessons->forUser($user));
	}
	
	/**
	 * Cancel lesson for user.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function cancel_class(Request $request) {
		$lesson = Lesson::find(intval($request->input('lesson')));
		$user = User::find(intval($request->input('user')));
		$user->lessons()->detach($lesson);
		$lesson->decrement('no_participants');
		return response()->json($this->lessons->forUser($user));
	}
	
	/**
	 * Copy previous week's schedule.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function load_week(Request $request) {
		$first_day = Carbon::createFromTimestamp(intval($request->input('first_day')));
		$last_day = Carbon::createFromTimestamp(intval($request->input('last_day')));
		$lessons = Lesson::where([
			['start_at', '>=', $first_day],
			['end_at', '<=', $last_day]])
			->delete();
		$lessons = Lesson::where([
			['start_at', '>=', $first_day->subWeek()],
			['end_at', '<=', $last_day->subWeek()]])->get();
		foreach ($lessons as $i => $lesson) {
			$start_at = new DateTime($lesson['start_at']);
			$end_at = new DateTime($lesson['end_at']);
			$lessons[$i]['start_at'] = $start_at->modify('+1 week');
			$lessons[$i]['end_at'] = $end_at->modify('+1 week');
			Lesson::create(
				['start_at' => $lessons[$i]['start_at'], 'end_at' => $lessons[$i]['end_at'], 
				'type' => $lessons[$i]['type'],	'max_participants' => $lessons[$i]['max_participants']]);
		}
		return response()->json($lessons);
	}
	
	/**
	 * Schedule lesson for guest user.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function add_guest(Request $request) {
		$lesson = Lesson::find(intval($request->input('lesson')));
		$user = User::where('email', 'guest@example.com')->first();
		$user->lessons()->attach($lesson);
		$lesson->increment('no_participants');
		return response()->json($this->lessons->forUser($user));
	}
}
