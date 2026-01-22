import { useContext, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, OutlinedInput, Stack, Card } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AuthContext from '../context/AuthContext'
import AlertComponent from '../components/AlertComponent/AlertComponent'
import axios from 'axios'
import DOMPurify from 'dompurify'

export default function RestaurantLogin() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const validateInput = (str) => {
    if (str.length < 0 ) {
      setError("Email or Password can't be blank");
      return false
    } else {
      const formattedStr = str.trim();
      const cleanStr = DOMPurify.sanitize(formattedStr);
      return cleanStr
    }
  }

  const handleCopy = (e, id) => {
    const text = document.getElementById(id).innerText;
    console.log(text);
    navigator.clipboard.writeText(text);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanedEmail = validateInput(email)
    const cleanedPassword = validateInput(password)

    setError('')
    if (!cleanedEmail || !cleanedPassword) {
      setError('Please enter email and password')
      return
    } else {
      await axios.post("https://c1l4fh31i9.execute-api.us-east-1.amazonaws.com/login", {
        cleanedEmail,
        cleanedPassword,
        restaurantId
      },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => {
        console.log(response)
        if (response.status !== 227) {
          setError(response.data.message)
        } else {
          auth.login(restaurantId)
          navigate(`/admin/${restaurantId}/edit-items`, { replace: true })
          setError('')
        }
      }).catch((error) => {
        console.log(error)
        setError(error.response.data.message)
      })
    }
  }

  return (
    <>
      <Stack spacing={1}>
        {error && <AlertComponent message={ error } onClose={() => setError('')} severity="error" />}
      </Stack>
      <h1>Restaurant App Admin</h1>
      <h2>Restaurant: {restaurantId}</h2>
      <form onSubmit={handleSubmit}>
        <div className="card-login">
          <OutlinedInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <OutlinedInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained">Login</Button>
        </div>
      </form>
      <p className="fine-print">
        Not your restaurant? <Link to="/">Change restaurant</Link>
      </p>

      {restaurantId === '123' && 
        <Card style={{ display: 'flex', flexDirection: 'column', placeItems: 'center' }}>
          <p className="fine-print">Test credentials for restaurant 123:</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="fine-print" >Email: <span id="emailCredential">patel.ravi.2795@gmail.com</span></p><ContentCopyIcon style={{ fontSize: '20px', verticalAlign: 'middle', marginLeft: '15px', cursor: 'pointer' }} onClick={(e) => handleCopy(e, 'emailCredential')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="fine-print" >Password: <span id="passwordCredential">Testing123!</span></p><ContentCopyIcon style={{ fontSize: '20px', verticalAlign: 'middle', marginLeft: '15px', cursor: 'pointer' }} onClick={(e) => handleCopy(e, 'passwordCredential')} />
          </div>
        </Card>
      }
      {restaurantId === '456' && 
        <Card style={{ display: 'flex', flexDirection: 'column', placeItems: 'center' }}>
          <p className="fine-print">Test credentials for restaurant 456:</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="fine-print" >Email: <span id="emailCredential">ravi_2795@hotmail.com</span></p><ContentCopyIcon style={{ fontSize: '20px', verticalAlign: 'middle', marginLeft: '15px', cursor: 'pointer' }} onClick={(e) => handleCopy(e, 'emailCredential')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="fine-print" >Password: <span id="passwordCredential">Testing456!</span></p><ContentCopyIcon style={{ fontSize: '20px', verticalAlign: 'middle', marginLeft: '15px', cursor: 'pointer' }} onClick={(e) => handleCopy(e, 'passwordCredential')} />
          </div>
        </Card>
      }
    </>
  )
}
