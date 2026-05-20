import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

function Heatmap() {

  const values = [
    { date: '2026-05-01', count: 1 },
    { date: '2026-05-02', count: 3 },
    { date: '2026-05-03', count: 2 },
    { date: '2026-05-04', count: 5 },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

      <h2 className="text-2xl font-bold mb-5">
        Study Activity
      </h2>

      <CalendarHeatmap
        startDate={new Date('2026-01-01')}
        endDate={new Date('2026-12-31')}
        values={values}
      />

    </div>
  )
}

export default Heatmap