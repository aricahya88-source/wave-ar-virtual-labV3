# Gesture Engine

Folder ini disiapkan untuk pengembangan gesture dengan MediaPipe Hand Landmarker atau Gesture Recognizer.

Alur yang dipakai:

```text
Camera stream
→ MediaPipe Hand Landmarker / Gesture Recognizer
→ Gesture action mapper
→ React state parameter
→ Visualisasi Babylon.js diubah ulang
```

Mapping kontrol AR yang sudah disiapkan:

| Gesture | Aksi |
|---|---|
| Open palm | Tampilkan/sembunyikan panel variabel AR |
| Swipe kanan | Pilih variabel berikutnya |
| Swipe kiri | Pilih variabel sebelumnya |
| Swipe atas | Tambah nilai variabel aktif |
| Swipe bawah | Kurangi nilai variabel aktif |
| Dua tangan menjauh | Zoom in visualisasi AR |
| Dua tangan mendekat | Zoom out visualisasi AR |
| Pinch | Pilih/kunci variabel aktif |
| Fist | Pause simulasi |

Catatan: panel AR saat ini sudah menyediakan tombol uji gesture agar mapping bisa dicoba tanpa kamera gesture. Modul kamera MediaPipe dapat disambungkan ke handler yang sama.
