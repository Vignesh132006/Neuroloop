function RevisionPanel() {

  const revisions = [
    {
      topic: "Binary Trees",
      priority: "High",
    },
    {
      topic: "DBMS",
      priority: "Medium",
    },
    {
      topic: "OS Scheduling",
      priority: "Low",
    },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Smart Revision
      </h2>

      <div className="space-y-4">

        {revisions.map((item, index) => (

          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 p-4 rounded-xl"
          >

            <div>
              <h3 className="font-semibold text-lg">
                {item.topic}
              </h3>
            </div>

            <div>

              {item.priority === "High" && (
                <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-sm font-semibold">
                  High
                </span>
              )}

              {item.priority === "Medium" && (
                <span className="bg-yellow-100 text-yellow-600 px-4 py-1 rounded-full text-sm font-semibold">
                  Medium
                </span>
              )}

              {item.priority === "Low" && (
                <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold">
                  Low
                </span>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

export default RevisionPanel