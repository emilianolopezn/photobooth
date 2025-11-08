<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function edit()
    {
        return view('admin.settings.edit', [
            'settings' => Setting::current(),
        ]);
    }

    public function update(Request $request)
    {
        $settings = Setting::current();

        $data = $request->validate([
            'gallery_active' => ['nullable', 'boolean'],
            'approval_required' => ['nullable', 'boolean'],
            'event_title' => ['required', 'string', 'max:255'],
            'flyer_message' => ['required', 'string', 'max:500'],
            'guest_url_slug' => [
                'required',
                'alpha_dash',
                'max:60',
                Rule::notIn(['admin', 'up', 'api']),
            ],
        ]);

        $settings->update([
            'gallery_active' => $request->boolean('gallery_active'),
            'approval_required' => $request->boolean('approval_required'),
            'event_title' => $data['event_title'],
            'flyer_message' => $data['flyer_message'],
            'guest_url_slug' => $data['guest_url_slug'],
        ]);

        return back()->with('toast', 'Configuración guardada');
    }
}
