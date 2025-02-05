import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoutes from "./utils/ProtectedRoutes.tsx"
import SignUpPage from './page/SignUpPage.tsx'
import LogInPage from './page/LogInPage.tsx'
import GenerateTitle from './page/GenerateTitle.tsx'
import UserInfo from './page/UserInfo.tsx'
import GeneratePost from './page/GeneratePost.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

createRoot(document.getElementById('root')!).render(
  
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<App />} />
            <Route path="/generate-posts" element={<GenerateTitle/>} />
            <Route path="/review-post" element={<GeneratePost/>} />
          </Route>
          <Route path="/signin" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/userdata" element={<UserInfo/>}/>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>

)