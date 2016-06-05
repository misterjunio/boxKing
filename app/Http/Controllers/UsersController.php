<?php

namespace App\Http\Controllers;

use App\Lesson;
use App\User;
use App\Http\Requests;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;

class UsersController extends Controller
{		
	/**
	 * User index.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function index(Request $request) {
		return view('users.index', ['users' => User::where('admin', false)->get()]);	
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
}
