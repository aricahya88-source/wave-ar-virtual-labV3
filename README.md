# Virtual Lab AR Gejala Gelombang Cahaya

Proyek awal untuk website interaktif virtual lab berbasis **Vite, React, TypeScript, Babylon.js, WebXR, dan KaTeX**.

## Fitur utama

- 4 simulasi virtual lab berbasis laser:
  - Pemantulan cahaya laser
  - Pembiasan cahaya laser
  - Interferensi cahaya laser dua celah
  - Difraksi cahaya laser satu celah
- Tiap lab memiliki:
  - Panduan praktikum
  - Landasan teori dengan persamaan LaTeX
  - Simulasi Babylon.js
- Warna laser dihitung dari panjang gelombang cahaya tampak 380 sampai 750 nm.
- Parameter ukuran dibuat lebih realistis:
  - Panjang gelombang: nm
  - Lebar celah: µm
  - Jarak dua celah: mm
  - Pergeseran slit dan layar: cm
  - Jarak layar: m
  - Indeks bias medium
  - Panjang bidang cermin dan ketebalan medium: cm
- Panel **Hasil teori** menampilkan hasil hitung otomatis:
  - Hukum pemantulan: theta datang = theta pantul
  - Hukum Snellius: sudut bias atau pemantulan internal total
  - Interferensi dua celah: jarak terang berurutan
  - Difraksi satu celah: posisi minimum pertama
- Interferensi memakai laser, dua celah, dan layar dengan pola terang-gelap berdasarkan persamaan optika.
- Difraksi memakai laser, satu celah, dan layar dengan pola terang pusat berdasarkan fungsi sinc kuadrat.
- Render sudah dibuat stabil. Objek tidak lagi dibuat ulang terus-menerus di dalam render loop, sehingga mengurangi efek kedap-kedip.
- Tombol mode AR WebXR, jika perangkat dan browser mendukung.
- Placeholder gesture engine untuk pengembangan berikutnya dengan MediaPipe.
- Folder services disiapkan untuk integrasi database pada tahap berikutnya.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

## Catatan skala visual

Ukuran fisik celah optik sangat kecil. Karena itu, celah divisualkan lebih besar agar terlihat di layar. Namun, perhitungan pola interferensi dan difraksi tetap memakai ukuran nyata dalam nm, µm, mm, cm, dan meter.

## Catatan jika masih kedap-kedip

Jika pola masih tampak berkedip pada perangkat tertentu:

1. Matikan mode hemat daya browser atau laptop.
2. Gunakan Chrome atau Edge terbaru.
3. Turunkan jumlah tab aktif.
4. Jalankan aplikasi melalui `npm run dev`, bukan langsung membuka file HTML.
5. Pada HP, gunakan mode 3D biasa terlebih dahulu sebelum mencoba AR.

## Rencana pengembangan berikutnya

- Gesture interaktif dengan MediaPipe Hand Landmarker.
- Marker-based AR jika dibutuhkan untuk pembelajaran berbasis kartu atau modul cetak.
- Integrasi database untuk laporan praktikum, jika fitur laporan akan diaktifkan kembali.
- Login siswa dan guru.
- Riwayat praktikum.
- Export laporan ke PDF.

## Mode tema

Aplikasi sudah mendukung mode gelap dan mode terang.

Palet warna yang digunakan:

- Hijau: `#5B7E3C`
- Kuning: `#FFD65A`
- Jingga: `#FF9D23`
- Merah: `#EA5252`

Pilihan tema disimpan di `localStorage` dengan key `wave-ar-virtual-lab-theme`, sehingga mode terakhir tetap aktif saat aplikasi dibuka kembali.
