const express = require('express');
const axios = require('axios');
const app = express();

const API_KEY = "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";
const MODEL = "gemini-1.5-flash";
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kpaca AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex flex-col">
        <header class="bg-blue-600 text-white py-4 text-center font-bold text-xl">
            🦙 Kpaca AI
        </header>

        <main class="flex-1 container mx-auto max-w-2xl p-4 overflow-y-auto" id="kotakObrolan">
            <div class="space-y-4 pb-20">
                <div class="bg-white p-3 rounded-xl shadow max-w-[85%]">
                    Halo! Ada yang bisa saya bantu?
                </div>
            </div>
        </main>

        <footer class="sticky bottom-0 bg-white border-t p-3">
            <form id="formKirim" class="container mx-auto max-w-2xl flex gap-2">
                <input type="text" id="pesan" placeholder="Ketik pesan..." 
                    class="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">
                    Kirim
                </button>
            </form>
        </footer>

        <script>
            const form = document.getElementById('formKirim');
            const input = document.getElementById('pesan');
            const kotak = document.getElementById('kotakObrolan').firstElementChild;

            form.addEventListener('submit', async e => {
                e.preventDefault();
                const teks = input.value.trim();
                if(!teks) return;

                // Tampilkan pesan kamu
                tambah('kamu', teks);
                input.value = '';
                const idTunggu = tambah('ai', 'Sedang menjawab...');

                // Kirim ke peladen
                const res = await fetch('/tanya', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({p: teks})
                });
                const jwb = await res.json();
                ganti(idTunggu, 'ai', jwb.jawab);
            });

            function tambah(jenis, isi) {
                const id = Date.now();
                const el = document.createElement('div');
                el.id = 'p'+id;
                el.className = jenis==='kamu' 
                    ? 'bg-blue-600 text-white p-3 rounded-xl max-w-[85%] ml-auto' 
                    : 'bg-white p-3 rounded-xl shadow max-w-[85%]';
                el.textContent = isi;
                kotak.appendChild(el);
                window.scrollTo(0, document.body.scrollHeight);
                return id;
            }

            function ganti(id, jenis, isi) {
                const el = document.getElementById('p'+id);
                if(!el) return;
                el.className = jenis==='kamu' 
                    ? 'bg-blue-600 text-white p-3 rounded-xl max-w-[85%] ml-auto' 
                    : 'bg-white p-3 rounded-xl shadow max-w-[85%]';
                el.textContent = isi;
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/tanya', async (req, res) => {
    const tanya = req.body.p;
    if(!tanya) return res.json({jawab: 'Silakan tulis pesan dulu.'});

    try {
        const hasil = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: MODEL,
            messages: [
                {role:'system', content:'Jawab dengan bahasa Indonesia yang sederhana dan jelas.'},
                {role:'user', content: tanya}
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://kpaca-iu.vercel.app',
                'X-Title': 'Kpaca AI'
            }
        });
        res.json({jawab: hasil.data.choices[0].message.content.trim()});
    } catch (e) {
        res.json({jawab: 'Kesalahan: ' + (e.response?.data?.error?.message || e.message)});
    }
});

app.listen(PORT, () => console.log(`Jalan di http://localhost:${PORT}`));
module.exports = app;
        
