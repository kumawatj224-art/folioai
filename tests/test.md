# 🐛 BUG-1: User Registration ID Constraint Failure

**Date:** April 6, 2026  
**Reporter:** Raghav  
**Status:** ✅ Fixed & Verified  

---

## 1. The Problem (Symptom)

During the E2E flow of User Registration (OTP Verification stage), the API returned a **`500 Internal Server Error`**.

**Error Logs:**
> `null value in column "id" of relation "users" violates not-null constraint.`

**Secondary Error:**
> `PGRST116 (The result contains 0 rows)` 
> *Occurred because the insert failed before the select could execute.*

---

## 2. Root Cause Analysis (RCA)

The `users` table in the database was configured with a Primary Key (`id`) that required a value, but met two conditions directly causing the bug:

1. **Database Schema Issue:** The database schema did not have a default value (like `gen_random_uuid()`) set for the `id` column.
2. **Application Code Issue:** The application code (`src/lib/auth/user-store.ts`) was attempting an `.insert()` without providing an explicit `id`.

### Stack Trace
```text
Registration error: Error: null value in column "id" of relation "users" violates not-null constraint
    at createUser (src\lib\auth\user-store.ts:83:11)
    at async POST (src\app\api\auth\register\route.ts:89:20)
```

---

## 3. The Fix

**File:** `src/lib/auth/user-store.ts`

The issue was resolved by generating an explicit UUID using `crypto.randomUUID()` when creating a new user record.

```typescript
const { data, error } = await supabase
  .from("users")
  .insert([
    {
      id: crypto.randomUUID(), // <--- Added this line
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      password_salt: passwordSalt,
    },
  ])
  .select()
  .single();
```

<br />

# 🐛 BUG-2: PDF Resume Parsing JSON Error

**Date:** April 6, 2026  
**Reporter:** Raghav  
**Status:** 🔴 Open  

---

## 1. The Problem (Symptom)

When attempting to upload a resume file formatted as a PDF (`Raghav_Resume_3.pdf`) via the chat interface, the system fails to parse the document and displays an error message overlay/toast to the user.

**Error Message Displayed:**
> `Sorry, I couldn't parse that resume.`  
> `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

---

## 2. Preliminary Root Cause Analysis (RCA)

The frontend client made a request to the backend API expecting a `JSON` response payload. Instead, the backend returned an `HTML` string (starting with `<!DOCTYPE `), causing `JSON.parse()` or `.json()` to throw a standard syntax error on the client.

**Potential Causes:**
1. **Unhandled Text Parse Exception:** The API endpoint handling PDF extraction (e.g. OCR or local parser) crashed, causing the server framework to serve a default HTML `500 Server Error` page instead of a structured JSON response `{ error: ... }`.
2. **Access/Routing Issues:** The API returned a `404 Not Found` HTML page due to incorrect routing, or an HTML redirect to a login page due to missed authentication configuration on the endpoint.
3. **Payload Limitations:** A file upload size limit was hit configuring the server (e.g. Body parser limit or Vercel limit) resulting in a `413 Payload Too Large` HTML error page.

---

## 3. Recommended Next Steps

1. Check the active server console logs (`npm run dev`) during the upload of `Raghav_Resume_3.pdf` to identify any stack trace originating from the specific parsing controller.
2. Ensure the target API route has a global `try/catch` block that forcefully returns `Response.json({ error: e.message }, { status: 500 })` rather than throwing uncaught.
3. Add a check on the frontend before calling `res.json()`. Specifically, verify `res.ok` or check the `Content-Type` header (e.g. `res.headers.get("content-type").includes("application/json")`) to show a friendlier error to the user when the response is HTML.

<br />

# 🐛 BUG-3: Next.js Compile Error (Module Not Found)

**Date:** April 7, 2026  
**Reporter:** System Logs  
**Status:** ✅ Fixed  

---

## 1. The Problem (Symptom)

The `npm run dev` development server continuously threw 500 Internal Server Errors when trying to access `/api/chat`, `/api/resume/parse`, and `/chat/new`. The terminal flooded with compilation errors stating:
> `Module not found: Can't resolve 'mammoth'`
> `Module not found: Can't resolve 'openai'`

## 2. Root Cause Analysis (RCA)

The `package.json` file dictates which third-party packages the application relies on, while `node_modules` contains the locally downloaded copies of these packages. 
After switching or pulling branches, new dependencies (`mammoth`, `openai`) had been added to `package.json` by another user/device, but the local development environment had not downloaded them yet. Next.js could not resolve the import statements in code (e.g., `import mammoth from "mammoth";` or `import { AzureOpenAI } from "openai";`) leading to a massive cascade of 500 errors.

## 3. The Fix

By running the command `npm install` in the project root folder directory, the Node package manager downloaded all missing dependencies outlined in `package.json` and placed them into the `node_modules` folder. Doing this synced the environment, and the `next dev` server recompiled successfully.
