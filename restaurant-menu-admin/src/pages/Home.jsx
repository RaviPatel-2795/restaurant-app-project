import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, OutlinedInput } from '@mui/material'

export default function Home() {
  const [id, setId] = useState('')
  const navigate = useNavigate()

  const go = (e) => {
    e.preventDefault()
    if (!id) return
    navigate(`/admin/${id}`)
  }

  return (
    <>
      <h1>Restaurant App Admin</h1>
      <form onSubmit={go}>
        <div className="card-login">
          <OutlinedInput
            placeholder="Enter restaurant ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <Button type="submit" variant="contained">Go</Button>
        </div>
      </form>
      <p className="fine-print">Or open a URL like /admin/your-restaurant-id</p>
      <p>(Hint: Only 2 restaurants exist: 123 or 456)</p>
    </>
  )
}
