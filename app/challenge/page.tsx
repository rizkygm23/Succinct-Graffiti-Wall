"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import GraffitiCanvas from "@/components/GraffintiCanvas"
import axios from "axios"
import { supabase } from "../../lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Users, Trophy, Sparkles } from "lucide-react"
import type { ReactSketchCanvasRef } from "react-sketch-canvas"

const EMPTY_CANVAS_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

export default function ChallengePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [challenges, setChallenges] = useState<any[]>([])
  const [challenge, setChallenge] = useState<any>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const graffitiCanvasRef = useRef<ReactSketchCanvasRef>(null)

  // NEW: State for active artists
  const [activeArtists, setActiveArtists] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("username")
    if (!saved) {
      router.replace("/")
      return
    }
    setUsername(saved)
    ;(async () => {
      const { data } = await supabase.from("challenges").select("*")
      if (data && data.length > 0) {
        const picked = data[Math.floor(Math.random() * data.length)]
        setChallenges(data)
        setChallenge(picked)
        const { data: exists } = await supabase
          .from("submissions")
          .select("id")
          .eq("username", saved)
          .eq("challenge_id", picked.id)
          .single()
        if (exists) setAlreadySubmitted(true)
      }
      // --- ACTIVE ARTISTS ---
      // Cara cepat: pakai count head:true (lebih efisien di Supabase)
      const { count } = await supabase
        .from("submissions")
        .select("username", { count: "exact", head: true })
        .neq("username", null)
      setActiveArtists(count ?? 0)
      // -- kalau ingin hasil lebih presisi (user unik, fallback kalau db tidak support count head):
      // const { data: uniqueUsers } = await supabase.from("submissions").select("username").neq("username", null);
      // const uniqueCount = uniqueUsers ? Array.from(new Set(uniqueUsers.map((u) => u.username))).length : 0;
      // setActiveArtists(uniqueCount);
    })()
  }, [router])

  async function handleSubmit() {
    if (!challenge?.id) return

    // Dapatkan data gambar terbaru langsung dari ref kanvas saat tombol submit ditekan
    const currentDrawingBase64 = (await graffitiCanvasRef.current?.exportImage("png")) || EMPTY_CANVAS_BASE64

    if (currentDrawingBase64 === EMPTY_CANVAS_BASE64) {
      alert("Please draw something before submitting!")
      return
    }

    setIsSubmitting(true)

    const { data: exists } = await supabase
      .from("submissions")
      .select("id")
      .eq("username", username)
      .eq("challenge_id", challenge.id)
      .single()

    if (exists) {
      alert("You have already submitted for this challenge!")
      setAlreadySubmitted(true)
      setIsSubmitting(false)
      return
    }

    let imageUrl = ""

    try {
      const formData = new FormData()
      formData.append("file", currentDrawingBase64)
      formData.append("upload_preset", "img_data")

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dtjnzbvlg/image/upload",
        formData,
      )
      imageUrl = cloudinaryRes.data.secure_url
    } catch (error) {
      alert("Failed to upload image. Please try again. Check console for details.")
      setIsSubmitting(false)
      return
    }

    if (!imageUrl) {
      alert("Image URL not received from Cloudinary. Please try again.")
      setIsSubmitting(false)
      return
    }

    await supabase.from("submissions").insert([
      {
        username,
        challenge_id: challenge.id,
        image_url: imageUrl,
      },
    ])

    router.push("/gallery")
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-6000"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-8 px-4 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-slideInFromLeft">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">🎨 Creative Challenge</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Express your creativity and join thousands of artists in our daily drawing challenges!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Challenges</p>
                <p className="text-xl font-bold text-gray-900">{challenges.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Artists</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeArtists !== null ? activeArtists : <span className="text-gray-400">...</span>}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-xl font-bold text-gray-900">Rising Star</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20 animate-slideInFromRight">
          <div className="flex items-center gap-3">
            <img
              src={`https://unavatar.io/twitter/${username}`}
              className="rounded-full w-12 h-12 border-2 border-primary transition-all duration-300 hover:scale-105"
              alt="User Avatar"
            />
            <div>
              <span className="font-bold text-xl text-gray-800">@{username}</span>
              <p className="text-sm text-gray-600">Ready to create something amazing?</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/gallery")}
            className="border-primary text-primary hover:bg-primary/10"
          >
            View Gallery
          </Button>
        </div>

        {/* Challenge Card */}
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-primary/30 shadow-lg animate-slideInFromLeft">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl font-bold text-primary">Today's Challenge</CardTitle>
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {challenge?.name || "Loading challenge..."}
            </CardTitle>
            <CardDescription className="text-gray-700 text-base">
              {challenge?.description || "Challenge description will appear here."}
            </CardDescription>
          </CardHeader>
        </Card>

        {alreadySubmitted ? (
          <Card className="text-center bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 shadow-lg animate-fadeIn">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="font-semibold mb-2 text-lg text-yellow-800">
                Congratulations! You've completed this challenge!
              </p>
              <p className="text-yellow-700 mb-4">Check out what other amazing artists have created in the gallery.</p>
              <Button onClick={() => router.push("/gallery")} className="bg-yellow-600 text-white hover:bg-yellow-700">
                View Gallery
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Canvas Section */}
            <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold text-gray-800">Your Canvas</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Let your creativity flow! Draw your interpretation of the challenge.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-fit">
                <div className="border-2 border-primary/30 rounded-lg bg-white shadow-inner transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full max-w-[400px] md:h-[400px] mx-auto">
                  <GraffitiCanvas ref={graffitiCanvasRef} onDrawEnd={() => {}} />

                </div>
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="flex gap-4 animate-slideInFromRight">
              <Button
                className="flex-1 bg-primary text-white hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95 py-3 text-lg font-semibold"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Artwork"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
