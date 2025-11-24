# 🚀 Setup & Run Guide

## Arsitektur Aplikasi

Aplikasi ini terdiri dari **2 server** yang harus jalan bersamaan:

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Port 3002)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Header     │  │  PromoView   │  │   Sidebar    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │   Vite Dev Server   │  │   Express API       │
    │     Port 3002       │  │     Port 3001       │
    │                     │  │                     │
    │  • React Frontend   │  │  • /api/data (CRUD) │
    │  • Hot Reload       │  │  • /proxy (CORS)    │
    │  • Proxy ke :3001   │  │  • db.json storage  │
    └─────────────────────┘  └─────────────────────┘
                                        │
                                        ▼
                                 ┌──────────┐
                                 │ db.json  │
                                 └──────────┘
```

---

## ✅ Cara Menjalankan Aplikasi

### **Option 1: Otomatis (RECOMMENDED)** ⭐

Jalankan **1 command** untuk start kedua server:

```bash
npm run dev:all
```

Output yang benar:
```
[vite] VITE v6.4.1  ready in 505 ms
[vite] ➜  Local:   http://localhost:3002/
[api]  Proxy and API server listening at http://localhost:3001
```

### **Option 2: Manual (2 Terminal)**

Jika `concurrently` bermasalah, jalankan di 2 terminal terpisah:

**Terminal 1 - API Server:**
```bash
npm run dev:server
```
✅ Harus muncul: `Proxy and API server listening at http://localhost:3001`

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```
✅ Harus muncul: `Local: http://localhost:3002/`

---

## 🔍 Troubleshooting

### ❌ Error: `ECONNREFUSED /api/data`

**Problem:** API server belum jalan

**Solution:**
```bash
# Stop semua server (Ctrl+C)
# Lalu jalankan ulang:
npm run dev:all
```

### ❌ Error: `Port 3001 already in use`

**Problem:** Ada proses lain yang pakai port 3001

**Solution Windows:**
```bash
# Cari proses di port 3001
netstat -ano | findstr :3001

# Kill proses (ganti PID dengan angka yang muncul)
taskkill /PID <PID> /F
```

**Solution Linux/Mac:**
```bash
# Cari dan kill proses
lsof -ti:3001 | xargs kill -9
```

### ❌ Error: `EADDRINUSE: address already in use :::3002`

**Problem:** Vite dev server sudah jalan di tab lain

**Solution:**
- Tutup terminal lain yang menjalankan `npm run dev`
- Atau gunakan port lain di `vite.config.ts`

### ✅ Cara Cek Server Sudah Jalan

**1. API Server (Port 3001):**
Buka browser: http://localhost:3001/api/data

Expected response: JSON data dari `db.json`

**2. Vite Dev Server (Port 3002):**
Buka browser: http://localhost:3002

Expected: Aplikasi Digital Signage muncul

---

## 📱 URLs Aplikasi

### **Standard View (Digital Signage)**
```
http://localhost:3002/
```
Tampilan layar utama dengan promo, sidebar, dan news ticker

### **Admin Panel**
```
http://localhost:3002/
```
Klik tombol ⚙️ (settings) di kanan bawah untuk buka panel admin

Shortcuts:
- `ESC` - Tutup panel
- `Ctrl+S` / `Cmd+S` - Simpan perubahan

### **Teller Queue Panel**
```
http://localhost:3002/?mode=teller
```
Panel kontrol antrian untuk teller (prefix A)

### **Customer Service Queue Panel**
```
http://localhost:3002/?mode=cs
```
Panel kontrol antrian untuk customer service (prefix B)

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only (port 3002) |
| `npm run dev:server` | Start API server only (port 3001) |
| `npm run dev:all` | **Start both servers** (RECOMMENDED) |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview production build |
| `npm run start-proxy` | Alias untuk `dev:server` |

---

## 📁 File Penting

