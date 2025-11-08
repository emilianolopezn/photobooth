<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::query()->firstOrCreate([], [
            'gallery_active' => true,
            'approval_required' => true,
            'event_title' => 'Nuestra boda',
            'flyer_message' => 'Comparte tus recuerdos con nosotros 💕',
            'guest_url_slug' => 'invitados',
        ]);
    }
}
