import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import { Table, Button, Modal, Form } from "react-bootstrap";

export default function HistoryStudent({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);
  const [adoptionForDate, setAdoptionForDate] = useState(null);
  const [contractForDate, setContractForDate] = useState(null);
  const [contactForDate, setContactForDate] = useState(null);


  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showModal, setShowModal] = useState(false);

    useState(null);


  const handleCloseModal = () => {
    setSelectedAdoption(null);
    setShowModal(false);
  };


  const handleShowModal = (adoption) => {
    setSelectedAdoption(adoption);
    setShowModal(true);
  };



  useEffect(() => {
    if (!currentUser?.user?._id || !currentUser?.token) return;
    const source = axios.CancelToken.source();
    const getAdoptions = async () => {
      try {
        const res = await axios.get(`/api/adoptions/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: source.token
        });
        setAdoption(
          res.data.filter((adoption) => adoption.status === "accepted")
        );
      } catch (err) {
        console.log(err);
      }
    };
    getAdoptions();
    return () => {
      source.cancel("Component unmounted");
    };
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


  function convertDate(date) {
    const month = date.toLocaleString("fr", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${day} ${month}  ${year}`;
  }

  function calculateDuration(startDate, endDate) {
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const duration = (endMonth - startMonth) + (12 * (endDate.getFullYear() - startDate.getFullYear()));
    return duration;
  }

  const calculateRemainingDuration = (startDate, endDate) => {
    const totalDuration = calculateDuration(startDate, endDate);
    const elapsedTime = Date.now() - startDate.getTime();
    const elapsedDuration = Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 30));
    const remainingDuration = totalDuration - elapsedDuration;
    return remainingDuration;
  }

  useEffect(() => {
    if (!selectedAdoption?.adopted?._id || !currentUser?.token) return;

    const adoptionSource = axios.CancelToken.source();
    const contractSource = axios.CancelToken.source();
    const contactSource = axios.CancelToken.source();
    const getAdoption = async () => {
      try {
        const res = await axios.get(`/api/adoptions/history/${selectedAdoption?.adopter?._id}/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: adoptionSource.token
        });
        setAdoptionForDate(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    const getContract = async () => {
      try {
        const res = await axios.get(`/api/contracts/history/${selectedAdoption?.adopter?._id}/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: contractSource.token
        });
        setContractForDate(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    const getContact = async () => {
      try {
        const res = await axios.get(`/api/conversations/find/${selectedAdoption?.adopter?._id}/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: contactSource.token
        });
        setContactForDate(res.data);
      } catch (err) {
        console.log(err);
      }
    };

      getAdoption();
      getContract();
      getContact();
      return () => {
        adoptionSource.cancel();
        contractSource.cancel();
        contactSource.cancel();
      };
  }, [selectedAdoption?.adopted?._id, currentUser?.token]);


  return (
    <div>
      <h2>Mes Historiques</h2>
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((adoption, index) => (
                  <tr key={index}>
                    <td>{adoption.adopter?.name}</td>
                    <td>{adoption.adopter?.city}</td>
                    <td>{adoption.adopter?.email}</td>

                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(adoption)}
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                <td colSpan="7" className="">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                <span className="visually">Pas d'historique encours...</span>
                </td>
              </tr>

              )}
            </tbody>
          </table>
        </div>


        {selectedAdoption && (
          <Modal show={!!selectedAdoption} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Details de l'historique</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Adoption :
                  </Form.Label>
                    <br/>
                    Demande : {" "} { adoptionForDate ? convertDate(new Date(adoptionForDate?.createdAt)) :  "en cours"}
                    <br/>
                    <br/>
                    Acceptation : {" "} { adoptionForDate ? convertDate(new Date(adoptionForDate?.updatedAt)) :  "en cours"}
                    <br/>
                    <br/>
                </Form.Group>
                <Form.Group controlId="formPet">
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Prise de contact :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={ contactForDate ? convertDate(new Date(contactForDate?.createdAt)) :  "en cours"}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formPet">
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                Contrat :
                </Form.Label>
                <br/>
                Envoi : {" "} { contractForDate ? convertDate(new Date(contractForDate?.createdAt)) :  "en cours"}
                    <br/>
                    <br/>
                Signature : {" "} { contractForDate ? convertDate(new Date(contractForDate?.updatedAt)) :  "en cours"}
                    <br/>
                    <br/>
                Type : {" "} { contractForDate ?   contractForDate.student?.searchType?.name : "en cours"}
                    <br/>
                    <br/>
                Durée : {" "} { contractForDate ? calculateDuration(new Date(contractForDate?.startDate) , new Date(contractForDate?.endDate)) + " mois " :  "en cours"}
                    <br/>
                    <br/>
                Durée restante : {" "} { contractForDate ? calculateRemainingDuration(new Date(contractForDate?.startDate) , new Date(contractForDate?.endDate)) + " mois " :  "en cours"}
                    <br/>
                    <br/>

                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                Suivi:
                  </Form.Label>
                  <br/>
                1er : {" "} { contractForDate ? /* convertDate(new Date(contractForDate?.createdAt)) */ " fn en attente ":  "en cours"}
                    <br/>
                    <br/>
                2e : {" "} { contractForDate ? /* convertDate(new Date(contractForDate?.updatedAt)) */ " fn en attente " :  "en cours"}
                    <br/>
                    <br/>
                3e : {" "} { contractForDate ?  /*  contractForDate.student?.searchType?.name */ " fn en attente " : "en cours"}
                    <br/>


                </Form.Group>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </>
      <div className="d-flex justify-content-center mt-3">
        <Pagination count={pages} page={currentPage} onChange={handleChange} />
      </div>
    </div>
  );
}
