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
		return view('calendar');
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
			'max_participants' => intval($lesson['max_participants']), 'updated_at' => \Carbon\Carbon::now()]);
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
}
