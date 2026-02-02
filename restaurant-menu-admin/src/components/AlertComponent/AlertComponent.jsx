import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

export default function SimpleAlert(props) {
  return (
    <Alert variant="outlined" onClose={props.onClose} severity="error">
      {props.message}
    </Alert>
  );
}