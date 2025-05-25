import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Paper,
    Box
  } from '@mui/material'
  import CloseIcon from '@mui/icons-material/Close'
  import Draggable from 'react-draggable'
  import { useRef } from 'react'
  
  // Custom PaperComponent for draggable functionality
  function PaperComponent(props) {
    const nodeRef = useRef(null)
  
    return (
      <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'} nodeRef={nodeRef}>
        <Paper ref={nodeRef} {...props} />
      </Draggable>
    )
  }
  
  function PatientWindow({ patient, onClose }) {
    if (!patient) return null
  
    return (
      <Dialog
        open={!!patient}
        onClose={onClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {patient.fname} {patient.lname}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
  
        <DialogContent dividers>
          <Box mb={2}>
            <Typography variant="subtitle1"><strong>Date of Birth:</strong> {patient.dob}</Typography>
            <Typography variant="subtitle1"><strong>Phone:</strong> {patient.phone}</Typography>
          </Box>
          <Typography color="text.secondary" fontStyle="italic">
            More details coming soon...
          </Typography>
        </DialogContent>
      </Dialog>
    )
  }
  
  export default PatientWindow
  