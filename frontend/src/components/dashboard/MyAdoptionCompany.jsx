import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import FlashMessage from "../alert/FlashMessage";
import { Button, Modal, Form } from "react-bootstrap";

export default function MyAdoptionCompany({ currentUser }) {
  const [adoptions, setAdoption] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAdoptionForContract, setSelectedAdoptionForContract] =
    useState(null);

  const startDate = useRef();
  const endDate = useRef();
  const terms = useRef();

  const handleCloseModal = () => {
    setSelectedAdoption(null);
  };

  const handleCloseAcceptModal = () => {
    setSelectedAdoptionForContract(null);
    setShowCancelModal(false);
  };

  const handleShowModal = (adoption) => {
    setSelectedAdoption(adoption);
  };

  const handleCancel = (adoption) => {
    setSelectedAdoptionForContract(adoption);
    setShowCancelModal(true);
  };

 

  useEffect(() => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
        // Logic for handling form submit here
    const data = {
      companyId: currentUser?.user._id,
      studentId: selectedAdoptionForContract?.adopted?._id,
      startDate: startDate.current.value,
      endDate: endDate.current.value,
      terms: terms.current.value,
    };
      const res = await axios.post(`/api/contracts/`, data, {
        headers: { "x-access-token": currentUser.token },
      });

      if (res.status === 201) {
        handleCloseAcceptModal()
        setMessage(" contrat créé avec succes");
        setSuccess(true);
      }
    } catch (err) {
      console.log(err);
    }

  };

  return (
    <div>
      <h2>Adoptions acceptées</h2>
      {success ? <FlashMessage message={message} color={true} /> : ""}
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
                    <td>{convertDate(new Date(adoption?.updatedAt))}</td>
                    <td>{adoption.status}</td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleCancel(adoption)}
                      >
                        Signer un contrat
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
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(adoption)}
                      >
                        Contacter
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
        {selectedAdoptionForContract && (
          <Modal show={showCancelModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Créer un contrat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="form-container" onSubmit={onSubmit}>
                 <div className="form-group">
                    <label className="form-label">Date de debut</label>
                    <input
                  className="form-control"
                  type="date"
                  name="startDate"
                  placeholder="Email"
                  ref={startDate}
                  onChange={(e) => e.target.value}
                  required
                />
                </div>
                 <div className="form-group">
                    <label className="form-label">Type</label>
                    <input
                  className="form-control"
                  type="text"
                  value={selectedAdoptionForContract?.adopted?.searchType?.name}
                  disabled
                />
                </div>
                 <div className="form-group">
                    <label className="form-label">Date de fin</label>
                    <input
                  className="form-control"
                  type="date"
                  name="endDate"
                  placeholder="Email"
                  ref={endDate}
                  onChange={(e) => e.target.value}
                  required
                />
                </div>
                 <div className="form-group">
                    <label className="form-label">Termes du contract </label>
                    <textarea
                  className="form-control"
                  rows="10"
                  name="terms"
                  placeholder="la convention ..."
                  ref={terms}
                  onChange={(e) => e.target.value}
                  required
                />
                </div>

                <div className="form-group submit-subscribe-button-div">
                    <input type="submit" className="form-control form-control-lg submit-subscribe-button" value="Créer"/>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseAcceptModal}>
                Annuler
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
