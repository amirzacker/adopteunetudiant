import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import { Table, Button, Modal, Form } from "react-bootstrap";

export default function AdoptionStudent({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedAdoptionForAccept, setSelectedAdoptionForAccept] =
    useState(null);

  const handleCloseModal = () => {
    setSelectedAdoption(null);
    setShowModal(false);
  };

  const handleCloseAcceptModal = () => {
    setSelectedAdoptionForAccept(null);
    setShowAcceptModal(false);
  };

  const handleShowModal = (adoption) => {
    setSelectedAdoption(adoption);
    setShowModal(true);
  };

  const handleAccept = (adoption) => {
    setSelectedAdoptionForAccept(adoption);
    setShowAcceptModal(true);
  };

  const handleAcceptAdoption = async (adoption) => {
    // logic to accept the adoption
    try {
      const res = await axios.put(
        `/api/adoptions/${adoption}/accepted`,
        {},
        {
          headers: { "x-access-token": currentUser.token },
        }
      );

      setMessage(" adoption acceptée avec succes");
      setSuccess(true);

    } catch (err) {
      console.log(err);
    }
    handleCloseAcceptModal();
  };
  const handleRejectAdoption = async (adoption) => {
    // logic to accept the adoption
    try {
      const res = await axios.put(
        `/api/adoptions/${adoption._id}/rejected`,
        {},
        {
          headers: { "x-access-token": currentUser.token },
        }
      );

      setMessage(" adoption rejetée avec succes");
      setSuccess(true);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    const getAdoptions = async () => {
      try {
        const res = await axios.get(`/api/adoptions/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: source.token
        });
        //setAdoption(res.data);
        setAdoption(
          res.data.filter((adoption) => adoption.status === "pending")
        );
        //console.log(res);
      } catch (err) {
        console.log(err);
      }
    };
    getAdoptions();
    return () => {
      source.cancel("Component unmounted");
    };
  }, [currentUser, adoptions]);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(adoptions.length / itemsPerPage);
  const paginatedData = adoptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //console.log(currentUser?.token);

  const handleChange = (event, page) => {
    setCurrentPage(page);
  };



  function convertDate(date) {
    const month = date.toLocaleString("fr", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${day} ${month}  ${year}`;
  }

  return (
    <div>
      <h2>Adoption en cours</h2>
      {success ? <FlashMessage message={message} color={true} /> : ""}
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Actions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((adoption, index) => (
                  <tr key={index}>
                    <td>{adoption.adopter?.name}</td>
                    <td>{adoption.adopter?.city}</td>
                    <td>{convertDate(new Date(adoption?.createdAt))}</td>
                    <td>{adoption.status}</td>
                    <td>
                      <button
                        className="btn btn-success mr-2"
                        onClick={() => handleAccept(adoption)}
                      >
                        Accepter
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRejectAdoption(adoption)}
                      >
                        Rejeter
                      </button>
                    </td>
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
                  <span className="visually">Pas d'adoption encours...</span>
                </td>
              </tr>
              
              )}
            </tbody>
          </table>
        </div>
        {selectedAdoptionForAccept && (
          <Modal show={showAcceptModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer l'adoption</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Êtes-vous sûr de vouloir accepter l'adoption pour{" "}
                {selectedAdoptionForAccept?.adopter?.name} ? Dans ce cas vous
                vous engagiez à ...{" "}
                <Link style={{ color: "red", fontWeight: "bold" }} to="/cgu">
                  condition d'utilisation
                </Link>
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAcceptModal}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  handleAcceptAdoption(selectedAdoptionForAccept._id)
                }
              >
                Confirmer
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {selectedAdoption && (
          <Modal show={!!selectedAdoption} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Details de l'entreprise</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="d-flex justify-content-center mt-3 ">
                  <img
                    style={{ width: "10rem" }}
                    className="card-img-top w-65 "
                    src={`${PF + selectedAdoption?.adopter?.profilePicture}`}
                    alt="Card cap"
                  />
                </div>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Nom
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.name}
                    disabled
                  />
                </Form.Group>
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.email}
                    disabled
                  />
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Adresse
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopter.city}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Valeur de l'entreprise
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows="10"
                    type="texte"
                    value={selectedAdoption?.adopter.desc}
                    disabled
                  />
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
