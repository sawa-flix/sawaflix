# Search History Debugging Guide

## Quick Debug Checklist

### Step 1: Open Browser DevTools
1. Go to `/search` page
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Go to **Console** tab
4. Clear any existing logs: `console.clear()`

### Step 2: Test the Search Bar
1. **Click on the search input field** (make it focused)
2. **Leave it empty** (don't type anything)
3. Watch the Console for logs

### What You Should See in Console

#### ✅ If working correctly:
```
[SearchBar] Render - isFocused: true query: "" historyLoading: false history.length: 0
[SearchBar] showHistory: true showResults: false
[SearchHistory] Rendering - loading: false history.length: 0 history: []
[SearchHistory] Showing EMPTY state - No recent searches
```

#### ❌ If SearchHistory component never shows:
Look for one of these patterns:

### Issue 1: showHistory is FALSE
```
[SearchBar] showHistory: false showResults: false
[SearchBar] showHistory logic - isFocused: false query empty: true loading: false
```
**Problem**: Input is NOT focused
**Solution**: Make sure you click INSIDE the input field

---

```
[SearchBar] showHistory: false showResults: false
[SearchBar] showHistory logic - isFocused: true query empty: false loading: false
```
**Problem**: Query is NOT empty (you typed something)
**Solution**: Clear the input and try again

---

```
[SearchBar] showHistory: false showResults: false
[SearchBar] showHistory logic - isFocused: true query empty: true loading: true
```
**Problem**: `loading` is TRUE (search results are loading)
**Solution**: Wait for results to load, then empty the search

---

### Issue 2: useSearchHistory hook fails
Look for these errors:
```
[useSearchHistory] ERROR loading search history: 
[useSearchHistory] Error message: Failed to fetch search history
```

Then check:
```
[searchHistoryService] Making request to: https://sawaflix-backend.onrender.com/search
[searchHistoryService] Response status: 404
[searchHistoryService] API Error: ...
```

**This means**:
- ✅ The API call IS being made
- ❌ The backend endpoint doesn't exist (404)
- ❌ You need to implement the backend `/search` endpoint

---

### Issue 3: Supabase not authenticated
Look for:
```
[searchHistoryService] Supabase session: NO (not authenticated)
[searchHistoryService] Token present: NO
```

**This means**:
- ✅ The code is running
- ❌ User is not logged in
- ❌ The `/search` endpoint should work even without auth (or allow guest requests)

**Solution**: Either
1. Make sure user is logged in first, OR
2. Make backend `/search` endpoint allow unauthenticated requests

---

### Issue 4: Network error (not 404)
Look for:
```
[searchHistoryService] Fetch exception: TypeError: Failed to fetch
```

**This could mean**:
1. **Backend is down** - Check if `https://sawaflix-backend.onrender.com` is running
2. **CORS issue** - Backend isn't allowing requests from your frontend
3. **Network issue** - No internet connection
4. **Wrong URL** - BACKEND_URL is incorrect

**How to check**:
1. Go to Network tab in DevTools
2. Look for a request to `https://sawaflix-backend.onrender.com/search`
3. If red/failed: backend is down or CORS blocked
4. If no request at all: code isn't even calling the service

---

## Step-by-Step Debugging Process

### 1. Verify SearchBar is rendering
```
In Console, you should see:
[SearchBar] Render - ... (every time page renders)
```

If you see nothing:
- Maybe using different search component?
- Check if `/search` page actually uses `SearchBar`
- Check for JavaScript errors (red messages in console)

### 2. Verify you can focus the input
```
1. Click search input
2. In Console, you should see:
[SearchBar] Render - isFocused: true
```

If `isFocused` stays false:
- Input might be disabled
- Event handlers might not be working
- Might be CSS z-index issue hiding the input

### 3. Verify useSearchHistory hook mounts
```
1. After focusing input, you should see:
[useSearchHistory] Starting loadHistory...
```

If you don't see this:
- Hook isn't being called
- Component not mounting
- React errors preventing render

### 4. Verify API request is made
```
You should see:
[searchHistoryService] fetchSearchHistory called with limit: 20
[searchHistoryService] Making request to: https://sawaflix-backend.onrender.com/search
```

If you see these but then error:
- Go to Network tab
- Look for `/search` request
- Check Response tab for error message

### 5. Verify SearchHistory component renders
```
You should see:
[SearchHistory] Rendering - loading: false history.length: 0
[SearchHistory] Showing EMPTY state - No recent searches
```

If you don't see this:
- Component isn't being rendered (check showHistory logic)
- Component has render error
- CSS is hiding it

---

## Network Tab Debugging

1. Open DevTools → Network tab
2. Focus search input and leave empty
3. Look for request named `search` (or look at Domain: `sawaflix-backend.onrender.com`)
4. Click on it and check:

**Success (200 OK)**:
```
Status: 200
Response: [] or [{...}]
```

**Not Found (404)**:
```
Status: 404
Response: {"error": "Not Found"}
```

**CORS Error**:
```
Status: (failed) 
No Response
Message: "blocked by CORS policy"
```

**Backend Down**:
```
Status: (connection error/timeout)
Message: "net::ERR_CONNECTION_REFUSED"
```

---

## Common Findings

### Scenario 1: You see "No recent searches" ✅
```
✅ SearchHistory component IS rendering
✅ API call succeeded (empty array)
⚠️  No search history data yet (expected for new users)
⚠️  Backend endpoint works but returns empty
```

**Next step**: Implement backend to save searches

---

### Scenario 2: SearchHistory never appears
```
❌ showHistory is false
OR
❌ useSearchHistory hook errors silently
OR
❌ SearchHistory component has error
```

**Next step**: Follow Issue 1-4 above

---

### Scenario 3: See API error with 404
```
❌ Backend endpoint `/search` doesn't exist
⚠️  This is expected - you need to implement it
```

**Next step**: Build backend `/search` endpoint

---

## Share Your Console Output

Once you run through this, please share:

1. The full console logs when you focus the input and leave it empty
2. Screenshot of Network tab showing `/search` request (if any)
3. Any red error messages

This will help me see exactly where it breaks.

---

## Files with Debug Logging Added

These files now have `console.log()` statements:
- `hooks/useSearchHistory.ts` - Logs hook lifecycle
- `components/searchBar.tsx` - Logs rendering logic
- `components/SearchHistory.tsx` - Logs component rendering
- `services/searchHistory.ts` - Logs API calls

**To remove logging later**: Just search for `console.log('[` and delete those lines.

---

## Expected Backend Response Format

When backend `/search` is implemented, it should return:

```javascript
// GET /search?limit=20
// Success (200):
[
  {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "search_query": "african music",
    "searched_at": "2026-05-19T10:30:00Z"
  },
  {
    "id": "uuid-string",
    "user_id": "uuid-string", 
    "search_query": "traditional dances",
    "searched_at": "2026-05-19T10:25:00Z"
  }
]

// Error (4xx/5xx):
{
  "error": "Error message"
}
```

---

## Next Actions

1. **Run this debug process** and share console output
2. **Identify which issue** matches your situation
3. **Implement backend** based on findings
