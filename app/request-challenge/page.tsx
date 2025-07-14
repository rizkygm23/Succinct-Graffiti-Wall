"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function RequestChallengePage() {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from("challenges").insert([{ name, description: desc, source: "user" }])
    setLoading(false)
    alert("Challenge successfully submitted! It will appear in the challenge list soon.")
    router.push("/challenge")
  }

  return (
    <main className="max-w-lg mx-auto py-10 px-4">
      <Card className="bg-white rounded-lg shadow-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-800">Request New Challenge</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Have a great idea for a drawing challenge? Submit it here!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:border-primary focus:ring-primary"
              placeholder="Challenge name (e.g., Draw an ice cream)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Textarea
              className="border border-gray-300 rounded-md px-4 py-2 w-full min-h-[100px] focus:border-primary focus:ring-primary"
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <Button
              className="w-full bg-primary text-white rounded-md px-4 py-2 text-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
