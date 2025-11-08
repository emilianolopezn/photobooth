<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Setting>
 */
class SettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'gallery_active' => true,
            'approval_required' => true,
            'event_title' => 'Nuestra boda',
            'flyer_message' => 'Comparte tus recuerdos con nosotros 💕',
            'guest_url_slug' => 'invitados',
        ];
    }
}
