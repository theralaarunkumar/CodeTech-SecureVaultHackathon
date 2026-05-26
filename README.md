# SecureVault 🛡️

**A zero-knowledge, local-first password auditing and analytics platform.**

[![React](https://img.shields.io/badge/React-19.2.6-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-purple.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-yellow.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## 🎯 The Problem

People are consistently reusing weak passwords across multiple accounts. The biggest barrier to improving password hygiene is that **users don't want to type their passwords into random websites to check if they are safe.** 

Trusting a third-party server to process plaintext passwords is an inherent security risk.

## 💡 Our Solution: SecureVault

SecureVault is an enterprise-grade password auditor that processes everything **locally in your browser**. Your raw passwords never leave your machine. 

Using **k-anonymity** and advanced heuristics, SecureVault allows users to confidently evaluate the security of their credentials without compromising their privacy.

### Features
- 🔒 **Zero-Knowledge Architecture:** No plaintext passwords are ever transmitted to a server.
- ⚡ **Real-time Breach Detection:** Checks credentials against the HaveIBeenPwned database using the `SHA-1 prefix` k-anonymity method.
- 🧠 **Advanced Strength Estimation:** Uses Dropbox's `zxcvbn` library to accurately estimate password entropy and time-to-crack.
- 🤖 **Actionable AI Feedback:** Generates immediate, contextual advice on how to improve a password based on identified vulnerabilities (e.g., keyboard patterns, dictionary words).
- 📊 **Scan History & Dashboard:** Securely authenticate (via Google or Email) to save encrypted scan statistics and monitor your password health over time.
- 🎨 **Beautiful UI:** A dark-themed, glassmorphic SaaS interface built with Tailwind CSS and Framer Motion for a premium user experience.

---

## 🏗️ How it works (Under the Hood)

1. **Input:** You enter a password or paste a CSV.
2. **Local Hashing:** The password is cryptographically hashed (SHA-1) locally inside your browser via the Web Crypto API.
3. **K-Anonymity Check:** We take *only the first 5 characters* of the resulting hash and send it to the HIBP API.
4. **Local Matching:** The API returns a list of hundreds of breached hash suffixes. SecureVault searches this list locally to find a match. 
5. **Entropy Analysis:** Simultaneously, `zxcvbn` analyzes the raw password locally to find spatial patterns, dates, and dictionary words.
6. **Result Generation:** The app generates a score and customized actionable feedback without any raw data ever touching our servers.

---

## 💻 Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite (for fast HMR and optimized builds)
- Tailwind CSS (Utility-first styling)
- Framer Motion (Smooth, physics-based animations)
- Lucide React (Beautiful SVG icons)

**Security & Analysis**
- `@zxcvbn-ts/core` (Password strength estimation)
- Web Crypto API (Local SHA-1 Hashing)

**Backend & Authentication**
- Firebase Authentication (Google OAuth, Email/Password)
- Cloud Firestore (For storing anonymized metadata/scan history)

---

## 🚀 Getting Started

To run the project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SecureVault.git
   cd SecureVault-HackathonProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project.
   - Add your Firebase config to a `.env.local` file:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the app in action!

---

## 🔮 What's Next?
- **Browser Extension Integration:** Build a Chrome extension using the same zero-knowledge engine to warn users dynamically as they type weak passwords on websites.
- **Enterprise Team Dashboards:** Allow IT admins to view aggregated (anonymized) security scores for their entire organization.
- **Offline Mode:** Package the app as a PWA with local dictionaries to allow auditing completely disconnected from the internet.

---

*Made with ❤️ for the Hackathon.*
