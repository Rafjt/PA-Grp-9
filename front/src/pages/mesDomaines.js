import React, { useEffect, useState } from "react";
import { fetchDomaines, createDemandeCertification } from "../services.js";
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function MesDomaines() {
    const { t } = useTranslation();
    const [domaines, setDomaines] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDomaine, setSelectedDomaine] = useState('');
    const [documentMessage, setDocumentMessage] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState(null);

    useEffect(() => {
        fetchDomaines().then(data => {
            console.log(data);
            setDomaines(data);
        });
        const status = localStorage.getItem('submissionStatus');
        if (status) {
            setSubmissionStatus(status);
            localStorage.removeItem('submissionStatus');
        }
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedDomaine(selectedValue);

        const messages = {
            'Conciergerie': t('conciergerieMessage'),
            'Entretien ménager': t('entretienMessage'),
            'Maintenance': t('maintenanceMessage'),
            'Jardinage et entretien extérieur': t('jardinageMessage'),
            'Livraison': t('livraisonMessage'),
            'Gestion des déchets': t('dechetsMessage'),
            'Soutien administratif': t('soutienMessage'),
            'Déménagement': t('demenagementMessage'),
            'Chauffeur': t('chauffeurMessage'),
            'Sécurité': t('securiteMessage'),
        };

        setDocumentMessage(messages[selectedValue] || '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedDomaine || !selectedFile) {
            setSubmissionStatus(t('fillAllFields'));
            return;
        }

        const formData = new FormData();
        formData.append('domaine', selectedDomaine);
        formData.append('file', selectedFile);

        try {
            await createDemandeCertification(formData);
            localStorage.setItem('submissionStatus', t('submissionSuccess'));
            setSelectedDomaine('');
            setSelectedFile(null);
            setDocumentMessage('');
        }
        catch (error) {
            localStorage.setItem('submissionStatus', t('submissionError'));
        }

        window.location.reload();
    };

    return (
        <div>
            <h1>{t('mesDomaines')}</h1>
            <hr />
            <h2>{t('domaineCertification')}</h2>
            {domaines.length === 0 ? (
                <p>{t('noCertification')}</p>
            ) : (
                <p>{t('currentCertification')} {domaines.map((domaine, index) => (
                    <strong key={index}>{domaine.domaine}</strong>
                ))}</p>
            )}
            <p>{t('certificationNote')}</p>
            
            <Form onSubmit={handleSubmit}>
                <h3>{t('requestCertification')}</h3>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formDomaine">
                        <Form.Label>{t('domaine')}</Form.Label>
                        <Form.Control as="select" value={selectedDomaine} onChange={handleSelectChange} required>
                            <option value="">{t('select')}</option>
                            <option value="Conciergerie">{t('conciergerie')}</option>
                            <option value="Entretien ménager">{t('entretien')}</option>
                            <option value="Maintenance">{t('maintenance')}</option>
                            <option value="Jardinage et entretien extérieur">{t('jardinage')}</option>
                            <option value="Livraison">{t('livraison')}</option>
                            <option value="Gestion des déchets">{t('dechets')}</option>
                            <option value="Soutien administratif">{t('soutien')}</option>
                            <option value="Déménagement">{t('demenagement')}</option>
                            <option value="Chauffeur">{t('chauffeur')}</option>
                            <option value="Sécurité">{t('securite')}</option>
                        </Form.Control>
                    </Form.Group>
                </Row>
                {documentMessage && (
                    <div className="mb-3">
                        <p><strong>{t('requiredDocuments')}</strong> {documentMessage}</p>
                    </div>
                )}
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>{t('file')}</Form.Label>
                    <Form.Control type="file" accept=".pdf" onChange={handleFileChange} required />
                </Form.Group>
                <Button variant="primary" type="submit">{t('submit')}</Button>
                {submissionStatus && (
                    <div className="mt-3">
                        <p>{submissionStatus}</p>
                    </div>
                )}
            </Form>
        </div>
    );
}

export default MesDomaines;
