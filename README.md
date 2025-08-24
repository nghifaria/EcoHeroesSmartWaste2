Tentu. Berdasarkan seluruh konteks proyek yang telah Anda berikan—mulai dari filosofi, tumpukan teknologi, fitur, hingga struktur kode—berikut adalah `README.md` yang komprehensif dan siap pakai untuk repositori GitHub Anda.

-----

# EcoHeroes: Smart Waste Challenge

**EcoHeroes: Smart Waste Challenge** adalah prototipe aplikasi web progresif (PWA) yang dirancang untuk mengubah kebiasaan pengelolaan sampah di tingkat komunitas melalui edukasi, gamifikasi, dan interaksi cerdas. Aplikasi ini memberdayakan warga untuk menjadi pahlawan lingkungan (`EcoHeroes`) di komunitas mereka sendiri dengan cara yang memotivasi dan tidak membebani.

Proyek ini dibuat sebagai submisi untuk kompetisi **AI Innovation Challenge COMPFEST 17** dengan tema "Smart City and Urban Living".

## ✨ Fitur Utama

  - **♻️ Pelaporan Sampah Cerdas:** Alur pelaporan multi-langkah yang intuitif dengan input visual, estimasi jumlah, dan konfirmasi.
  - **🏆 Gamifikasi & Tantangan:** Sistem poin, papan peringkat (antar warga dan RT), lencana pencapaian, dan tantangan mingguan untuk menjaga motivasi pengguna.
  - **🤖 Asisten AI "EcoBot":** Chatbot terintegrasi untuk menjawab pertanyaan seputar pengelolaan sampah, daur ulang, dan penanganan limbah berbahaya.
  - **📊 Dasbor Personal:** Ringkasan statistik personal, progres tantangan, dan visualisasi dampak positif pengguna terhadap lingkungan.
  - **🏘️ Pusat Komunitas:** Papan buletin digital yang dikelola oleh pengurus RT untuk berbagi pengumuman, artikel edukasi, dan merayakan pencapaian komunitas.
  - **🔑 Otentikasi Modern:** Alur orientasi (onboarding) yang mulus dan halaman otentikasi terpadu untuk mendaftar/masuk.
  - **📱 Desain PWA & Mobile-First:** Dirancang sebagai Progressive Web App untuk fungsionalitas offline dan kemampuan instalasi di perangkat.

## 🛠️ Tumpukan Teknologi (Tech Stack)

Proyek ini dibangun menggunakan tumpukan teknologi modern yang berfokus pada kecepatan, skalabilitas, dan pengalaman pengembang.

  - **Build Tool**: [Vite](https://vitejs.dev/)
  - **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - **Manajemen State**: [Zustand](https://zustand-demo.pmnd.rs/)
  - **Ikon**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
  - **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Authentication, Edge Functions)
  - **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan salinan proyek ini di mesin lokal Anda untuk tujuan pengembangan dan pengujian.

### Prasyarat

  - Node.js (v18 atau lebih baru)
  - Bun (atau npm/yarn)
  - Akun Supabase

### Instalasi & Konfigurasi

1.  **Clone repositori ini:**

    ```bash
    git clone https://github.com/nghifaria/EcoHeroes-SmartWaste.git
    cd EcoHeroes-SmartWaste
    ```

2.  **Install dependensi:**

    ```bash
    bun install
    ```

    Atau jika menggunakan npm:

    ```bash
    npm install
    ```

3.  **Siapkan Database Supabase:**

      - Buat proyek baru di [Supabase](https://supabase.com/).
      - Gunakan skrip SQL yang telah disediakan untuk membuat semua tabel dan kebijakan RLS (Row Level Security) yang diperlukan.
      - Pastikan untuk mengaktifkan ekstensi `vector` di **Database \> Extensions**.

4.  **Konfigurasi Environment Variables:**

      - Buat file baru di root proyek bernama `.env.local`.
      - Salin kunci API dari *dashboard* Supabase Anda (**Settings \> API**) ke dalam file ini:

    <!-- end list -->

    ```env
    VITE_SUPABASE_URL="URL_PROYEK_SUPABASE_ANDA"
    VITE_SUPABASE_ANON_KEY="KUNCI_ANON_PUBLIK_ANDA"
    ```

5.  **Generate Tipe Supabase:**

      - Pastikan Anda telah menginstal Supabase CLI dan login.
      - Jalankan perintah berikut untuk menyinkronkan tipe TypeScript dengan skema database Anda:

    <!-- end list -->

    ```bash
    npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/integrations/supabase/types.ts
    ```

6.  **Jalankan server pengembangan:**

    ```bash
    bun dev
    ```

    Aplikasi sekarang akan berjalan di `http://localhost:5173`.

## 📂 Struktur Proyek

```
EcoHeroes-SmartWaste/
├── public/
├── src/
│   ├── assets/
│   ├── components/       # Komponen UI (Auth, Dashboard, dll.)
│   ├── hooks/            # Custom React Hooks
│   ├── integrations/     # Konfigurasi & tipe Supabase
│   ├── lib/              # Utilitas umum
│   ├── pages/            # Halaman utama & 404
│   ├── App.tsx           # Komponen root aplikasi
│   └── main.tsx          # Titik masuk aplikasi
├── .env.local            # File environment (tidak dilacak Git)
├── package.json
└── vite.config.ts
```

## 🗺️ Visi Jangka Panjang (Roadmap)

Prototipe ini adalah fondasi. Rencana pengembangan di masa depan meliputi:

  - **Fase 2: Peningkatan Interaksi dan Data**

      - **Unggah Foto dengan Analisis AI**: Identifikasi jenis dan estimasi berat sampah melalui gambar.
      - **Dasbor Analitik Warga**: Visualisasi tren pelaporan sampah pribadi dari waktu ke waktu.
      - **Integrasi Pihak Ketiga**: Bekerja sama dengan bank sampah lokal untuk penukaran poin.

  - **Fase 3: Ekosistem dan Dampak Skala Besar**

      - **Peta Sampah Cerdas**: Peta interaktif lokasi tempat sampah, bank sampah, dan jadwal pengangkutan.
      - **Laporan Agregat untuk Pemerintah Kota**: Menyediakan data anonim untuk membantu pembuatan kebijakan.
      - **Monetisasi**: Model *freemium* untuk pengurus RT dan sponsor untuk tantangan komunitas.

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk detailnya.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cfd01e33-ad5d-4cc7-b189-cb709a54a761

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cfd01e33-ad5d-4cc7-b189-cb709a54a761) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cfd01e33-ad5d-4cc7-b189-cb709a54a761) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
