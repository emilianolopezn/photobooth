<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

    protected $fillable = [
        'gallery_active',
        'approval_required',
        'event_title',
        'flyer_message',
        'guest_url_slug',
    ];

    protected $casts = [
        'gallery_active' => 'boolean',
        'approval_required' => 'boolean',
    ];

    public static function current(): self
    {
        return cache()->rememberForever('settings.current', function () {
            return static::query()->first() ?? static::create();
        });
    }

    protected static function booted(): void
    {
        $flush = fn () => cache()->forget('settings.current');

        static::saved($flush);
        static::deleted($flush);
    }
}
