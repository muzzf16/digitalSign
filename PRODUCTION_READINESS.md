# 🚀 Production Readiness Checklist

## ✅ Checklist Persiapan Deploy ke Production

### 1️⃣ Environment & Configuration

- [ ] **Buat file `.env` untuk production**
  ```bash
  # .env.production
  GEMINI_API_KEY=your_actual_api_key_here
  NODE_ENV=production
  PORT=3001
  ```

- [ ] **Update `.gitignore` - Pastikan file sensitif tidak ter-commit**
  ```
  .env
  .env.production
  .env.local
  db.json.backup
  ```

- [ ] **Setup Environment Variables di Server**
  - Jangan hardcode API keys di code
  - Gunakan `.env` file atau environment variables server

### 2️⃣ Security Hardening

- [ ] **CORS Configuration** (proxy-server.cjs)
  ```javascript
  // Ganti dari:
  app.use(cors());
  
  // Menjadi:
  app.use(cors({
    origin: ['http://your-domain.com', 'http://192.168.1.x'], // Whitelist domains
    methods: ['GET', 'POST'],
    credentials: true
  }));
  ```

- [ ] **Rate Limiting** - Tambahkan untuk mencegah abuse
  ```bash
  npm install express-rate-limit
  ```
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  app.use('/api/', limiter);
  ```

- [ ] **Input Validation** - Validasi data sebelum save ke db.json
  - Check required fields
  - Sanitize input untuk prevent injection
  - Validate image size/format

- [ ] **Helmet.js** - Security headers
  ```bash
  npm install helmet
  ```
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

### 3️⃣ Performance Optimization

- [ ] **Compression** - Gzip compression untuk response
  ```bash
  npm install compression
  ```
  ```javascript
  const compression = require('compression');
  app.use(compression());
  ```

- [ ] **Optimize Images**
  - Compress promo images sebelum upload
  - Set max image size (currently 10mb, consider reducing)
  - Convert to WebP format untuk better compression

- [ ] **Caching Headers** - Set proper cache headers
  ```javascript
  app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
  }));
  ```

- [ ] **Database Optimization**
  - Consider using SQLite/PostgreSQL untuk better performance
  - Current db.json works for small data, but not scalable

### 4️⃣ Error Handling & Logging

- [ ] **Centralized Error Handler**
  ```javascript
  // Add to proxy-server.cjs
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  ```

- [ ] **Logging System** - Winston atau Morgan
  ```bash
  npm install winston morgan
  ```
  - Log ke file, bukan hanya console
  - Rotate logs untuk prevent disk penuh
  - Log levels: error, warn, info, debug

- [ ] **Remove Console.logs** - Atau gunakan proper logging
  - Replace `console.log` dengan logger
  - Disable di production atau log ke file

### 5️⃣ Backup & Recovery

- [ ] **Automatic Backup db.json**
  ```javascript
  // Add to proxy-server.cjs
  const backupInterval = 6 * 60 * 60 * 1000; // 6 hours
  
  function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(__dirname, 'backups', `db-${timestamp}.json`);
    fs.copyFile(DB_PATH, backupPath, (err) => {
      if (err) console.error('Backup failed:', err);
      else console.log('✅ Database backed up:', backupPath);
    });
  }
  
  setInterval(backupDatabase, backupInterval);
  ```

- [ ] **Backup Strategy**
  - Daily backups
  - Keep last 7 days
  - External backup location (cloud/external drive)

### 6️⃣ Process Management

- [ ] **Install PM2** - Process manager untuk production
  ```bash
  npm install -g pm2
  ```

- [ ] **Create PM2 Ecosystem File**
  ```javascript
  // ecosystem.config.js
  module.exports = {
    apps: [{
      name: 'bpr-digital-signage',
      script: './proxy-server.cjs',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false
    }]
  };
  ```

- [ ] **PM2 Commands**
  ```bash
  # Start
  pm2 start ecosystem.config.js
  
  # Monitor
  pm2 monit
  
  # Logs
  pm2 logs
  
  # Restart
  pm2 restart bpr-digital-signage
  
  # Auto-start on boot
  pm2 startup
  pm2 save
  ```

### 7️⃣ Testing

- [ ] **Build Test**
  ```bash
  npm run build
  npm start
  ```
  - Check no errors
  - Test di browser
  - Test semua features

- [ ] **Load Testing** - Test dengan multiple users
  - Test concurrent saves
  - Test queue system dengan multiple clicks
  - Test image uploads

- [ ] **Cross-browser Testing**
  - Chrome
  - Firefox
  - Edge
  - Safari (if available)

- [ ] **Network Testing**
  - Test dari device lain di LAN
  - Test dengan slow connection
  - Test offline behavior

### 8️⃣ Monitoring

- [ ] **Health Check Endpoint**
  ```javascript
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: fs.existsSync(DB_PATH) ? 'connected' : 'error'
    });
  });
  ```

- [ ] **Monitor Disk Space** - db.json dan backups bisa membesar
  - Alert jika disk < 10%
  - Clean old backups

- [ ] **Monitor Memory Usage**
  - PM2 monitoring
  - Set max_memory_restart

### 9️⃣ Deployment Steps

1. **Pre-deployment**
   ```bash
   # Backup current db.json
   cp db.json db.json.backup
   
   # Pull latest code
   git pull origin main
   
   # Install dependencies
   npm install --production
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Test Build Locally**
   ```bash
   npm start
   # Test di browser: http://localhost:3001
   ```

