<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Video Tidak Tersedia' }}</title>
    <style>
        :root {
            color-scheme: light;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: radial-gradient(circle at top left, #eff6ff 0%, #f8fafc 40%, #ffffff 100%);
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .card {
            width: 100%;
            max-width: 760px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
            padding: 24px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #075985;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
        }

        h1 {
            margin: 16px 0 12px;
            font-size: 28px;
            line-height: 1.2;
            color: #0f172a;
        }

        p {
            margin: 0;
            font-size: 16px;
            line-height: 1.7;
            color: #334155;
        }

        .note {
            margin-top: 18px;
            border: 1px solid #bfdbfe;
            background: #eff6ff;
            color: #1e3a8a;
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 14px;
            line-height: 1.6;
        }

        @media (max-width: 640px) {
            .card {
                padding: 18px;
            }

            h1 {
                font-size: 22px;
            }

            p {
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <main class="card">
        <div class="badge">Informasi Media</div>
        <h1>{{ $title ?? 'Video Tidak Tersedia' }}</h1>
        <p>{{ $message ?? 'Maaf kak, video yang Anda cari saat ini belum tersedia.' }}</p>
        <div class="note">
            Silakan buat media baru dari menu AI Content agar Anda mendapatkan file terbaru yang bisa langsung dipakai dan dibagikan kembali.
        </div>
    </main>
</body>
</html>
