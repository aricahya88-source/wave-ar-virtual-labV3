export type GestureName =
  | "open_palm"
  | "fist"
  | "pinch"
  | "swipe_left"
  | "swipe_right"
  | "swipe_up"
  | "swipe_down"
  | "two_hands_apart"
  | "two_hands_close"
  | "zoom_in"
  | "zoom_out";

export type GestureAction = {
  gesture: GestureName;
  description: string;
  targetParameter?: string;
};

export const plannedGestureActions: GestureAction[] = [
  {
    gesture: "open_palm",
    description: "Menampilkan atau menyembunyikan panel variabel AR"
  },
  {
    gesture: "fist",
    description: "Membaca kepalan tangan sebagai perintah pause"
  },
  {
    gesture: "pinch",
    description: "Membaca gerakan pinch sebagai perintah pilih atau kunci variabel aktif"
  },
  {
    gesture: "swipe_left",
    description: "Pindah ke variabel sebelumnya"
  },
  {
    gesture: "swipe_right",
    description: "Pindah ke variabel berikutnya"
  },
  {
    gesture: "swipe_up",
    description: "Menambah nilai variabel aktif"
  },
  {
    gesture: "swipe_down",
    description: "Mengurangi nilai variabel aktif"
  },
  {
    gesture: "two_hands_apart",
    description: "Zoom in visualisasi AR"
  },
  {
    gesture: "two_hands_close",
    description: "Zoom out visualisasi AR"
  },
  {
    gesture: "zoom_in",
    description: "Alias gesture untuk memperbesar objek simulasi AR"
  },
  {
    gesture: "zoom_out",
    description: "Alias gesture untuk memperkecil objek simulasi AR"
  }
];
