import { useState, useEffect } from "react"
import axios from "axios"
function Journal() {
    const [topic, setTopic] = useState("")
    const [notes, setNotes] = useState("")
    const [journals, setJournals] = useState([])
    const handleSave = async () => {

        try {

            await axios.post(
                "http://localhost:5000/api/journal/add",
                {
                    topic,
                    notes,
                }
            )

            alert("Journal Saved Successfully")
            fetchJournals()

        } catch (error) {

            console.log(error)

        }

    }
    const fetchJournals = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/journal"
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
        <div className="p-10">

            <h1 className="text-4xl font-bold mb-8">
                Daily Learning Journal ✍️
            </h1>

            <div className="bg-white p-8 rounded-2xl shadow-md">

                <div className="mb-6">

                    <label className="block mb-2 font-semibold">
                        Topic
                    </label>

                    <input
                        type="text"
                        placeholder="Enter topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                </div>

                <div className="mb-6">

                    <label className="block mb-2 font-semibold">
                        Notes
                    </label>

                    <textarea
                        rows="10"
                        placeholder="Write what you learned today..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                </div>

                <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all" onClick={handleSave}>
                    Save Journal
                </button>
                <div className="mt-10">

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

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Journal