4. **Deploy with PM2**
   ```bash
   pm2 restart bpr-digital-signage
   # Or first time:
   pm2 start ecosystem.config.js
   ```

5. **Verify**
   ```bash
   pm2 logs bpr-digital-signage --lines 50
   pm2 monit
   ```

### 🔟 Post-deployment

- [ ] **Smoke Test**
  - [ ] Homepage loads
  - [ ] Admin panel works
  - [ ] Save data works
  - [ ] Queue system works
  - [ ] Images display correctly

- [ ] **Monitor Logs**
  ```bash
  pm2 logs bpr-digital-signage
  ```

- [ ] **Check System Resources**
  ```bash
  pm2 monit
  ```

### 1️⃣1️⃣ Windows Server Specific

- [ ] **Install Node.js LTS** di server
  - Download dari nodejs.org
  - Versi LTS recommended

- [ ] **Firewall Rules**
  ```powershell
  # Allow port 3001
  New-NetFirewallRule -DisplayName "BPR Digital Signage" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
  ```

- [ ] **Auto-start on Boot**
  - PM2 startup untuk Windows
  - Atau buat Windows Service

- [ ] **Scheduled Tasks** untuk backup
  - Windows Task Scheduler
  - Backup db.json daily

### 1️⃣2️⃣ Network Configuration

- [ ] **Static IP** - Set static IP untuk server
  - Prevent IP changes
  - Update firewall rules

- [ ] **DNS/Hostname** (Optional)
  - Setup hostname untuk easier access
  - Example: `http://bpr-signage.local`

- [ ] **Port Forwarding** (Jika perlu remote access)
  - Router configuration
  - Security considerations

### ⚠️ Critical Issues to Fix Before Production

1. **GEMINI_API_KEY exposed in frontend**
   - Currently in `vite.config.ts` → `process.env`
   - Move API calls to backend
   - Never expose API keys in frontend code

2. **No Authentication**
   - Admin panel accessible to anyone
   - Consider adding password protection
   - At minimum: obscure admin panel URL

3. **No Input Validation**
   - Anyone can POST any data to `/api/data`
   - Add validation middleware
   - Sanitize inputs

4. **No Database Locking**
   - Concurrent writes bisa corrupt db.json
   - Consider using proper database
   - Or implement file locking

5. **Large Image Uploads**
   - 10mb limit bisa bikin server slow
   - Implement image compression
   - Consider external storage (S3/CloudFlare)

---

## 📋 Quick Production Deploy

**Minimum steps untuk deploy sekarang:**

```bash
# 1. Install dependencies
npm install --production

# 2. Build
npm run build

# 3. Start
npm start

# 4. Access
# http://SERVER_IP:3001
```

**Better production deploy (with PM2):**

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Create ecosystem config (see above)
# Save as ecosystem.config.js

# 3. Build
npm run build

# 4. Start with PM2
pm2 start ecosystem.config.js

# 5. Save PM2 config
pm2 save

# 6. Setup auto-start
pm2 startup

# 7. Monitor
pm2 monit
```

---

## 🎯 Priority Levels

### 🔴 CRITICAL (Must have)
- Environment variables for API keys
- Input validation
- CORS configuration
- PM2 process manager
- Backup strategy
- Error handling

### 🟡 IMPORTANT (Should have)
- Rate limiting
- Logging system
- Compression
- Health check endpoint
- Authentication

### 🟢 NICE TO HAVE (Could have)
- Advanced monitoring
- CDN for static assets
- Database migration
- Advanced caching

---

## 📞 Support Checklist

- [ ] Documentation complete
- [ ] Admin training
- [ ] Troubleshooting guide
- [ ] Backup/restore procedures
- [ ] Contact person for issues
- [ ] Maintenance schedule

---

## ✅ Go-Live Checklist

- [ ] All critical items completed
- [ ] Testing passed
- [ ] Backup created
- [ ] PM2 configured
- [ ] Firewall configured
- [ ] Network accessible
- [ ] Documentation updated
- [ ] Team trained
- [ ] Monitoring setup
- [ ] Emergency procedures ready

---

**Last Updated:** 2025-11-24
**Next Review:** Before production deployment
