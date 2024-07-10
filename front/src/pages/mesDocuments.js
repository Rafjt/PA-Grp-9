import React, { useState, useEffect } from "react";
import { getCredentials, fetchFinanceByUserId,BASE_URL } from "../services";
import './mesDocuments.css'; 

function MesDocuments() {
    const [finances, setFinances] = useState([]);

    useEffect(() => {
        getCredentials().then(data => {
            console.log(data);
            fetchFinanceByUserId(data.id).then(financeData => {
                setFinances(financeData);
                console.log(financeData);
            });
        });
    }, []);

    const financeTypes = [...new Set(finances.map(finance => finance.type))];

    const handleDownload = (finance) => {
        const url = `${BASE_URL}/download/${finance.nomDocument}`;
        console.log(url);
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = finance.nomDocument;
                document.body.appendChild(link); 
                link.click();
                document.body.removeChild(link); 
    
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
            })
            .catch(error => console.error('Error:', error));
    };
    
    const renderTable = (financeArray) => (
        <table className="financeTable">
            <thead>
                <tr>
                    <th>Montant</th>
                    <th>Type</th>
                    <th>Date Transaction</th>
                    <th>Document Name</th>
                    <th>Download</th>
                </tr>
            </thead>
            <tbody>
                {financeArray.map((finance, index) => (
                    <tr key={index}>
                        <td>{finance.montant} €</td>
                        <td>{finance.type}</td>
                        <td>{finance.dateTransaction}</td>
                        <td>{finance.nomDocument}</td>
                        <td><button onClick={() => handleDownload(finance)}>Download</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="container">
            <h1 className="titleDoc">Mes Documents</h1>
            <hr />
            {financeTypes.map(type => {
                const financesByType = finances.filter(finance => finance.type === type);
                return (
                    <div key={type}>
                        <h2>{type}</h2>
                        {renderTable(financesByType)}
                    </div>
                );
            })}
        </div>
    );
}

export default MesDocuments;