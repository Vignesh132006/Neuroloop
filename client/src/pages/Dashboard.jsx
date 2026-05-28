import { useEffect, useState } from "react"
import axios from "axios"

import Sidebar from "../components/Sidebar"
import Heatmap from "../components/Heatmap"
import RevisionPanel from "../components/RevisionPanel"
import ProgressChart from "../components/ProgressChart"
import Navbar from "../components/Navbar"

function Dashboard() {

  const token = localStorage.getItem("token")

  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  useEffect(() => {

    fetchJournals()

  }, [token])

  // FETCH JOURNALS
  const fetchJournals = async () => {

    try {

      setLoading(true)

      const response = await axios.get(
        "http://localhost:5000/api/journal",
        {
          headers: {
            Authorization: token,
          },
        }
      )

      setJournals(response.data)

      setStreak(
        calculateStreak(response.data)
      )

      setLoading(false)

    } catch (error) {

      console.log(error)

      setLoading(false)

    }

  }

  // CALCULATE STREAK
  const calculateStreak = (journals) => {

    if (journals.length === 0) {
      return 0
    }

    const dates = journals.map((journal) => {

      return new Date(journal.createdAt)
        .toDateString()

    })

    const uniqueDates = [...new Set(dates)]

    return uniqueDates.length

  }

  // LOADING SCREEN
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <h1 className="text-3xl font-bold">
          Loading Dashboard...
        </h1>

      </div>

    )

  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <div className="flex-1 p-10">

        {/* NAVBAR */}

        <Navbar />

        {/* TITLE */}

        <h1 className="text-4xl font-bold mb-8">
          Welcome Back 👋
        </h1>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* TOTAL JOURNALS */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-gray-500 text-lg">
              Total Journals
            </h2>

            <p className="text-4xl font-bold mt-3 text-purple-600">
              {journals.length}
            </p>

          </div>

          {/* STREAK */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-gray-500 text-lg">
              Study Streak
            </h2>

            <p className="text-4xl font-bold mt-3 text-orange-500">
              {streak} Days 🔥
            </p>

          </div>

          {/* TOPICS */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-gray-500 text-lg">
              Topics Learned
            </h2>

            <p className="text-4xl font-bold mt-3 text-blue-500">
              {journals.length}
            </p>

          </div>

          {/* PRODUCTIVITY */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-gray-500 text-lg">
              Productivity
            </h2>

            <p className="text-4xl font-bold mt-3 text-green-500">
              92%
            </p>

          </div>

        </div>

        {/* HEATMAP */}

        <div className="mb-10">

          <Heatmap />

        </div>

        {/* REVISION PANEL */}

        <div className="mb-10">

          <RevisionPanel />

        </div>

        {/* PROGRESS CHART */}

        <div className="mb-10">

          <ProgressChart />

        </div>

      </div>

    </div>

  )

}

export default Dashboard