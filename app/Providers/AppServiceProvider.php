<?php

namespace App\Providers;

use Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Validator::extend('guest', function($attribute, $value, $parameters, $validator) {
            return $value != 'Guest';
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        if ($this->app->environment() == 'local') {
						$this->app->register('Laracasts\Generators\GeneratorsServiceProvider');
				}
    }
}
