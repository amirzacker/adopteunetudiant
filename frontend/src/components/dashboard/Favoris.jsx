import axios from "axios";
import { useEffect, useState } from "react";
import FavorisUnit from "./FavorisUnit";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import "./favoris.css";

export default function Favoris({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);

  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
      if (!currentUser?.user?._id || !currentUser?.token) return;
      const getAdoptions = async () => {
      try {
        const res = await axios.get(
          `/api/users/favoris/${currentUser?.user?._id}`,
          { headers: { "x-access-token": currentUser.token } }
        );
        setAdoption(res.data.favoris);
      } catch (err) {
        console.log(err);
      }
    };
    getAdoptions();
  }, [currentUser?.user?._id, currentUser?.token]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(adoptions.length / itemsPerPage);
  const paginatedData = adoptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleClickUnadopte = useCallback(
    (userId) => {
      setAdoption(adoptions.filter((user) => user.id !== userId));
      setMessage(" étudiant supprimé avec succes");
      setSuccess(true);
      console.log(userId);
    },
    [adoptions]
  );

  return (
    <div className="favoris">
      <h3>Mes Favoris</h3>
      {success ? <FlashMessage message={message} color={true} /> : ""}
      <div className="row rowcards">
        {paginatedData.length ? (
          paginatedData.map((user, i) => (
            <FavorisUnit
              key={i}
              user={user}
              currentUser={currentUser}
              handleClickUnadopte={handleClickUnadopte}
            />
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
