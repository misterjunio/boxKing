<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
				$users = factory(App\User::class, 50)->create();
				for ($i = 1; $i <= 2; $i++) {
						$users->each(function($u) {
								$u->lessons()->save(factory(App\Lesson::class)->make(), ['approved' => true]);
						});
				}
    }
}
