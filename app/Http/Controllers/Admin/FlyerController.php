<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\URL;
use Intervention\Image\Laravel\Facades\Image;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class FlyerController extends Controller
{
    public function show()
    {
        $settings = Setting::current();
        $guestUrl = URL::to('/' . $settings->guest_url_slug);
        $qr = QrCode::format('png')->size(320)->margin(1)->errorCorrection('M')->generate($guestUrl);

        return view('admin.flyer.show', [
            'settings' => $settings,
            'qr' => base64_encode($qr),
            'guestUrl' => $guestUrl,
        ]);
    }

    public function download()
    {
        $settings = Setting::current();
        $guestUrl = URL::to('/' . $settings->guest_url_slug);
        $qr = QrCode::format('png')->size(400)->margin(1)->errorCorrection('H')->generate($guestUrl);

        $canvas = Image::canvas(900, 1350, '#FAF6F1');

        $topBand = Image::canvas(900, 260, '#EADAC1');
        $canvas->place($topBand, 'top-left');

        $bottomBand = Image::canvas(900, 200, '#C86B5A');
        $canvas->place($bottomBand, 'bottom-left');

        $canvas->text($settings->event_title, 450, 210, function ($font) {
            $font->size(68);
            $font->color('#8C6A5D');
            $font->align('center');
        });

        $canvas->text($settings->flyer_message, 450, 420, function ($font) {
            $font->size(42);
            $font->color('#8C6A5D');
            $font->align('center');
            $font->lineHeight(1.4);
        });

        $qrImage = Image::read($qr)->resize(420, 420);
        $canvas->place($qrImage, 'center', 0, 120);

        $canvas->text($guestUrl, 450, 1000, function ($font) {
            $font->size(32);
            $font->color('#9BAE93');
            $font->align('center');
        });

        $encoded = $canvas->toPng()->toString();

        return response($encoded, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'attachment; filename="flyer-boho.png"',
        ]);
    }
}
