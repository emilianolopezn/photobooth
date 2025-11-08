<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Sticker>
 */
class StickerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Sticker ' . $this->faker->unique()->word(),
            'file_path' => 'stickers/' . $this->faker->uuid() . '.png',
            'is_active' => true,
        ];
    }
}
