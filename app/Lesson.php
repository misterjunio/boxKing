<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
		/**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['start_at', 'end_at', 'type', 'max_participants', 'no_participants', 'color',
		 'created_at', 'updated_at'];
		
		/**
     * The users that are enrolled in a lesson.
     */
    public function users()
    {
        return $this->belongsToMany('App\User', 'enrolled_in')->withPivot('created_at')->withTimestamps();
    }
}
