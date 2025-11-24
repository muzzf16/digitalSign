# Future Improvement Recommendations

## 🎯 Quick Wins (Can be done in 1-2 hours)

### 1. Refactor Admin Subcomponents to Use New Input Component
**Files to update:**
- `components/admin/AdminBranding.tsx`
- `components/admin/AdminCarousel.tsx`
- `components/admin/AdminRates.tsx`
- `components/admin/AdminAudio.tsx`

**Benefits:**
- Consistent input styling
- Built-in error message support
- Better accessibility

**Example:**
```typescript
// Replace
<input 
  type="text" 
  value={value} 
  onChange={onChange}
  className="w-full bg-slate-900 p-2 rounded border border-slate-600"
/>

// With
<Input
  type="text"
  value={value}
  onChange={onChange}
  fullWidth
  error={errors[field]}
  label="Field Label"
/>
```

### 2. Add Image Lazy Loading to PromoCarousel
**File:** `components/PromoCarousel.tsx`

**Current Issue:** All images are loaded immediately

**Solution:**
```typescript
const PromoCarousel: React.FC<PromoCarouselProps> = ({ images, currentIndex }) => {
  return (
    <div className="w-full h-full relative bg-[#1A2C4A] overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image + index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Only load images near current index */}
          {Math.abs(index - currentIndex) <= 1 && (
            <img 
              src={image}
              alt={`Promo ${index + 1}`}
              loading={index === currentIndex ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}
    </div>
  );
};
```

### 3. Add Confirmation Dialog Component
**File to create:** `components/ui/ConfirmDialog.tsx`

**Replace native `confirm()` with custom dialog:**
```typescript
// Usage
const { showConfirm } = useConfirmDialog();

const handleReset = async () => {
  const confirmed = await showConfirm({
    title: 'Konfirmasi Reset',
    message: 'Yakin ingin mereset antrian ke 0?',
    confirmText: 'Reset',
    cancelText: 'Batal',
    variant: 'danger'
  });
  
  if (confirmed) {
    await resetQueue();
  }
};
```

### 4. Extract Color Classes to Theme Constants
**Problem:** Dynamic className like `text-${colorClass}-400` doesn't work with Tailwind

**Solution in `constants/theme.ts`:**
```typescript
export const QUEUE_COLORS = {
  teller: {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500',
  },
  cs: {
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
  },
} as const;
```

**Usage:**
```typescript
const colors = QUEUE_COLORS[role];
<Button className={`${colors.primary} ${colors.hover}`}>
```

## 🚀 Medium Priority (2-4 hours)

### 5. Optimize Sidebar Performance
**File:** `components/Sidebar.tsx`

**Issues:**
- All widgets re-render when any data changes
- Animation resets on data update

**Solutions:**
```typescript
// 1. Memoize individual widgets
const CurrencyWidget = React.memo<{ rates: CurrencyRate[] }>(({ rates }) => {
  // ... existing code
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.rates) === JSON.stringify(nextProps.rates);
});

// 2. Memoize sidebar content
const sidebarContent = useMemo(() => (
  <>
    <KreditUsahaMikro promos={kreditPromos} />
    <div className="grid grid-cols-2 gap-4">
      <TabunganInfo rates={savingsRates} />
      <DepositoInfo rates={depositoRates} />
    </div>
    <CurrencyWidget rates={currencyRates} />
    <GoldWidget gold={goldPrice} />
  </>
), [kreditPromos, savingsRates, depositoRates, currencyRates, goldPrice]);
```

### 6. Add Skeleton Loading States
**Files to create:** `components/ui/Skeleton.tsx`

**Use Cases:**
- Loading currency rates
- Loading gold prices
- Loading promos

**Example:**
```typescript
export const CurrencySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="flex justify-between">
        <div className="h-6 w-20 bg-slate-700 rounded"></div>
        <div className="h-6 w-32 bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

// Usage in Sidebar
{economicData.currencyRates.length === 0 ? (
  <CurrencySkeleton />
) : (
  <CurrencyWidget rates={economicData.currencyRates} />
)}
```

### 7. Add Responsive Design
**Current Issue:** Fixed layout doesn't adapt to smaller screens

**Solution:**
```typescript
// In App.tsx
<main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 min-h-0 pt-4">
  <div className="lg:col-span-2 h-full min-h-0 relative">
    {/* Promo content */}
  </div>
  <div className="hidden lg:block lg:col-span-1 h-full overflow-hidden">
    <Sidebar {...sidebarProps} />
  </div>
</main>

// Add mobile navigation for Sidebar
<button 
  className="lg:hidden fixed bottom-4 right-4 z-50"
  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
>
  <svg>...</svg>
</button>
```

### 8. Improve PromoContent Animations
**File:** `components/PromoContent.tsx`

**Issues:**
- No exit animation
- Animation key can cause issues

