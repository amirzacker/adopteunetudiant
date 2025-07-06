import axios from "axios";
import React from 'react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Switch, IconButton, Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  } from '@material-ui/core';
import { Delete , Cancel  } from '@material-ui/icons';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import EditIcon from '@material-ui/icons/Edit';
import Pourcentage from "./Pourcentage";
import EditCvMotivation from "./EditCvMotivation";
import EditProfilStudent from "./EditProfilStudent";
import EditPassword from "./EditPassword";
export default function StudentHome({ currentUser }) {

  const [open, setOpen] = useState(false);
  const [openProfil, setOpenProfil] = useState(false);
  const [openCv, setOpenCv] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const [user, setUser] = useState(null);

  const [status, setStatus] = React.useState(currentUser?.user?.status);



    useEffect(() => {
      const source = axios.CancelToken.source();

      const getUser = async () => {
        try {
          const res = await axios.get("/api/users/" + currentUser?.user?._id, {
            cancelToken: source.token
          });
          setUser(res.data);
        } catch (err) {
          if (!axios.isCancel(err)) {
            console.log(err);
          }
        }
      };

      if (currentUser?.user?._id) {
        getUser();
      }

      return () => {
        source.cancel("Component unmounted");
      };
    }, [currentUser, status]);




  const token = currentUser?.token;
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  

  function convertDate(date) {
    const month = date.toLocaleString('fr', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
  
    return `${day} ${month}  ${year}`;
  }

  const timestampCv = user?.cv;
  const timestampMo = user?.motivationLetter
;

  const startDate = convertDate(new Date(user?.startDate));
  const endDate = convertDate(new Date(user?.endDate));
  


  const DateCv = convertDate(new Date(parseInt(timestampCv)));
  const DateMo = convertDate(new Date(parseInt(timestampMo)));


  const handleChange = async (event) => {
    try {
      const data = {
        id: user?._id,
        status: event.target.checked
      }
      const res = await axios.put("/api/users/" + user?._id, data, { headers: {"x-access-token" : token} });
      setStatus( event.target.checked );

    const storedObject = JSON.parse(localStorage.getItem('user'));
    // Update the object
    storedObject.user = res.data;

    // Save the updated object back to localStorage
    localStorage.setItem('user', JSON.stringify(storedObject));
    window.location.reload();
    } catch (err) {console.log(err)}

   
  };

  const handleDeleteCompte = async (e) => {
    try {
        // Submit the form
        await axios.delete("/api/users/" + user?._id,  { headers: {"x-access-token" : token} });
        // after delete remove  localStorage
        localStorage.removeItem('user');
        //and reload page to deconnecte
        window.location.reload();
 
    } catch (err) {console.log(err)}
   
  };



  return (
    <div>
    
    <div className="dash-partition-header-student">
			<div className="partition-header-profil">
				<h4>Hello 
					{" "} {user?.firstname}</h4>
				<h5>Profil renseigné à <Pourcentage currentUser={user}/>  </h5>
        
				<h6>
      <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
        <DialogTitle>Update password</DialogTitle>
        <DialogContent>
          <EditPassword currentUser={user} token={token} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>
            <Cancel />
            Annulez
          </Button>
        </DialogActions>
        </Dialog>
					<Link onClick={() => setOpenPassword(true)} to="#">Modifier mon mot de passe</Link>
			   </h6>
			<h6>
				<Link onClick={() => setOpenProfil(true)} to="#">Modifier mon profil</Link>
			</h6>
      
      <IconButton onClick={() => setOpenProfil(true)}>
       <EditIcon fontSize="large" color="secondary"/>
      </IconButton>
      <Dialog open={openProfil} onClose={() => setOpenProfil(false)}>
        <DialogTitle>Update profil</DialogTitle>
        <DialogContent>
         Mise à jour du profil  <EditProfilStudent currentUser={user} token={token} />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfil(false)}>
            <Cancel />
            Annulez
          </Button>
        </DialogActions>
      </Dialog>
		</div>
		<div className="partition-header-date">
			<h4>Type de recherche :
      {" "} {user?.searchType?.name}
			</h4>
			<h5>Du
      {" "} {startDate ?  startDate : "" } {" "}
				au
        {" "} {endDate ? endDate : ""  }
      </h5>
		</div>
		<div className="partition-header-status">
		
            <h4>Votre status</h4>
            <Switch color="primary" checked={status} onChange={handleChange} />
            <h5>Supprimer votre compte</h5>            

       <IconButton onClick={() => setOpen(true)}>
        <Delete fontSize="large" color="secondary" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Vous etes sur de bien vouloir supprimer votre compte?  </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            <Cancel />
            Annulez
          </Button>
          <Button onClick={handleDeleteCompte}>
            <Delete />
            Confirmez
          </Button>
        </DialogActions>
      </Dialog>
		</div>
	</div>
	<div className="dash-partition-cv-lm">
		<div className="partition-cv">
			<h4>Mon CV</h4>
			<h5>Mise à jour le {" "} {DateCv ? DateCv:  ""}</h5>
		
			<h6>

      <IconButton onClick={() => setOpenCv(true)}>
      <AttachFileIcon fontSize="large" color="secondary"/>
      </IconButton>
      <Dialog open={openCv} onClose={() => setOpenCv(false)}>
        <DialogTitle>Update Cv et Motivation</DialogTitle>
        <DialogContent>
          <DialogContentText>  <EditCvMotivation currentUser={user} token={token} /> </DialogContentText>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCv(false)}>
            <Cancel />
            Annulez
          </Button>
        </DialogActions>
      </Dialog>
      <a href={`${PF + user?.cv}`} target="_blank" rel="noreferrer" >Voir</a>
			</h6>
		</div>
   
		<div className="partition-lm">
			<h4>Lettre Mot.</h4>
			<h5>Mise à jour le {" "} {DateMo ? DateMo : "" }</h5>
			<h6>
      <IconButton onClick={() => setOpenCv(true)}>
      <AttachFileIcon fontSize="large" color="secondary"/>
      </IconButton>
      <a href={`${PF + user?.motivationLetter}`} target="_blank" rel="noreferrer" >Voir</a>
			</h6>
		</div>
	</div>
	<div className="dash-partition-description">
		<h4>description</h4>
		<h5>{user?.desc}</h5>
	</div>

    </div>
  );
}
