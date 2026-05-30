import { useEffect, useState } from "react"
import axios from "axios"

function RevisionPanel() {

  const token = localStorage.getItem("token")

  const [revisions, setRevisions] = useState([])

  useEffect(() => {

    fetchRevisions()

  }, [])

  const fetchRevisions = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/revision",
        {
          headers: {
            Authorization: token,
          },
        }
      )

      setRevisions(response.data)

    } catch (error) {

      console.log(error)

    }

  }

  const markRevised = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/revision/${id}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      )

      fetchRevisions()

    } catch (error) {

      console.log(error)

    }

  }

  return (

    <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

      <h2 className="text-2xl font-bold mb-5">
        Topics To Revise Today 📚
      </h2>

      {revisions.length === 0 ? (

        <p className="text-gray-500">
          No topics need revision 🎉
        </p>

      ) : (

        <div className="space-y-4">

          {revisions.map((journal) => (

            <div
              key={journal._id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-xl"
            >

              <div>

                <h3 className="font-semibold">
                  {journal.topic}
                </h3>

                <p className="text-sm text-gray-600">
                  Revisions: {journal.revisionCount}
                </p>

              </div>

              <button
                onClick={() => markRevised(journal._id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Mark Revised
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}

export default RevisionPanel