<?php

namespace App\Repositories;

use App\Lesson;

class UserRepository
{
    /**
     * Get all of the users enrolled in a given lesson.
     *
     * @param  Lesson $lesson
     * @return Collection
     */
    public function forLesson(Lesson $lesson)
    {
        return $lesson->users()
                    ->orderBy('pivot_created_at', 'asc')
                    ->get();
    }
}