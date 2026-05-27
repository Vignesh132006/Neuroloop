import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import axios from "axios"

function Journal({ setIsLoggedIn }) {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleLogout = () => {

  localStorage.removeItem("token")

  navigate("/login")

}

  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [journals, setJournals] = useState([])
  const [summary, setSummary] = useState("")
  const [quiz, setQuiz] = useState([])
  const [editId, setEditId] = useState(null)

  // SAVE OR UPDATE JOURNAL
  const handleSave = async () => {

    if (!topic || !notes) {
      alert("Please fill all fields")
      return
    }

    try {

      if (editId) {

        await axios.put(
          `http://localhost:5000/api/journal/${editId}`,
          {
            topic,
            notes,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )

        alert("Journal Updated Successfully")

        setEditId(null)

      } else {

        await axios.post(
          "http://localhost:5000/api/journal/add",
          {
            topic,
            notes,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )

        alert("Journal Saved Successfully")

      }

      setTopic("")
      setNotes("")
      setSummary("")
      setQuiz([])

      fetchJournals()

    } catch (error) {

      console.log(error)

      alert("Operation Failed")

    }

  }

  // DELETE JOURNAL
  const handleDelete = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/journal/${id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      )

      fetchJournals()

    } catch (error) {

      console.log(error)

    }

  }

  // EDIT JOURNAL
  const handleEdit = (journal) => {

    setTopic(journal.topic)
    setNotes(journal.notes)

    setEditId(journal._id)

  }

  // AI SUMMARY
  const generateSummary = async () => {

    if (!notes) {
      alert("Please write notes first")
      return
    }

    try {

      const response = await axios.post(
        "http://localhost:5000/api/ai/summary",
        {
          notes,
        }
      )

      setSummary(response.data.summary)

    } catch (error) {

      console.log(error)

      // FALLBACK SUMMARY
      const shortSummary =
        notes.split(" ").slice(0, 20).join(" ") + "..."

      setSummary(shortSummary)

      alert("AI quota exceeded — using local summary")

    }

  }

  // AI QUIZ
  const generateQuiz = () => {

    if (!notes) {
      alert("Please write notes first")
      return
    }

    const sampleQuiz = [

      "What is the main topic discussed?",

      "Explain one important concept from your notes.",

      "Why is this topic important?",

    ]

    setQuiz(sampleQuiz)

  }

  // FETCH JOURNALS
  const fetchJournals = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/journal",
        {
          headers: {
            Authorization: token,
          },
        }
      )

      setJournals(response.data)

    } catch (error) {

      console.log(error)

    }

  }

  useEffect(() => {

    fetchJournals()

  }, [])

  return (
      <div className="flex min-h-screen bg-gray-100">

      {/* HEADER */}
      <Sidebar />
      <div className="flex-1 p-10">

        <h1 className="text-4xl font-bold">
          Daily Learning Journal ✍️
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-3 rounded-xl hover:bg-red-600"
        >
          Logout
        </button>

      </div>

      {/* MAIN CARD */}

      <div className="bg-white p-8 rounded-2xl shadow-md">

        {/* TOPIC */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Topic
          </label>

          <input
            type="text"
            placeholder="Enter topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none"
          />

        </div>

        {/* NOTES */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold">
            Notes
          </label>

          <textarea
            rows="10"
            placeholder="Write what you learned today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none resize-none"
          />

        </div>

        {/* BUTTONS */}

        <div className="flex flex-wrap gap-4">

          <button
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all"
            onClick={handleSave}
          >
            {editId ? "Update Journal" : "Save Journal"}
          </button>

          <button
            onClick={generateSummary}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Generate Summary
          </button>

          <button
            onClick={generateQuiz}
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Generate Quiz
          </button>

        </div>

        {/* AI SUMMARY */}

        {summary && (

          <div className="bg-purple-100 p-5 rounded-xl mt-8 mb-8">

            <h2 className="text-2xl font-bold mb-3">
              AI Summary 🤖
            </h2>

            <p className="text-gray-700">
              {summary}
            </p>

          </div>

        )}

        {/* AI QUIZ */}

        {quiz.length > 0 && (

          <div className="bg-green-100 p-5 rounded-xl mt-8 mb-8">

            <h2 className="text-2xl font-bold mb-4">
              AI Quiz 🧠
            </h2>

            <div className="space-y-3">

              {quiz.map((question, index) => (

                <div
                  key={index}
                  className="bg-white p-4 rounded-lg"
                >

                  <p className="font-medium">
                    {index + 1}. {question}
                  </p>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* SAVED JOURNALS */}

        <h2 className="text-2xl font-bold mb-5">
          Saved Journals
        </h2>

        <div className="space-y-5">

          {journals.map((journal) => (

            <div
              key={journal._id}
              className="bg-gray-100 p-5 rounded-xl"
            >

              <h3 className="text-xl font-semibold">
                {journal.topic}
              </h3>

              <p className="mt-2 text-gray-700">
                {journal.notes}
              </p>

              <div className="mt-4 flex gap-4">

                <button
                  onClick={() => handleEdit(journal)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(journal._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}

export default Journal  