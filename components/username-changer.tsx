"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UsernameChangerProps {
  currentUsername: string
  onUsernameChanged: (newUsername: string) => void
}

export default function UsernameChanger({ currentUsername, onUsernameChanged }: UsernameChangerProps) {
  const [newUsername, setNewUsername] = useState(currentUsername)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      alert("Enter a valid X username (without @, min 3 chars, max 20, alphanumeric and underscores only)")
      return
    }
    setLoading(true)
    localStorage.setItem("username", newUsername)
    onUsernameChanged(newUsername) // Callback to update parent state
    alert("Username updated successfully!")
    router.push("/challenge") // Redirect to challenge page after update
  }

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg animate-fadeIn">
      <CardHeader className="text-center">
        <img
          src={`https://unavatar.io/twitter/${newUsername || "twitter"}`}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4 border-2 border-primary transition-all duration-300 hover:scale-105"
        />
        <CardTitle className="text-2xl font-bold text-gray-800">Change Username</CardTitle>
        <CardDescription className="text-gray-600">
          Your current username is <span className="font-semibold text-primary">@{currentUsername}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            className="border border-gray-300 rounded-md px-4 py-2 w-full text-center focus:border-primary focus:ring-primary transition-all duration-200"
            placeholder="Enter new X username (without @)"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value.replace("@", ""))}
            required
            minLength={3}
            maxLength={20}
            pattern="^[a-zA-Z0-9_]{3,20}$"
            title="Username must be 3-20 characters long, containing only letters, numbers, and underscores."
          />
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95"
            type="submit"
            disabled={loading || newUsername === currentUsername}
          >
            {loading ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
