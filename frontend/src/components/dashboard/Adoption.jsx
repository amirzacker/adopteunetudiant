import axios from "axios";
import { useEffect, useState } from "react";
import AdoptionUnit from "./AdoptionUnit";
import { Pagination } from '@material-ui/lab';
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";




export default function Adoption({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);

  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");
  

  useEffect(() => {
    const getAdoptions = async () => {
      try {
        const res = await axios.get("/api/users/adoptions" , { headers: {"x-access-token" : currentUser.token} });
        if (currentUser?.user?.isCompany) {
            setAdoption(res.data.adoptions);
          } else if (currentUser?.user?.isStudent) {
            setAdoption(res.data.adopted);
          }
      } catch (err) {
        console.log(err);
      }
    };
    getAdoptions();
  }, [currentUser,adoptions]);



  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3 ;
  const pages = Math.ceil(adoptions.length / itemsPerPage);
  const paginatedData = adoptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };



  const handleClickUnadopte =  useCallback(userId => {
    setAdoption(adoptions.filter(user => user.id !== userId))
    setMessage(" étudiant supprimé avec succes"); 
    setSuccess(true);
  }, [adoptions])



  return (
    <div>
      <div className="dash-partition-cv-lm">
        <div className="partition-lm">
          <h4>Nombre d'apdotion : </h4>
          <h5>{adoptions.length}</h5>
        </div>
      </div>

      <div className="div-adopted-button">
        <p className="adopted-button">
          {currentUser?.user?.isCompany
            ? "Vous adoptés : "
            : "Vous etes adoptés par : "}
        </p>
      </div>
                {
                  success ? <FlashMessage message={message} color={true} /> : ""
                }
      <div className="row rowcards">
            {paginatedData.length  ? (
              paginatedData.map((user, i) => (
                <AdoptionUnit key={i} user={user} currentUser={currentUser} handleClickUnadopte={handleClickUnadopte}/>
              ))
            ) : (
              <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                  <span className="visually">Pas d'adoption encours...</span>
              </div>
            )}
      </div>
      <div className="d-flex justify-content-center align-items-center">
      <Pagination count={pages} page={currentPage} onChange={handleChange} />
      </div>

     

    </div>
  );
}
