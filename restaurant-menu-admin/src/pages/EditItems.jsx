import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, Divider, Chip, Stack, Card, CardContent, CardMedia, Box, Typography, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import AuthContext from '../context/AuthContext'
import AlertComponent from '../components/AlertComponent/AlertComponent';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';
import qrcode from 'qrcode';

export default function EditItems() {

  const { restaurantId } = useParams()
  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  const apiEndpoint = 'https://jj2vllmifk.execute-api.us-east-1.amazonaws.com/restaurant-app-crud-functions';

  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [priceErrorMessage, setPriceErrorMessage] = useState('');
  const [titleErrorMessage, setTitleErrorMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const [formData, setFormData] = useState({
		title: '',
		price: '',
	});

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
    const hostedAppURL = "https://ravi-patel.uk"
    const qrCode = qrcode.toDataURL(hostedAppURL + '/' + restaurantId);
    if (showQRCode) {
      document.getElementById('qrCodeContainer').style.display = "none";
    } else {
        qrCode.then((data) => {
          document.getElementById('qrCode').src = data;
          document.getElementById('qrCodeContainer').style.display = "inline";
      })
    }
  }

  const validatePrice = (price) => {
    const priceRegex = /^[0-9]+(\.[0-9]{2})?$/;
    const trimmedStr = price.trim();
    const cleanStr = DOMPurify.sanitize(trimmedStr);
    if (!priceRegex.test(cleanStr)) {
      setPriceErrorMessage('Enter a valid item price');
      return false
    }
    else 
      return cleanStr
  }

  const validateTitle = (title) => {
    const titleRegex = /^[a-zA-Z0-9 ]+$/;
    const trimmedStr = title.trim();
    const cleanStr = DOMPurify.sanitize(trimmedStr);
    if (!titleRegex.test(cleanStr)) {
      setTitleErrorMessage('Enter a valid item name');
      return false
    }
    else 
      return cleanStr
  }

  function clearForm() {
    const itemTitleInput = document.getElementById('itemTitleInput')
    itemTitleInput.value = '';
    const itemPriceInput = document.getElementById('itemPriceInput')
    itemPriceInput.value = '';
    setFormData({
      title: '',
      price: '',
    })
  }

  const deleteItem = async (id) => {
    const idToDelete = apiEndpoint + '/' + id;
    return await axios
			.delete(idToDelete)
			.then((res) => {
        console.log(res);
			})
			.catch((err) => console.log(err));
  }

  const updateItem = async (id, price) => {
    const idToUpdate = apiEndpoint + '/' + id;
    const data = {
      "price": price
    }
    const dataToPatch = JSON.stringify(data);
    return await axios
			.patch(idToUpdate, dataToPatch, {
				headers: {
					'Content-Type': 'application/json',
				},
			})
			.then((res) => {
        console.log(res);
        console.log(rows);
			})
			.catch((err) => console.log(err));
  }

  const getItems = async () => {
		return await axios
			.get(apiEndpoint, { params:  { id: restaurantId } })
			.then((res) => {
				const cleansedData = res.data.flat(Infinity);
				// console.log(cleansedData);
        setRows(cleansedData);
        setLoaded(true);
			})
			.catch((err) => console.log(err));
	};

   const putItems = async (data) => {
    console.log(data);
		return await axios
			.put(apiEndpoint, data, {
				headers: {
					'Content-Type': 'application/json',
				},
			})
			.then((res) => {
				console.log(res);
			})
			.catch((err) => console.log(err));
	};

  const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
    // console.log(formData);
	};

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomID = uuidv4();
    const title = validateTitle(formData.title);
    const price = validatePrice(formData.price);
    if (title && price) {
      const newItem = { "id": randomID, "restaurant-id": restaurantId, "title": title, "price": price };
      putItems(JSON.stringify(newItem));
      setPriceErrorMessage('');
      setTitleErrorMessage('');
      clearForm();
      setRows([...rows, newItem]);
    }
  };

  const onLogout = () => {
    auth.logout(restaurantId)
    navigate(`/admin/${restaurantId}`)
  }

  const deleteItemFunc = (id, e) => {
    const target = e.currentTarget;
    deleteItem(id);
    target.parentNode.parentNode.remove();
  }

  const editModeFunc = (e) => {
    const targetRow = e.currentTarget.parentNode.parentNode;
    const priceToEdit = targetRow.children[1]
    const saveIconToShow = targetRow.children[2].children[1]
    const cancelIconToShow = targetRow.children[3].children[1]
    const editIconToHide = targetRow.children[2].children[0]
    const deleteIconToHide = targetRow.children[3].children[0]

    saveIconToShow.style.display = 'inline';
    editIconToHide.style.display = 'none';
    cancelIconToShow.style.display = 'inline';
    deleteIconToHide.style.display = 'none';

    priceToEdit.contentEditable = true;
    priceToEdit.classList.add('editCellHighlight');
    priceToEdit.focus();
  }

  const viewModeFunc = (id ,e) => {
    const targetRow = e.currentTarget.parentNode.parentNode;
    const priceToEdit = targetRow.children[1]
    const saveIconToHide = targetRow.children[2].children[1]
    const cancelIconToHide = targetRow.children[3].children[1]
    const editIconToShow = targetRow.children[2].children[0]
    const deleteIconToShow = targetRow.children[3].children[0]

    editIconToShow.style.display = 'inline';
    saveIconToHide.style.display = 'none';
    deleteIconToShow.style.display = 'inline';
    cancelIconToHide.style.display = 'none';
    priceToEdit.contentEditable = false;
    priceToEdit.classList.remove('editCellHighlight');
  }

  const saveModeFunc = (id, e) => {
    const targetRow = e.currentTarget.parentNode.parentNode;
    const priceToEdit = targetRow.children[1]
    let priceToUpdate = priceToEdit.textContent.trim()
    priceToUpdate = validatePrice(priceToUpdate)
    if (priceToUpdate) {
      rows.find((row) => row.id === id).price = priceToUpdate
      setRows([...rows])
      updateItem(id, priceToUpdate);
      viewModeFunc(id, e);
      setPriceErrorMessage('');
    }
  }

  const cancelFunc = (id, e) => {
    const targetRow = e.currentTarget.parentNode.parentNode;
    const priceToEdit = targetRow.children[1]
    priceToEdit.textContent = rows.find((row) => row.id === id).price
    viewModeFunc(id, e);
  }

  useEffect(() => {
    getItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loaded === false) {
    return (
      <>
        <h1>Edit Items</h1>
        <span className="loader"></span>
        <p style={{ marginTop: "0.15rem" }}>Loading...</p>
      </>
    )
  } else {
    // console.log(rows);
    return (
      <>
        <Stack spacing={1}>
          {priceErrorMessage && <AlertComponent message={ priceErrorMessage } onClose={() => setPriceErrorMessage('')} severity="error" />}
          {titleErrorMessage && <AlertComponent message={ titleErrorMessage } onClose={() => setTitleErrorMessage('')} severity="error" />}
        </Stack>
        <h1>Edit Items</h1>
        <p>Edit Items for Restaurant: {restaurantId}.</p>
        <div id="qrCodeContainer">
          <Card sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding:'5px'}}>
              <IconButton  sx={{ width: '40px' , height: '40px' }} onClick={toggleQRCode} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', maxWidth:'125px', textAlign: 'left', rowGap:'10px', paddingLeft:'0px' }}>
                <Typography sx={{ fontWeight: 'bold' }} component="div" variant="h5">
                  QR Code
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: 'text.secondary', lineHeight: '1.5' }}
                >
                  Scan to access menu
                </Typography>
              </CardContent>
            </Box>
            <CardMedia
              id="qrCode"
              component="img"
              sx={{ width: 151 }}
              image={null}
              alt="Live from space album cover"
            />
          </Card>
        </div>

        <div className='flex'>
          {showQRCode && <Button variant="contained" onClick={toggleQRCode}>Hide QR Code</Button>}
          {!showQRCode && <Button variant="contained" onClick={toggleQRCode}>Show QR Code</Button>}
          <Button variant="outlined" onClick={onLogout}>Log out</Button>
        </div>
        <div className='card'>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 200 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell >Menu Item</TableCell>
                  <TableCell id="priceCellHeader" sx={{ width: 0 }} align="right">Price</TableCell>
                  <TableCell id="editCellHeader" sx={{ width: 0 }} colSpan={2} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.title}
                    </TableCell>
                    <TableCell align="right" className="priceCell" id={row.id}>{row.price}</TableCell>
                    <TableCell className='actionBtn viewMode' align="center">
                      <EditIcon onClick={(e) => editModeFunc(e)} id="edit" fontSize="small" />
                      <SaveIcon onClick={(e) => saveModeFunc(row.id, e)} id={'save' + row.id} fontSize="small" sx={{display: 'none'}} />
                    </TableCell> 
                    <TableCell className='actionBtn editMode' align="center">
                      <DeleteIcon onClick={(e) => deleteItemFunc(row.id, e)} id="delete" fontSize="small" />
                      <CancelIcon onClick={(e) => cancelFunc(row.id, e)} id={'cancel' + row.id} fontSize="small" sx={{display: 'none'}} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ paddingTop: "30px", paddingBottom: "30px" }}>
            <Chip label="Add new menu item" size="large" />
          </Divider>

          <form
            className="flex"
            onSubmit={handleSubmit}
          >
            <Input
              sx={{ minWidth: "10px", flexGrow: 1 }}
              id="itemTitleInput"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
            />
            
            <Input
              sx={{ width: "70px", flexGrow: 0, flexShrink: 0 }}
              id="itemPriceInput"
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="9.99"
            />
            
            <Button variant="contained" type="submit" sx={{ width: "100px", flexGrow: 0, flexShrink: 0 }}>
              Add Item
            </Button>
          </form>
        </div>
      </>
    )
  }
}