```
digitalsignApp/
│
├── proxy-server.cjs      ← API Server (port 3001)
├── server.js             ← (Deprecated, tidak dipakai)
├── db.json               ← Database (JSON file)
├── vite.config.ts        ← Vite config (proxy settings)
│
├── components/           ← React components
│   ├── ui/              ← Reusable UI components
│   ├── admin/           ← Admin panel components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── AdminPanel.tsx
│   └── StaffQueuePanel.tsx
│
├── constants/            ← Theme constants
│   └── theme.ts
│
├── utils/                ← Utility functions
│   ├── validation.ts
│   └── audio.ts
│
└── hooks/                ← Custom React hooks
    ├── useAppData.ts
    ├── useAdminForm.ts
    └── useCurrentTime.ts
```

---

## 🌐 Network Access (LAN)

Untuk akses dari perangkat lain di jaringan yang sama:

### **1. Cek IP Address:**

**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address: 192.168.x.x`

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

### **2. Update Vite Config (Optional)**

File: `vite.config.ts`
```typescript
server: {
  host: '0.0.0.0',  // ✅ Already configured!
  port: 3002,
}
```

### **3. Access dari Device Lain:**
```
http://192.168.x.x:3002/
```
Replace `192.168.x.x` dengan IP address komputer Anda.

⚠️ **Catatan:** API server (`proxy-server.cjs`) harus update untuk accept connections dari LAN:

```javascript
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
```

---

## 🏗️ Production Build & Deploy

### **1. Build Aplikasi:**
```bash
npm run build
```
Output: `dist/` folder

### **2. Test Production Build:**
```bash
# Terminal 1: Start API server
npm run start-proxy

# Terminal 2: Preview build
npm run preview
```

### **3. Deploy:**

**Option A: Single Server (API + Static Files)**
```bash
# Start proxy-server.cjs
# It already serves static files from dist/
npm start
```

**Option B: Separate Servers (Nginx + Node)**
- Deploy `dist/` to Nginx/Apache
- Run `proxy-server.cjs` on separate process/server
- Update Vite proxy config untuk production API URL

---

## 🎯 Quick Start Checklist

Untuk development baru:

- [ ] `npm install` - Install dependencies
- [ ] Check `db.json` exists
- [ ] `npm run dev:all` - Start both servers
- [ ] Open http://localhost:3002
- [ ] Verify no `ECONNREFUSED` errors
- [ ] Test admin panel (click ⚙️)
- [ ] Test save changes (Ctrl+S)
- [ ] Test teller mode: `?mode=teller`
- [ ] Test CS mode: `?mode=cs`

---

## 📊 Monitoring

### **Server Logs:**

**API Server (port 3001):**
```
Proxy and API server listening at http://localhost:3001
GET /api/data 200 - 12ms
POST /api/data 200 - 25ms
```

**Vite Dev Server (port 3002):**
```
VITE v6.4.1  ready in 505 ms
➜  Local:   http://localhost:3002/
➜  Network: http://192.168.0.14:3002/
```

### **Browser Console:**

No errors expected. If you see:
- `Failed to fetch` - API server not running
- `CORS error` - Check proxy configuration
- `404 /api/data` - API route not found

---

## 💡 Tips

1. **Always run both servers** untuk development
2. **Use `npm run dev:all`** untuk kemudahan
3. **Check console logs** untuk debugging
4. **Port 3001 MUST be available** untuk API server
5. **Port 3002 MUST be available** untuk Vite
6. **Save changes dalam admin panel** persist ke `db.json`
7. **Toast notifications** menggantikan `alert()` untuk UX lebih baik

---

## 🆘 Still Having Issues?

1. **Stop all servers** (Ctrl+C di semua terminal)
2. **Kill processes on ports:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   netstat -ano | findstr :3002
   taskkill /PID <PID> /F
   ```
3. **Clear node_modules (if needed):**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. **Check firewall** tidak block port 3001/3002
5. **Restart computer** (last resort)

---

## ✅ Success Indicators

Aplikasi jalan dengan benar jika:

✅ Terminal tidak ada error merah
✅ Browser bisa akses http://localhost:3002
✅ No `ECONNREFUSED` errors
✅ Admin panel bisa dibuka
✅ Save changes berhasil (toast notification muncul)
✅ Queue controls berfungsi (increment, recall, reset)
✅ Toast notifications muncul untuk success/error

---

Selamat developing! 🎉
