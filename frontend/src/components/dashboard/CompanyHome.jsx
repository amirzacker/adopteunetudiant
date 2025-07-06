import axios from "axios";
import React from 'react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  } from '@material-ui/core';
import { Delete , Cancel } from '@material-ui/icons';
import Pourcentage from "./Pourcentage";
import EditIcon from '@material-ui/icons/Edit';
import EditProfilCompany from "./EditProfilCompany";
import EditPassword from "./EditPassword";
export default function CompanyHome({ currentUser }) {
 
  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [openProfil, setOpenProfil] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

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
    }, [currentUser]);

  const token = currentUser?.token;
  

  const handleDeleteCompte = async (e) => {
    try {
        // Submit the form
        await axios.delete("/api/users/" + user?._id, { headers: {"x-access-token" : token} });
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
					{" "} {user?.name}</h4>
				<h5>Profil renseigné à <Pourcentage currentUser={user}/> </h5>
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
         Mise à jour du profil  <EditProfilCompany currentUser={user} token={token} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfil(false)}>
            <Cancel />
            Annulez
          </Button>
          
        </DialogActions>
      </Dialog>
		</div>

		<div className="partition-header-status">
		
            <h5>Supprimer votre compte</h5>            

       <IconButton onClick={() => setOpen(true)}>
        <Delete fontSize="large" color="secondary" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Vous etes sur de bien vouloir supprimer votre compte?</DialogContentText>
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
<br/>
<br/>
	<div className="dash-partition-description">
		<h4>description</h4>
		<h5>{user?.desc}</h5>
	</div>

    </div>
  );
}
