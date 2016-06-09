<?php

namespace App\Console;

use App\Lesson;
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
			$lessons = Lesson::where('start_at', '<=', Carbon::now()->subWeeks(4))->delete();
		})->weekly()->sundays()->at('23:59');
	}
}
