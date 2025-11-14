<?php

namespace Database\Factories;

use App\Models\Photo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Photo>
 */
class PhotoFactory extends Factory
{
    public function definition(): array
    {
        $status = $this->faker->randomElement([
            Photo::STATUS_PENDING,
            Photo::STATUS_APPROVED,
            Photo::STATUS_REJECTED,
        ]);

        return [
            'user_id' => User::factory(),
            'image_path' => 'photos/' . now()->format('Y/m') . '/' . $this->faker->uuid() . '.png',
            'thumb_path' => 'photos/' . now()->format('Y/m') . '/thumb_' . $this->faker->uuid() . '.png',
            'video_path' => null,
            'media_type' => Photo::TYPE_PHOTO,
            'status' => $status,
            'applied_filters' => ['filter' => 'sepia', 'intensity' => 0.7],
            'overlays' => ['objects' => []],
            'approved_at' => $status === Photo::STATUS_APPROVED ? now() : null,
            'approved_by' => $status === Photo::STATUS_APPROVED ? User::factory() : null,
        ];
    }
}
