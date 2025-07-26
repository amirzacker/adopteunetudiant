import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import { Table, Button, Modal, Form } from "react-bootstrap";

export default function AdoptionCompany({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAdoptionForCancel, setSelectedAdoptionForCancel] =
    useState(null);

  const [searchStatus, setSearchStatus] = useState("");
  const handleSatus = useCallback((event) => {
    event.preventDefault();
    setSearchStatus(event.target.value);
  }, []);

  const [filteredAdoptions, setFilteredUsers] = useState([]);
  useEffect(() => {
    setFilteredUsers(
      adoptions.filter((adoption) =>
        adoption?.status?.toLowerCase().includes(searchStatus.toLowerCase())
      )
    );
  }, [searchStatus, adoptions]);

  const handleCloseModal = () => {
    setSelectedAdoption(null);
    setShowModal(false);
  };

  const handleCloseAcceptModal = () => {
    setSelectedAdoptionForCancel(null);
    setShowCancelModal(false);
  };

  const handleShowModal = (adoption) => {
    setSelectedAdoption(adoption);
    setShowModal(true);
  };

  const handleCancel = (adoption) => {
    setSelectedAdoptionForCancel(adoption);
    setShowCancelModal(true);
  };

  const handleCancelAdoption = async (adoption) => {
    // logic to accept the adoption
    try {
      const res = await axios.delete(
        `/api/adoptions/${adoption}/`,
        {
          headers: { "x-access-token": currentUser.token },
        }
      );

      setMessage("adoption annulé avec succes ");
      setSuccess(true);

    } catch (err) {
      // Error handled silently
    }
    handleCloseAcceptModal();

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
          res.data.filter((adoption) => adoption.status !== "accepted")
        );
      } catch (err) {
        // Error handled silently
      }
    };
    getAdoptions();
    return () => {
      source.cancel("Component unmounted");
    };
  }, [currentUser, adoptions]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(filteredAdoptions.length / itemsPerPage);
  const paginatedData = filteredAdoptions.slice(
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

  return (
    <div>
      <h2>Adoptions</h2>
      {success ? <FlashMessage message={message} color={true} /> : ""}
      <div className="form">
        <form className="container" style={{ display: "flex" }}>
          <div>
            <select
              className="form-control  border border-danger "
              onChange={handleSatus}
            >
              <option value="">Filtrer mes adoptions</option>
              <option value="pending">en attente</option>
              <option value="rejected">rejettée</option>
            </select>
          </div>
        </form>
      </div>
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Recherche</th>
                <th>Domaine</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((adoption, index) => (
                  <tr key={index}>
                    <td>{adoption.adopted?.lastname}</td>
                    <td>{adoption.adopted?.searchType?.name}</td>
                    <td>{adoption.adopted?.domain?.name}</td>
                    <td>{convertDate(new Date(adoption?.createdAt))}</td>
                    <td>{adoption.status}</td>
                    <td>
                      {adoption.status === "pending" ? (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancel(adoption)}
                        >
                          Annuler
                        </button>
                      ) : null}
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
        {selectedAdoptionForCancel && (
          <Modal show={showCancelModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer l'annulation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Êtes-vous sûr de vouloir annuler l'adoption de{" "}
                {selectedAdoptionForCancel?.adopted?.lastname} ? Dans ce cas
                vous vous engagiez à ...{" "}
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
                  handleCancelAdoption(selectedAdoptionForCancel._id)
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
              <Modal.Title>Details de l'étudiant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="d-flex justify-content-center mt-3 ">
                  <img
                    style={{ width: "10rem" }}
                    className="card-img-top w-65 "
                    src={`${PF + selectedAdoption?.adopted?.profilePicture}`}
                    alt="Card cap"
                  />
                </div>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Nom :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopted.lastname}
                    disabled
                  />
                </Form.Group>
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                  Recherche :
                </Form.Label>
                <Form.Control
                  type="text"
                  value={selectedAdoption?.adopted.searchType?.name}
                  disabled
                />
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Domain :
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedAdoption?.adopted.domain?.name}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Description :
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows="10"
                    type="texte"
                    value={selectedAdoption?.adopted.desc}
                    disabled
                  />
                </Form.Group>
                <Link to={"/student/" + selectedAdoption?.adopted?._id}>
                  <h6 className="btn btn-secondary btn-bg w-100 my-2">
                    Visiter le profil
                  </h6>
                </Link>
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
