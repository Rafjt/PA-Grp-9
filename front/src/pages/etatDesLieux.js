import React, { useState, useEffect } from "react";
import { getCredentials, createEtatDesLieux, fetchBienReserve, fetchEtatDesLieux, UpdateEtatDesLieux } from "../services.js";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

function EtatDesLieux() {
    const [user, setUser] = useState(null);
    const [etatDesLieuxData, setEtatDesLieuxData] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [form, setForm] = useState({
        typeEtat: "arrivee",
        id_BienImmobilier: "",
        id_Bailleur: "",
        etatGeneral: "",
        piecesManquantes: "",
        dommagesConstates: "",
        signatureBailleur: false,
        signatureLocataire: false,
        dateEtat: new Date().toISOString().split('T')[0],
        status: "en attente" 
    });
    const [biens, setBiens] = useState([]);

    useEffect(() => {
        getCredentials().then(data => {
            setUser(data);
            console.log('User data:', data);
        });
        fetchBienReserve().then(data => {
            setBiens(data);
            console.log('Biens data:', data);
        });
        fetchEtatDesLieux().then(data => {
            console.log('Etat des lieux data:', data);
            setEtatDesLieuxData(data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");  
        createEtatDesLieux(form)
            .then(response => {
                if (response.status === 200) {
                    setSuccessMessage("Etat des lieux created successfully!");
                    console.log('EDL created successfully');
                    fetchEtatDesLieux().then(data => {
                        setEtatDesLieuxData(data);
                        console.log('Updated Etat des lieux data:', data);
                    });

                    setForm({
                        typeEtat: "arrivee",
                        id_BienImmobilier: "",
                        id_Bailleur: "",
                        etatGeneral: "",
                        piecesManquantes: "",
                        dommagesConstates: "",
                        signatureBailleur: false,
                        signatureLocataire: false,
                        dateEtat: new Date().toISOString().split('T')[0],
                        status: "en attente" 
                    });
                } else {
                    throw new Error(`Server responded with status code ${response.status}`);
                }
            })
            .catch(error => {
                console.error("Error creating etat des lieux:", error);
                setErrorMessage(`Failed to create etat des lieux. Server responded with message: ${error.message}`);
            });
    };

    const updateStatus = (id, newStatus) => {
        console.log(`Updating status of EDL with ID ${id} to ${newStatus}`);
        UpdateEtatDesLieux({ id, status: newStatus })
            .then(response => {
                if (response.status === 200) {
                    setSuccessMessage("Status updated successfully!");
                    console.log('Status updated successfully');
                    fetchEtatDesLieux().then(data => {
                        setEtatDesLieuxData(data);
                        console.log('Updated Etat des lieux data:', data);
                    });
                } else {
                    throw new Error(`Server responded with status code ${response.status}`);
                }
            })
            .catch(error => {
                console.error("Error updating status:", error);
                setErrorMessage(`Failed to update status. Server responded with message: ${error.message}`);
            });
    };

    return (
        <div>
            {successMessage && (
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            <Container className="mt-5">
                <h1>Etat des lieux</h1>
                <hr />

                <Form onSubmit={handleSubmit}>
                    <h3>Créer un nouvel EDL</h3>
                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="formBienImmobilier">
                            <Form.Label>Bien immobilier</Form.Label>
                            <Form.Control as="select" name="id_BienImmobilier" value={form.id_BienImmobilier} onChange={handleChange} required>
                                <option value="">Select...</option>
                                {Array.isArray(biens) && biens.map((bien, index) => (
                                    <option key={index} value={bien.id}>
                                        {bien.nomBien}, {bien.ville}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Row>
                    <Form.Group controlId="formEtatGeneral" className="mb-3">
                        <Form.Label>Etat général</Form.Label>
                        <Form.Control type="text" name="etatGeneral" value={form.etatGeneral} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group controlId="formPiecesManquantes" className="mb-3">
                        <Form.Label>Pièces manquantes</Form.Label>
                        <Form.Control as="textarea" rows={3} name="piecesManquantes" value={form.piecesManquantes} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group controlId="formDommagesConstates" className="mb-3">
                        <Form.Label>Dommages constatés</Form.Label>
                        <Form.Control as="textarea" rows={3} name="dommagesConstates" value={form.dommagesConstates} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group controlId="formSignatureBailleur" className="mb-3">
                        <Form.Check type="checkbox" label="Signature Bailleur" name="signatureBailleur" checked={form.signatureBailleur} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group controlId="formSignatureLocataire" className="mb-3">
                        <Form.Check type="checkbox" label="Signature Locataire" name="signatureLocataire" checked={form.signatureLocataire} onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">Submit</Button>
                </Form>
            </Container>
            <hr />
            <Container>
                <Row>
                    {etatDesLieuxData.map((item, index) => (
                        <Col md={4} key={index} className={`mb-4 ${item.status === 'valide' ? 'card-status-valide' : (item.status === 'conteste' ? 'card-status-conteste' : 'card-status-en-attente')}`}>
                            <div className="card h-100">
                                <div className="card-header">
                                    <h2 className="mb-0">{item.nomBien}</h2>
                                </div>
                                <div className="card-body">
                                    <p><strong>ID:</strong> {item.id}</p>
                                    <p><strong>Type:</strong> {item.typeEtat}</p>
                                    <p><strong>Date de début:</strong> {item.dateDebut}</p>
                                    <p><strong>Date de fin:</strong> {item.dateFin}</p>
                                    <p><strong>Etat général:</strong> {item.etatGeneral}</p>
                                    <label><strong>Pièces manquantes:</strong></label>
                                    <textarea className="form-control" defaultValue={item.piecesManquantes} readOnly></textarea>
                                    <label><strong>Dommages constatés:</strong></label>
                                    <textarea className="form-control" defaultValue={item.dommagesConstates} readOnly></textarea>
                                </div>
                                <div className="card-footer">
                                    <p><strong>Status:</strong> {item.status}</p>
                                    <button className="btn btn-danger" onClick={() => updateStatus(item.id, 'conteste')}>Contester</button>
                                    <button className="btn btn-primary" onClick={() => updateStatus(item.id, 'valide')}>Valider</button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
            <hr/>
        </div>
    );
}

export default EtatDesLieux;
