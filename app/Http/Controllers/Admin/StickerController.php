<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sticker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StickerController extends Controller
{
    public function index()
    {
        return view('admin.stickers.index', [
            'stickers' => Sticker::orderByDesc('created_at')->get(),
        ]);
    }

    public function create()
    {
        return view('admin.stickers.create');
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $data['file_path'] = $this->storeFile($request);

        Sticker::create($data);

        return redirect()->route('admin.stickers.index')->with('toast', 'Sticker creado');
    }

    public function edit(Sticker $sticker)
    {
        return view('admin.stickers.edit', compact('sticker'));
    }

    public function update(Request $request, Sticker $sticker)
    {
        $data = $this->validatedData($request, $sticker);

        if ($request->hasFile('file')) {
            $this->deleteFile($sticker->file_path);
            $data['file_path'] = $this->storeFile($request);
        }

        $sticker->update($data);

        return redirect()->route('admin.stickers.index')->with('toast', 'Sticker actualizado');
    }

    public function destroy(Sticker $sticker)
    {
        $this->deleteFile($sticker->file_path);
        $sticker->delete();

        return redirect()->route('admin.stickers.index')->with('toast', 'Sticker eliminado');
    }

    private function validatedData(Request $request, ?Sticker $sticker = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'file' => [$sticker ? 'nullable' : 'required', 'image', 'mimes:png', 'max:2048'],
        ], [
            'file.mimes' => 'Solo se permiten PNG con transparencia.',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        unset($data['file']);

        return $data;
    }

    private function storeFile(Request $request): string
    {
        $file = $request->file('file');
        $filename = Str::ulid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('stickers', $filename, 'public');
    }

    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
