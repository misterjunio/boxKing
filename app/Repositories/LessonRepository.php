<?php

namespace App\Repositories;

use App\User;

class LessonRepository
{
    /**
     * Get all of the lessons a given user is enrolled in.
     *
     * @param  User  $user
     * @return Collection
     */
    public function forUser(User $user)
    {
        return $user->lessons()
                    ->orderBy('created_at', 'desc')
                    ->get();
    }
}