**Solution:**
```typescript
import { useState, useEffect } from 'react';

const PromoContent: React.FC<PromoContentProps> = ({ promo }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(promo);

  useEffect(() => {
    if (promo?.title !== currentPromo?.title) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentPromo(promo);
        setIsExiting(false);
      }, 400);
    }
  }, [promo]);

  if (!currentPromo) return null;

  const animationClass = isExiting 
    ? 'animate-content-exit' 
    : 'animate-content-enter';

  return (
    <div className={`relative w-full h-full ${animationClass}`}>
      {/* content */}
    </div>
  );
};
```

**Add exit animation to CSS:**
```css
@keyframes content-exit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.98);
    filter: blur(4px);
  }
}
```

## 🎨 Polish & Enhancement (4-8 hours)

### 9. Add Settings Persistence
**Create:** `utils/storage.ts`

**Features:**
- Save/load admin settings to localStorage
- Offline editing capability
- Auto-save drafts

```typescript
export const storage = {
  save: <T>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};
```

### 10. Add Undo/Redo for Admin Panel
**Implementation:**
- History stack for changes
- Ctrl+Z / Ctrl+Y shortcuts
- Show undo/redo buttons

```typescript
const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = (newState: T) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};
```

### 11. Add Image Preview & Crop
**Feature:** Before uploading images, allow cropping/resizing

**Library suggestion:** `react-image-crop` or `react-easy-crop`

**Benefits:**
- Consistent image sizes
- Better UX
- Reduced file sizes

### 12. Add Real-time Sync Indicator
**Feature:** Show sync status with server

```typescript
const SyncIndicator = () => {
  const [status, setStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  return (
    <div className="flex items-center gap-2">
      {status === 'synced' && (
        <>
          <CheckCircle className="text-green-500" size={16} />
          <span className="text-xs text-slate-400">Tersinkronisasi</span>
        </>
      )}
      {status === 'syncing' && (
        <>
          <LoadingSpinner size="sm" />
          <span className="text-xs text-slate-400">Menyinkronkan...</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="text-red-500" size={16} />
          <span className="text-xs text-red-400">Gagal sinkronisasi</span>
        </>
      )}
    </div>
  );
};
```

## 🧪 Testing Recommendations

### 13. Add Unit Tests
**Setup:** Install testing libraries
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Test Files to Create:**
- `utils/__tests__/validation.test.ts`
- `components/ui/__tests__/Button.test.tsx`
- `components/ui/__tests__/Toast.test.tsx`

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { validateRate } from '../validation';

describe('validateRate', () => {
  it('should validate correct rate format', () => {
    expect(validateRate('5%').isValid).toBe(true);
    expect(validateRate('5.5%').isValid).toBe(true);
  });

  it('should reject invalid rate format', () => {
    expect(validateRate('5').isValid).toBe(false);
    expect(validateRate('%5').isValid).toBe(false);
    expect(validateRate('').isValid).toBe(false);
  });
});
```

### 14. Add E2E Tests
**Setup:** Install Playwright
```bash
npm install --save-dev @playwright/test
```

**Test Scenarios:**
- Open admin panel with settings button
- Edit promo and save
- Call next queue number
- Reset queue
- Navigate between views

## 📊 Monitoring & Analytics

### 15. Add Error Tracking
**Integrate Sentry or similar:**
```typescript
// utils/errorTracking.ts
export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, 'Context:', context);
  
  // Send to error tracking service
  if (window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
};
```

### 16. Add Performance Monitoring
```typescript
// utils/performance.ts
export const measurePerformance = (name: string, callback: () => void) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  
  // Send to analytics
};
```

## 🔐 Security Improvements

### 17. Sanitize User Input
**Install:** `dompurify`
```bash
npm install dompurify @types/dompurify
```

**Usage:**
```typescript
import DOMPurify from 'dompurify';

const SafeHTML: React.FC<{ html: string }> = ({ html }) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

### 18. Add CSP Headers
**In `vite.config.ts`:**
```typescript
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
});
```

## 📝 Documentation

### 19. Create Component Storybook
**Setup:**
```bash
npx sb init --builder vite
```

**Benefits:**
- Visual component documentation
- Isolated component development
- Interactive examples

### 20. Add Architecture Documentation
**Create:** `ARCHITECTURE.md`

**Contents:**
- Component hierarchy
- Data flow
- State management
- API integration
- Deployment process

---

## Priority Matrix

| Priority | Effort | Impact | Tasks |
|----------|--------|--------|-------|
| 🔴 High | Low | High | #1, #2, #3, #4 |
| 🟡 Medium | Medium | High | #5, #6, #7, #8 |
| 🟢 Nice-to-have | High | Medium | #9-#20 |

## Next Steps

1. Start with Quick Wins (#1-#4) - Can be done in one sitting
2. Move to Medium Priority (#5-#8) - Spread over a week
3. Consider Nice-to-have based on requirements and timeline

Each improvement builds on the refactoring work already completed and maintains the high code quality standards established.
