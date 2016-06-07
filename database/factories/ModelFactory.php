<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(App\User::class, function (Faker\Generator $faker) {
		$ary = array(2, 3, 7);
    return [
        'name' => $faker->name,
        'email' => $faker->safeEmail,
        'password' => bcrypt('misterjunio'),
        'remember_token' => str_random(10),
				'day_limit' => $ary[array_rand($ary, 1)],
        'admin' => false,
    ];
});

$factory->define(App\Lesson::class, function (Faker\Generator $faker) {
		$start_at = $faker->dateTimeInInterval($startDate = '-1 week', $interval = '+14 days', $timezone = 'Europe/Lisbon');
		$end_at = new DateTime();
		$end_at->setTimestamp($start_at->getTimestamp() + 3600);
    return [
				'start_at' => $start_at,
        'end_at' => $end_at,
        'type' => 'WOD',
        'max_participants' => 15,
        'no_participants' => rand(0, 15),
    ];
});
