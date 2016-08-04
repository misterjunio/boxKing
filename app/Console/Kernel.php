<?php

namespace App\Console;

use App\Lesson;
use App\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Carbon\Carbon;

class Kernel extends ConsoleKernel {
	/**
		* The Artisan commands provided by your application.
		*
		* @var array
		*/
	protected $commands = [
			// Commands\Inspire::class,
	];

	/**
		* Define the application's command schedule.
		*
		* @param  \Illuminate\Console\Scheduling\Schedule  $schedule
		* @return void
		*/
	protected function schedule(Schedule $schedule) {
		$schedule->call(function () {
			Lesson::where('start_at', '<=', Carbon::now()->subWeeks(8))->delete();
		})->weekly()->sundays()->at('23:59');
		
		$schedule->call(function () {
			User::where('current_month_payment', true)->update(['current_month_payment' => false]);
		})->monthlyOn(1, '00:01');
	}
}
