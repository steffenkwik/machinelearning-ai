import type { Sex } from "./who";

export type GiziIbu = "Baik" | "Sedang" | "Buruk";

// LabelEncoder mappings captured from the trained encoders:
//   jenis_kelamin: laki-laki=0, perempuan=1
//   gizi_ibu:      Baik=0, Buruk=1, Sedang=2
const SEX_ENC: Record<Sex, number> = { "laki-laki": 0, perempuan: 1 };
const GIZI_ENC: Record<GiziIbu, number> = { Baik: 0, Buruk: 1, Sedang: 2 };

export interface FormValues {
  namaAnak: string;
  umur: number;
  jenisKelamin: Sex;
  tinggi: number;
  berat: number;
  anakPertama: boolean;
  jarakKehamilan: number;
  usiaIbuMenikah: number;
  giziIbu: GiziIbu;
}

/** Build the 7-feature vector in the exact order the model expects. */
export function toFeatureVector(v: FormValues): number[] {
  return [
    v.umur,
    SEX_ENC[v.jenisKelamin],
    v.tinggi,
    v.berat,
    v.anakPertama ? 0 : v.jarakKehamilan,
    v.usiaIbuMenikah,
    GIZI_ENC[v.giziIbu],
  ];
}
