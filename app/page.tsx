"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import UsernameChanger from "@/components/username-changer"

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("username")
    if (saved) {
      setUsername(saved)
      setIsLoggedIn(true)
    }
  }, [])

  function handleInitialSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      alert("Enter a valid X username (without @, min 3 chars, max 20, alphanumeric and underscores only)")
      return
    }
    localStorage.setItem("username", username)
    setIsLoggedIn(true)
    router.push("/challenge")
  }

  const handleUsernameChanged = (newUsername: string) => {
    setUsername(newUsername)
  }

  const handleContinueToChallenge = () => {
    router.push("/challenge")
  }

  return (
    <main className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 animate-slideInFromLeft">
          Unleash Your Inner Artist!
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 animate-slideInFromRight">
          Join the creative community, take on daily drawing challenges, and share your unique graffiti art.
        </p>

        {isLoggedIn ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <UsernameChanger currentUsername={username} onUsernameChanged={handleUsernameChanged} />
            <Button
              className="w-full max-w-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200 transform hover:scale-105 active:scale-95"
              onClick={handleContinueToChallenge}
            >
              Continue to Challenge
            </Button>
          </div>
        ) : (
          <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg animate-fadeIn">
            <CardHeader className="text-center">
              <img
                src={`https://unavatar.io/twitter/${username || "twitter"}`}
                alt="Avatar"
                width={80}
                height={80}
                className="rounded-full mx-auto mb-4 border-2 border-primary transition-all duration-300 hover:scale-105"
              />
              <CardTitle className="text-2xl font-bold text-gray-800">Welcome!</CardTitle>
              <CardDescription className="text-gray-600">
                Please enter your X username to start the challenge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <Input
                  className="border border-gray-300 rounded-md px-4 py-2 w-full text-center focus:border-primary focus:ring-primary transition-all duration-200"
                  placeholder="Enter X username (without @)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace("@", ""))}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]{3,20}$"
                  title="Username must be 3-20 characters long, containing only letters, numbers, and underscores."
                />
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  type="submit"
                >
                  Start Challenge
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
