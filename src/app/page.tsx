"use client"

import { useEffect, useState } from "react"
import { Spinner } from "./components/Spinner"
import moment from "moment"
import axios from "axios"

type Dates = {
  start: string
  end: string
}

export default function Home() {
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [refDate, setRefDate] = useState("")
  const [warning, setWarning] = useState("")

  useEffect(() => {
    try {
      setIsFetching(true)

      axios<{ refStart: string }>({
        method: "get",
        url: "http://localhost:5001/dates/last",
      }).then((response) => {
        setIsFetching(false)

        const endDate = response.data.refStart || new Date()
        const normalizedDate = moment(endDate).format("yyyy-MM-DD")
        setRefDate(normalizedDate)
        setStart(normalizedDate)
      })
    } catch (err) {
      setIsFetching(false)
    }
  }, [isSaving])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setWarning("")

    if (!start || !end) return

    if (moment(start).isBefore(moment(refDate))) {
      setWarning("Dates invalides")

      return
    }

    setIsSaving(true)

    await saveEntries({
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    })

    setStart("")
    setEnd("")

    setIsSaving(false)
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Playground
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="start"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              début
            </label>
            <div className="mt-2">
              <input
                id="start"
                name="start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="end"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Fin
              </label>
            </div>
            <div className="mt-2">
              <input
                id="end"
                name="end"
                type="date"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {start && end && (
            <div className="mt-2">
              Durée en jours: {moment(end).diff(moment(start), "day")}
            </div>
          )}

          {warning && <div className="mt-2 bg-red-400">{warning}</div>}

          <div>
            <button
              disabled={isSaving || isFetching || !start || !end}
              type="submit"
              className="flex w-full justify-center items-center rounded-lg bg-[#F7BE38] px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-[#F7BE38]/90 focus:outline-none focus:ring-4 focus:ring-[#F7BE38]/50 disabled:opacity-50 dark:focus:ring-[#F7BE38]/50"
            >
              {isSaving && <Spinner />}
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

async function saveEntries(data: Dates): Promise<void> {
  const url = "http://localhost:5001/dates/add"

  try {
    await postData<Dates>(url, { ...data })
  } catch (err) {
    throw new Error("Something went wrong")
  }
}

async function postData<T>(url = "", data: T) {
  axios.post(url, data)

  const response = await axios.post(url, data)

  return response
}
