<?php

namespace Database\Seeders;

use App\Models\Sticker;
use Illuminate\Database\Seeder;

class StickerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stickers = [
            ['name' => 'Flor terracota', 'file_path' => 'stickers/boho-flower.png'],
            ['name' => 'Rama sage', 'file_path' => 'stickers/sage-brush.png'],
            ['name' => 'Marco boho', 'file_path' => 'stickers/boho-frame.png'],
        ];

        foreach ($stickers as $sticker) {
            Sticker::updateOrCreate(
                ['file_path' => $sticker['file_path']],
                $sticker + ['is_active' => true],
            );
        }
    }
}
