import axios from "axios";
import React, { useContext } from 'react';
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
import { AuthContext } from "../../context/AuthContext";

export default function CompanyHome({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [openProfil, setOpenProfil] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [stats, setStats] = useState({});
  const { user: authUser } = useContext(AuthContext);


    useEffect(() => {
        const source = axios.CancelToken.source();

        const getUser = async () => {
            try {
                const res = await axios.get("/api/users/" + currentUser?.user?._id, {
                    cancelToken: source.token
                });
                setUserProfile(res.data);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.log(err);
                }
            }
        };

        if (currentUser?.user?._id) {
            getUser();
            fetchStats();
        }

        return () => {
            source.cancel("Component unmounted");
        };
    }, [currentUser]);

  const token = currentUser?.token;
  

  const handleDeleteCompte = async (e) => {
    try {
        // Submit the form
        await axios.delete("/api/users/" + userProfile?._id, { headers: {"x-access-token" : token} });
        // after delete remove  localStorage
        localStorage.removeItem('user');
        //and reload page to deconnecte
        window.location.reload();

    } catch (err) {console.log(err)}

  };

    const fetchStats = async () => {
        try {
            if (!currentUser?.user?.id && !currentUser?.user?._id) {
                return;
            }

            if (!currentUser?.token) {
                return;
            }

            const userId = currentUser.user._id || currentUser.user.id;

            const response = await axios.get(`/api/jobOffers/company/${userId}/stats`, {
                headers: {
                    'x-access-token': currentUser.token
                }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };


  return (
    <div>
    
    <div className="dash-partition-header-student">
			<div className="partition-header-profil">
				<h4>Hello
					{" "} {userProfile?.name}</h4>
				<h5>Profil renseigné à <Pourcentage currentUser={userProfile}/> </h5>
				<h6>
        <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
        <DialogTitle>Update password</DialogTitle>
        <DialogContent>
           <EditPassword currentUser={userProfile} token={token} />
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
         Mise à jour du profil  <EditProfilCompany currentUser={userProfile} token={token} />
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
		<h5>{userProfile?.desc}</h5>
	</div>
        <div className="stats-dashboard-card">
            <h4>Statistiques</h4>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.total || 0}</div>
                    <div className="stat-label">Total des offres</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.published || 0}</div>
                    <div className="stat-label">Offres publiées</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.draft || 0}</div>
                    <div className="stat-label">Brouillons</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalApplications || 0}</div>
                    <div className="stat-label">Candidatures reçues</div>
                </div>
            </div>
        </div>

    </div>
  );
}
