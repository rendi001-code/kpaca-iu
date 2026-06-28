const express = require('express');
const axios = require('axios');
const app = express();

// Pengaturan
const API_KEY = "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";
const MODEL_AI = "gemini-1.5-flash";
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Halaman Utama
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kpaca AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
        <script> tailwind.config = { darkMode: 'class' } </script>
    </head>
    <body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-300">
        
        <!-- Menu Titik Tiga -->
        <header class="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 z-10">
            <div class="container mx-auto px-4 py-3 flex items-center justify-between max-w-4xl">
                <div class="relative">
                    <button id="tombolMenu" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <i class="fa fa-ellipsis-v text-lg"></i>
                    </button>
                    <div id="kotakMenu" class="hidden absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div class="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold">Pengaturan</div>
                        <button id="pilihTema" class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex gap-2 items-center">
                            <i class="fa fa-moon-o dark:hidden"></i>
                            <i class="fa fa-sun-o hidden dark:inline"></i> Ganti Latar
                        </button>
                        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
                            <h4 class="text-sm font-medium mb-2">Riwayat Obrolan</h4>
                            <div id="daftarRiwayat" class="max-h-40 overflow-y-auto text-sm space-y-1">
                                <p class="text-gray-500 italic">Belum ada pesan</p>
                            </div>
                        </div>
                    </div>
                </div>
                <h1 class="font-bold text-lg">🦙 Kpaca AI</h1>
                <div></div>
            </div>
        </header>

        <!-- Isi Obrolan -->
        <main class="flex-1 container mx-auto px-4 py-6 max-w-4xl overflow-y-auto">
            <div id="kotakPesan" class="space-y-4 pb-20">
                <div class="flex gap-2 max-w-[85%]">
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                        <i class="fa fa-robot"></i>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        Halo! Saya Kpaca AI, asisten cerdas kamu. Ada yang bisa saya bantu?
                    </div>
                </div>
            </div>
        </main>

        <!-- Kotak Masuk Pesan -->
        <footer class="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-t border-gray-200 dark:border-gray-700 p-3">
            <form id="formKirim" class="container mx-auto max-w-4xl flex gap-2 items-center">
                <input type="file" id="masukGambar" accept="image/*" class="hidden">
                <button type="button" id="btnGambar" class="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shrink-0">
                    <i class="fa fa-image"></i>
                </button>
                <button type="button" id="btnSuara" class="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shrink-0">
                    <i class="fa fa-microphone"></i>
                </button>
                <input type="text" id="masukPesan" placeholder="Ketik pesan di sini..." 
                    class="flex-1 px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="submit" class="p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white shrink-0">
                    <i class="fa fa-paper-plane"></i>
                </button>
            </form>
        </footer>

        <script>
            // Buka Tutup Menu
            const tombolMenu = document.getElementById('tombolMenu');
            const kotakMenu = document.getElementById('kotakMenu');
            tombolMenu.addEventListener('click', e => { e.stopPropagation(); kotakMenu.classList.toggle('hidden'); });
            document.addEventListener('click', () => kotakMenu.classList.add('hidden'));

            // Atur Tema Terang/Gelap
            if(localStorage.getItem('tema') === 'gelap' || (!localStorage.getItem('tema') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
            document.getElementById('pilihTema').addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('tema', document.documentElement.classList.contains('dark') ? 'gelap' : 'terang');
            });

            // Kirim Pesan ke Server
            const formKirim = document.getElementById('formKirim');
            const masukPesan = document.getElementById('masukPesan');
            const kotakPesan = document.getElementById('kotakPesan');
            let catatanObrolan = [];

            formKirim.addEventListener('submit', async e => {
                e.preventDefault();
                const teks = masukPesan.value.trim();
                if(!teks) return;

                tambahPesan('kamu', teks);
                masukPesan.value = '';
                const idTunggu = tambahPesan('ai', '<i class="fa fa-spinner fa-spin"></i> Sedang berpikir...');

                try {
                    const res = await fetch('/tanya', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ pesan: teks })
                    });
                    const data = await res.json();
                    gantiPesan(idTunggu, 'ai', data.jawab || 'Maaf, saya belum bisa menjawab ini.');
                    catatanObrolan.push({tanya: teks, jawab: data.jawab});
                    perbaruiDaftarRiwayat();
                } catch (err) {
                    gantiPesan(idTunggu, 'ai', 'Terjadi kesalahan: ' + err.message);
                }
            });

            // Fungsi Menampilkan Pesan
            function tambahPesan(jenis, isi) {
                const id = Date.now();
                const el = document.createElement('div');
                el.className = jenis === 'kamu' ? 'flex gap-2 max-w-[85%] ml-auto flex-row-reverse' : 'flex gap-2 max-w-[85%]';
                el.id = 'pesan-' + id;
                el.innerHTML = jenis === 'kamu' ? `
                    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"><i class="fa fa-user"></i></div>
                    <div class="bg-blue-500 text-white p-3 rounded-2xl shadow-sm">${isi}</div>` : `
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0"><i class="fa fa-robot"></i></div>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">${isi}</div>`;
                kotakPesan.appendChild(el);
                kotakPesan.parentElement.scrollTop = kotakPesan.parentElement.scrollHeight;
                return id;
            }

            function gantiPesan(id, jenis, isi) {
                const el = document.getElementById('pesan-' + id);
                if(!el) return;
                el.innerHTML = jenis === 'kamu' ? `
                    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"><i class="fa fa-user"></i></div>
                    <div class="bg-blue-500 text-white p-3 rounded-2xl shadow-sm">${isi}</div>` : `
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0"><i class="fa fa-robot"></i></div>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">${isi}</div>`;
            }

            function perbaruiDaftarRiwayat() {
                const daftar = document.getElementById('daftarRiwayat');
                if(catatanObrolan.length === 0) {
                    daftar.innerHTML = '<p class="text-gray-500 italic">Belum ada pesan</p>';
                    return;
                }
                daftar.innerHTML = '';
                catatanObrolan.forEach(obrolan => {
                    const tombol = document.createElement('button');
                    tombol.className = 'w-full text-left p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 truncate';
                    tombol.textContent = obrolan.tanya.length > 25 ? obrolan.tanya.slice(0,25) + '...' : obrolan.tanya;
                    tombol.onclick = () => masukPesan.value = obrolan.tanya;
                    daftar.appendChild(tombol);
                });
            }

            // Tombol Gambar & Suara
            document.getElementById('btnGambar').onclick = () => document.getElementById('masukGambar').click();
            document.getElementById('masukGambar').onchange = e => {
                if(e.target.files.length) tambahPesan('kamu', '📸 Gambar telah dilampirkan');
            };
            document.getElementById('btnSuara').onclick = () => alert('Fitur rekam suara siap dikembangkan selanjutnya');
        </script>
    </body>
    </html>
    `);
});

// Hubungan ke API OpenRouter
app.post('/tanya', async (req, res) => {
    const pertanyaan = req.body.pesan;
    if(!pertanyaan) return res.json({ jawab: "Silakan tulis pesan terlebih dahulu." });

    try {
        const hasil = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: MODEL_AI,
            messages: [
                { role: "system", content: "Kamu adalah Kpaca AI, jawab dengan ramah, sopan, dan selalu gunakan Bahasa Indonesia yang mudah dimengerti." },
                { role: "user", content: pertanyaan }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://kpaca-iu.vercel.app",
                "X-Title": "Kpaca AI"
            }
        });
        res.json({ jawab: hasil.data.choices[0].message.content.trim() });
    } catch (salah) {
        console.error("Kesalahan API:", salah.response?.data || salah.message);
        res.json({ 
            jawab: "Gagal terhubung: " + (salah.response?.data?.error?.message || salah.message) 
        });
    }
});

// Untuk pengujian lokal
app.listen(PORT, () => console.log(`✅ Kpaca AI berjalan di http://localhost:${PORT}`));

// Wajib untuk Vercel
module.exports = app;
