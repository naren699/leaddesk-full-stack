import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

const STATUS_STYLES = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Closed: 'bg-green-100 text-green-700',
}

export default function Admin() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API}/api/leads`, { withCredentials: true })
      setLeads(res.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/api/leads/${id}`, { status }, { withCredentials: true })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true })
    } finally {
      navigate('/login')
    }
  }

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900">LeadDesk Admin</h1>
          <p className="text-xs text-gray-400">{leads.length} total leads</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading leads...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-16">
            {search ? 'No leads match your search.' : 'No leads yet.'}
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Budget', 'Message', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.budget}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{lead.message}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer border-0 focus:outline-none ${STATUS_STYLES[lead.status]}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="text-center py-4 border-t border-gray-200">
        <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-gray-600">
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  )
}