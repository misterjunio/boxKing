<?php

namespace App\Http\Controllers;

use App\Lesson;
use App\User;
use App\Http\Requests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use Mail;

class UsersController extends Controller
{		
	/**
	 * User index.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function index(Request $request) {
		return view('users.index', ['users' => User::where([['admin', false], ['name', '!=', 'Guest']])->orderBy('name', 'asc')->paginate(10)]);	
	}
		
	/**
	 * User page.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function show(User $user) {
		return view('users.show', ['user' => $user]);
	}
		
	/**
	 * Edit user's day limit.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function edit_day_limit(Request $request) {
		return response()->json(User::where('id', intval($request->input('user')))
							->update(['day_limit' => intval($request->input('day_limit'))]));
	}
		
	/**
	 * Return users list.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function users_list(Request $request) {
		$lesson = Lesson::find(intval($request->input('lesson')));
		$ids = $lesson->users()->lists('user_id');
		return response()->json(User::where([['admin', false], ['name', '!=', 'Guest']])->whereNotIn('id', $ids)->orderBy('name', 'asc')->paginate(8));
	}
	
	/**
	 * Send a global e-mail to all users.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function sendGlobalEmail(Request $request) {
		$user = User::where([['admin', false], ['name', '!=', 'Guest']])->get();
		Mail::send('emails.password', ['user' => $user], function ($message) {
			$message->from('olimpusbox@gmail.com', 'Olimpus Box');
			$message->to($user.email);
			$message->subject('BoxKing password reset');
		});
	}
}
