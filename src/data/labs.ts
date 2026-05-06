import type { Lab } from "../types/lab";

export const labs: Lab[] = [
  {
    id: "reflection",
    title: "Pemantulan Cahaya Laser",
    subtitle: "Menganalisis hubungan sudut datang dan sudut pantul pada berkas laser.",
    objective: "Peserta didik mampu menjelaskan hukum pemantulan cahaya melalui perubahan sudut datang laser pada cermin datar.",
    icon: "↩",
    guide: [
      "Pilih menu Pemantulan Cahaya Laser.",
      "Atur panjang gelombang cahaya tampak, sudut datang, dan panjang bidang cermin.",
      "Amati berkas laser datang, garis normal, dan berkas laser pantul.",
      "Bandingkan besar sudut datang dengan sudut pantul.",
      "Gunakan mode AR jika perangkat mendukung untuk melihat cermin dan lintasan laser di ruang nyata."
    ],
    theory: [
      {
        title: "Konsep pemantulan cahaya",
        body: "Pemantulan cahaya terjadi ketika berkas cahaya mengenai permukaan pemantul, lalu kembali ke medium asal. Pada cermin datar, arah berkas pantul ditentukan oleh posisi garis normal terhadap permukaan cermin."
      },
      {
        title: "Panjang gelombang cahaya tampak",
        body: "Warna laser dalam simulasi ditentukan oleh panjang gelombang cahaya tampak. Nilai yang digunakan berada pada rentang ungu hingga merah.",
        formulas: ["380\\,\\text{nm} \\leq \\lambda \\leq 750\\,\\text{nm}"]
      },
      {
        title: "Hukum pemantulan",
        body: "Sudut datang sama dengan sudut pantul jika keduanya diukur dari garis normal.",
        formulas: ["\\theta_i = \\theta_r"]
      }
    ]
  },
  {
    id: "refraction",
    title: "Pembiasan Cahaya Laser",
    subtitle: "Menganalisis perubahan arah laser saat melewati dua medium optik.",
    objective: "Peserta didik mampu menjelaskan pembiasan cahaya berdasarkan indeks bias dan sudut datang.",
    icon: "∿",
    guide: [
      "Pilih menu Pembiasan Cahaya Laser.",
      "Atur panjang gelombang cahaya tampak, sudut datang, indeks bias medium pertama, indeks bias medium kedua, dan ketebalan medium.",
      "Amati perubahan arah laser ketika melewati batas dua medium.",
      "Perhatikan kondisi ketika laser mendekati garis normal, menjauhi garis normal, atau mengalami pemantulan internal total.",
      "Gunakan simulasi ini untuk membandingkan arah laser pada medium optik yang berbeda."
    ],
    theory: [
      {
        title: "Konsep pembiasan cahaya",
        body: "Pembiasan cahaya terjadi ketika cahaya melewati dua medium dengan indeks bias berbeda. Perubahan indeks bias menyebabkan perubahan cepat rambat cahaya dan perubahan arah rambat."
      },
      {
        title: "Panjang gelombang cahaya tampak",
        body: "Warna laser dikendalikan oleh panjang gelombang. Nilai kecil mendekati ungu dan biru, sedangkan nilai besar mendekati jingga dan merah.",
        formulas: ["380\\,\\text{nm} \\leq \\lambda \\leq 750\\,\\text{nm}"]
      },
      {
        title: "Hukum Snellius",
        body: "Hubungan antara sudut datang, sudut bias, dan indeks bias dua medium dinyatakan dengan hukum Snellius.",
        formulas: ["n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2", "n = \\frac{c}{v}"]
      },
      {
        title: "Hubungan panjang gelombang dan frekuensi",
        body: "Untuk cahaya, hubungan antara cepat rambat, frekuensi, dan panjang gelombang dapat dinyatakan melalui persamaan gelombang.",
        formulas: ["v = f\\lambda"]
      }
    ]
  },
  {
    id: "interference",
    title: "Interferensi Cahaya Laser Dua Celah",
    subtitle: "Menganalisis pola terang dan gelap pada layar akibat dua celah.",
    objective: "Peserta didik mampu menjelaskan pola interferensi cahaya laser pada percobaan dua celah berdasarkan panjang gelombang, jarak celah, lebar celah, dan jarak layar.",
    icon: "≈",
    guide: [
      "Pilih menu Interferensi Cahaya Laser Dua Celah.",
      "Atur panjang gelombang cahaya tampak. Warna laser akan berubah otomatis sesuai nilai panjang gelombang.",
      "Ubah jarak dua celah dalam satuan milimeter dan lebar celah dalam mikrometer.",
      "Geser posisi slit dan layar dalam satuan sentimeter.",
      "Ubah jarak layar dalam satuan meter, lalu amati perubahan jarak pola terang dan gelap."
    ],
    theory: [
      {
        title: "Konsep interferensi cahaya",
        body: "Interferensi cahaya terjadi ketika dua berkas cahaya koheren bertemu dan membentuk pola terang serta gelap. Pada percobaan dua celah, satu laser diarahkan ke dua celah sempit, lalu pola interferensi diamati pada layar."
      },
      {
        title: "Spektrum cahaya tampak",
        body: "Simulasi menghubungkan warna laser dengan panjang gelombang cahaya tampak. Perubahan panjang gelombang juga memengaruhi jarak pola terang pada layar.",
        formulas: ["380\\,\\text{nm} \\leq \\lambda \\leq 750\\,\\text{nm}"]
      },
      {
        title: "Syarat terang dan gelap",
        body: "Pola terang terjadi ketika beda lintasan dua berkas sama dengan kelipatan bulat panjang gelombang. Pola gelap terjadi ketika beda lintasan bernilai setengah kelipatan panjang gelombang.",
        formulas: ["d\\sin\\theta = m\\lambda", "d\\sin\\theta = \\left(m + \\frac{1}{2}\\right)\\lambda"]
      },
      {
        title: "Jarak terang berurutan pada layar",
        body: "Untuk sudut kecil, jarak antara dua pita terang berurutan dapat dihitung dari panjang gelombang, jarak layar, dan jarak antarcelah.",
        formulas: ["\\Delta y = \\frac{\\lambda L}{d}"]
      }
    ]
  },
  {
    id: "diffraction",
    title: "Difraksi Cahaya Laser Satu Celah",
    subtitle: "Menganalisis penyebaran laser setelah melewati satu celah sempit.",
    objective: "Peserta didik mampu menjelaskan pengaruh lebar celah dan panjang gelombang terhadap pola difraksi pada layar.",
    icon: "⌁",
    guide: [
      "Pilih menu Difraksi Cahaya Laser Satu Celah.",
      "Atur panjang gelombang cahaya tampak. Warna laser akan berubah otomatis sesuai nilai panjang gelombang.",
      "Ubah lebar celah dalam satuan mikrometer untuk melihat pola difraksi yang lebih sempit atau lebih menyebar.",
      "Geser posisi slit dan posisi layar dalam satuan sentimeter.",
      "Amati perubahan pola terang pusat dan posisi minimum pertama pada layar."
    ],
    theory: [
      {
        title: "Konsep difraksi cahaya",
        body: "Difraksi cahaya terjadi ketika berkas laser melewati satu celah sempit. Setelah melewati celah, cahaya menyebar dan membentuk pola terang pusat serta pola gelap di layar."
      },
      {
        title: "Spektrum cahaya tampak",
        body: "Warna laser tidak dipilih secara bebas, tetapi dihitung dari panjang gelombang cahaya tampak. Nilai panjang gelombang yang berbeda menghasilkan warna dan pola difraksi yang berbeda.",
        formulas: ["380\\,\\text{nm} \\leq \\lambda \\leq 750\\,\\text{nm}"]
      },
      {
        title: "Kondisi difraksi kuat",
        body: "Difraksi semakin jelas ketika lebar celah sebanding dengan panjang gelombang cahaya.",
        formulas: ["a \\approx \\lambda"]
      },
      {
        title: "Pola minimum difraksi satu celah",
        body: "Posisi minimum pada pola difraksi satu celah dapat dinyatakan dengan persamaan berikut.",
        formulas: ["a\\sin\\theta = m\\lambda", "y_m \\approx \\frac{m\\lambda L}{a}"]
      }
    ]
  }
];
