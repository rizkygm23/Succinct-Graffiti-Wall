"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { Card, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ThumbsUp } from "lucide-react"

function useUsername() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("username") || ""
}

export default function GalleryPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [challengeId, setChallengeId] = useState<number | undefined>()
  const [data, setData] = useState<any[]>([])
  const [likes, setLikes] = useState<Record<number, number>>({})
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({})
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [replyParentId, setReplyParentId] = useState<number | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null)
  const username = typeof window !== "undefined" ? localStorage.getItem("username") || "" : ""

  // Fetch challenges
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from("challenges").select("*")
      setChallenges(data || [])
      if (data && data.length > 0) setChallengeId(data[0].id)
    })()
  }, [])

  // Fetch submissions for selected challenge
  useEffect(() => {
    if (!challengeId) return
    ;(async () => {
      const { data } = await supabase
        .from("submissions")
        .select("*, challenge:challenges(*)")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false })
      setData(data || [])
    })()
  }, [challengeId])

  // Fetch likes
  useEffect(() => {
    if (data.length === 0) return
    ;(async () => {
      const submissionIds = data.map((d) => d.id)
      const { data: likeRows } = await supabase.from("likes").select("submission_id, username")
      const likesMap: Record<number, number> = {}
      const userLikeMap: Record<number, boolean> = {}
      likeRows?.forEach((like) => {
        likesMap[like.submission_id] = (likesMap[like.submission_id] || 0) + 1
        if (like.username === username) userLikeMap[like.submission_id] = true
      })
      setLikes(likesMap)
      setUserLikes(userLikeMap)
    })()
  }, [data, username])

  // Like handler
  async function handleLike(submission_id: number) {
    if (!username) {
      alert("Please log in first!")
      return
    }
    if (userLikes[submission_id]) return
    await supabase.from("likes").insert([{ username, submission_id }])
    setLikes((prev) => ({ ...prev, [submission_id]: (prev[submission_id] || 0) + 1 }))
    setUserLikes((prev) => ({ ...prev, [submission_id]: true }))
  }

  // Comments handler
  async function loadComments(submissionId: number) {
    setSelectedSubmission(submissionId)
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true })
    setComments(data || [])
  }

  async function handleComment(submission_id: number, parent_id: number | null = null) {
    if (!username) return
    if (!commentText.trim()) return
    await supabase.from("comments").insert([{ username, submission_id, comment: commentText, parent_id }])
    setCommentText("")
    loadComments(submission_id)
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-6000"></div>

      <div className="relative z-10 max-w-7xl mx-auto py-10 px-4">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8 animate-slideInFromLeft">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">🖼️ Artist Gallery</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing artwork from our creative community. Get inspired and share your own masterpieces!
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fadeIn">
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-xl font-bold text-gray-900">{Object.values(likes).reduce((a, b) => a + b, 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Artists</p>
                <p className="text-xl font-bold text-gray-900">{new Set(data.map((d) => d.username)).size}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-xl font-bold text-gray-900">{data.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Challenges</p>
                <p className="text-xl font-bold text-gray-900">{challenges.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Filter Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 mb-8 animate-slideInFromRight">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Challenge</h3>
            <div className="flex flex-wrap gap-2">
              {challenges.map((ch) => (
                <Button
                  key={ch.id}
                  variant={challengeId === ch.id ? "default" : "outline"}
                  className={
                    challengeId === ch.id
                      ? "bg-primary text-white hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  }
                  onClick={() => setChallengeId(ch.id)}
                >
                  {ch.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        {data.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-primary/20 text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-4">Be the first to submit your artwork for this challenge!</p>
              <Button
                onClick={() => (window.location.href = "/challenge")}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Start Creating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.map((row, index) => (
              <Card
                key={row.id}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 flex flex-col border border-primary/30 relative overflow-hidden animate-fadeIn hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header Kartu: Avatar, Username, Follow Button */}
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://unavatar.io/twitter/${row.username}`}
                      className="rounded-full w-10 h-10 border-2 border-primary transition-all duration-300 hover:scale-105"
                      alt="User Avatar"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-800">@{row.username}</span>
                      <CardDescription className="text-xs text-primary">{row.challenge?.name}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 text-primary border-primary hover:bg-primary/10 transition-all duration-200 bg-transparent transform hover:scale-105 active:scale-95"
                    onClick={() => window.open(`https://twitter.com/${row.username}`, "_blank")}
                  >
                    Follow
                  </Button>
                </div>

                {/* Area Gambar */}
                <div className="relative group mb-4">
                  <img
                    src={row.image_url || "/placeholder.svg"}
                    alt="Submission Result"
                    className="w-full h-48 border border-gray-300 rounded-md object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-md"></div>
                </div>

                {/* Footer Kartu: Like, Comments, Share */}
                <div className="flex flex-col w-full gap-2 mt-auto">
                  <div className="flex gap-2 items-center">
                    <Button
                      variant={userLikes[row.id] ? "default" : "outline"}
                      size="sm"
                      className={
                        userLikes[row.id]
                          ? "bg-primary text-white transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1 text-xs"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1 text-xs"
                      }
                      onClick={() => handleLike(row.id)}
                      disabled={userLikes[row.id]}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" /> {likes[row.id] || 0}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-100 bg-transparent transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1 text-xs"
                      onClick={() => loadComments(row.id)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Chat
                    </Button>
                  </div>
                  {/* Share to X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `Join the "${row.challenge?.name}" challenge on Succinct Drawing! 🎨\n\n${row.image_url}\n\n#DigitalGraffiti #SuccinctDrawing`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 text-xs transform hover:scale-105 active:scale-95 w-full"
                    aria-label="Share to X"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    Share to X
                  </a>
                </div>

                {/* Comments Modal */}
                {selectedSubmission === row.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 z-10 transition-all duration-300 fade-enter fade-enter-active overflow-y-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-sm text-gray-800">Comments</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 bg-transparent"
                        onClick={() => setSelectedSubmission(null)}
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="space-y-2 mb-3 max-h-32 overflow-y-auto text-xs">
                      {comments
                        .filter((c) => !c.parent_id)
                        .map((c) => (
                          <div key={c.id} className="border-b border-gray-100 pb-1 last:border-b-0">
                            <span className="font-bold text-primary">@{c.username}:</span>{" "}
                            <span className="text-gray-700">{c.comment}</span>
                            {/* Reply */}
                            <div className="pl-3 mt-1 space-y-1">
                              {comments
                                .filter((r) => r.parent_id === c.id)
                                .map((r) => (
                                  <div key={r.id} className="text-xs text-gray-600">
                                    <span className="font-bold">@{r.username}:</span> {r.comment}
                                  </div>
                                ))}
                              <Button
                                variant="link"
                                className="text-xs text-blue-500 h-auto p-0"
                                onClick={() => setReplyParentId(c.id)}
                              >
                                Reply
                              </Button>
                              {replyParentId === c.id && (
                                <div className="flex gap-1 mt-1">
                                  <Input
                                    type="text"
                                    className="text-xs h-6 flex-1"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Reply..."
                                  />
                                  <Button
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={() => {
                                      handleComment(row.id, c.id)
                                      setReplyParentId(null)
                                    }}
                                  >
                                    Send
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                    {/* Add new comment */}
                    <div className="flex gap-1">
                      <Input
                        type="text"
                        className="text-xs h-8 flex-1"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                      />
                      <Button size="sm" className="text-xs h-8 px-3" onClick={() => handleComment(row.id, null)}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action Section */}
        <div className="text-center space-y-6 animate-fadeIn">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Join the Community?</h3>
              <p className="text-gray-600 mb-6">
                Share your creativity with thousands of artists worldwide. Take on challenges, get inspired, and
                showcase your talent!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => (window.location.href = "/challenge")}
                  className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Start Creating
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/request-challenge")}
                  className="border-primary text-primary hover:bg-primary/10 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Request New Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
