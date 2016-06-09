<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
	/**
		* Run the migrations.
		*
		* @return void
		*/
	public function up() {
		Schema::create('users', function (Blueprint $table) {
			$table->increments('id');
			$table->string('name');
			$table->string('email')->unique();
			$table->string('password');
			$table->boolean('admin');
			$table->integer('day_limit')->nullable()->default(0);
			$table->boolean('current_month_payment')->nullable()->default(false);
			$table->rememberToken();
			$table->timestamps();
		});
	}

	/**
		* Reverse the migrations.
		*
		* @return void
		*/
	public function down() {
		Schema::drop('users');
	}
}
