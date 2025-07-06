import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@material-ui/lab";
import { useCallback } from "react";
import FlashMessage from "../alert/FlashMessage";
import { Table, Button, Modal, Form } from "react-bootstrap";

export default function ContractsStudent({ currentUser }) {
  const [contracts, setContract] = useState([]);


  const [success, setSuccess] = useState(false);

  const [message, setMessage] = useState("");

  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedAdoptionForAccept, setSelectedAdoptionForAccept] =
    useState(null);

  const handleCloseModal = () => {
    setSelectedContract(null);
    setShowModal(false);
  };

  const handleCloseAcceptModal = () => {
    setSelectedAdoptionForAccept(null);
    setShowAcceptModal(false);
    handleCloseModal(); // <- call handleCloseModal function
  };

  const handleShowModal = (contract) => {
    setSelectedContract(contract);
    setShowModal(true);
  };

  const handleAccept = (contract) => {
    setSelectedAdoptionForAccept(contract);
    setShowAcceptModal(true);
  };

  const handleAcceptContract = async (contract) => {
    // logic to accept the adoption
    try {
      const res = await axios.put(
        `/api/contracts/active/${contract}`,
        {},
        {
          headers: { "x-access-token": currentUser.token },
        }
      );

      setMessage(" contrat signé  avec succes");
      setSuccess(true);

    } catch (err) {
      console.log(err);
    }
    handleCloseAcceptModal();
  };
 

  useEffect(() => {
    const source = axios.CancelToken.source();
    const getAdoptions = async () => {
      try {
        const res = await axios.get(`/api/contracts/${currentUser?.user?._id}`, {
          headers: { "x-access-token": currentUser.token },
          cancelToken: source.token
        });
        //setAdoption(res.data);
        setContract(
          res.data.filter((contract) => contract.status === "pending")
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
  }, [currentUser, contracts]);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pages = Math.ceil(contracts.length / itemsPerPage);
  const paginatedData = contracts.slice(
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

  function calculateDuration(startDate, endDate) {
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const duration = (endMonth - startMonth) + (12 * (endDate.getFullYear() - startDate.getFullYear()));
    return duration;
  }
  

  return (
    <div>
      <h2>Contrats en cours</h2>
      {success ? <FlashMessage message={message} color={true} /> : ""}
      <>
        <div className="table-responsive">
          <table className="table table-striped striped bordered hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Durée</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((contract, index) => (
                  <tr key={index}>
                    <td>{contract.student?.searchType?.name}</td>
                    <td>{calculateDuration(new Date(contract?.startDate) , new Date(contract?.endDate))} {""}mois </td>
                    <td>{convertDate(new Date(contract?.createdAt))}</td>
                    <td>{contract.status}</td>
                    <td>
                      <button
                        className="btn btn-success mr-2"
                        onClick={() => handleAccept(contract)}
                      >
                        Signer
                      </button>
                    </td>
                
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowModal(contract)}
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
                <span className="visually">Pas de contrat encours...</span>
                </td>
              </tr>
              
              )}
            </tbody>
          </table>
        </div>
        {selectedAdoptionForAccept && (
          <Modal show={showAcceptModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmation du contrat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Êtes-vous sûr de vouloir signer ce contract de : {" "}
                {selectedAdoptionForAccept?.student?.searchType?.name} ? Dans ce cas vous
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
                  handleAcceptContract(selectedAdoptionForAccept._id)
                }
              >
                Confirmer
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {selectedContract && (
          <Modal show={!!selectedContract} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Details du Contract</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formAdopterName">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Type
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedContract?.student.searchType?.name}
                    disabled
                  />
                </Form.Group>
                <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Durée
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={calculateDuration(new Date(selectedContract?.startDate) , new Date(selectedContract?.endDate)) +  " mois"} 
                    disabled
                  />
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Date
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={convertDate(new Date(selectedContract?.createdAt))}
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formPet">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Entreprise : 
                  </Form.Label>
                  <br/>
                  {""}
                  {selectedContract?.company?.name} {" basée à  : "} {selectedContract?.company?.city}
                  {" dans le domaine : "} {selectedContract?.student.domain?.name}
                 
                </Form.Group>
                <Form.Group controlId="formStatus">
                  <Form.Label style={{ color: "red", fontWeight: "bold" }}>
                    Termes du contract
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows="10"
                    type="texte"
                    value={selectedContract?.terms}
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
